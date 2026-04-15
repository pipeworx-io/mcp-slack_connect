interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Slack MCP Pack
 *
 * Requires OAuth connection — gateway injects credentials via _context.slack.
 * Tools: list channels, channel history, send message, list users, join channel.
 * Bot auto-joins channels before reading history or sending messages.
 */


interface SlackContext {
  slack?: { accessToken: string };
}

const BASE = 'https://slack.com/api';

async function slackFetch(ctx: SlackContext, method: string, params: Record<string, string> = {}) {
  if (!ctx.slack) {
    return { error: 'connection_required', message: 'Connect your Slack account at https://pipeworx.io/account' };
  }
  const { accessToken } = ctx.slack;
  const url = new URL(`${BASE}/${method}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Slack API error (${res.status}): ${text}`);
  }
  return res.json();
}

async function slackPost(ctx: SlackContext, method: string, body: Record<string, unknown>) {
  if (!ctx.slack) {
    return { error: 'connection_required', message: 'Connect your Slack account at https://pipeworx.io/account' };
  }
  const { accessToken } = ctx.slack;
  const res = await fetch(`${BASE}/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Slack API error (${res.status}): ${text}`);
  }
  return res.json();
}

async function ensureInChannel(ctx: SlackContext, channel: string) {
  await slackPost(ctx, 'conversations.join', { channel });
}

const tools: McpToolExport['tools'] = [
  {
    name: 'slack_list_channels',
    description: 'List channels in the Slack workspace. Returns channel names, IDs, and metadata.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Max number of channels to return (default 100, max 1000)' },
        cursor: { type: 'string', description: 'Pagination cursor for next page of results' },
        types: { type: 'string', description: 'Comma-separated channel types: public_channel, private_channel, mpim, im (default "public_channel")' },
      },
    },
  },
  {
    name: 'slack_channel_history',
    description: 'Get message history from a Slack channel. Bot auto-joins the channel if needed.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        channel: { type: 'string', description: 'Channel ID (e.g., "C01234ABCDE")' },
        limit: { type: 'number', description: 'Max number of messages to return (default 20, max 1000)' },
        cursor: { type: 'string', description: 'Pagination cursor for next page of results' },
        oldest: { type: 'string', description: 'Only messages after this Unix timestamp' },
        latest: { type: 'string', description: 'Only messages before this Unix timestamp' },
      },
      required: ['channel'],
    },
  },
  {
    name: 'slack_send_message',
    description: 'Send a message to a Slack channel. Bot auto-joins the channel if needed.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        channel: { type: 'string', description: 'Channel ID to send the message to' },
        text: { type: 'string', description: 'Message text (supports Slack markdown)' },
        thread_ts: { type: 'string', description: 'Thread timestamp to reply in a thread (optional)' },
      },
      required: ['channel', 'text'],
    },
  },
  {
    name: 'slack_list_users',
    description: 'List users in the Slack workspace. Returns user profiles, IDs, and status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Max number of users to return (default 100, max 1000)' },
        cursor: { type: 'string', description: 'Pagination cursor for next page of results' },
      },
    },
  },
  {
    name: 'slack_join_channel',
    description: 'Join a public Slack channel so the bot can read history and post messages.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        channel: { type: 'string', description: 'Channel ID to join' },
      },
      required: ['channel'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const context = (args._context ?? {}) as SlackContext;
  delete args._context;

  switch (name) {
    case 'slack_list_channels': {
      const params: Record<string, string> = {};
      if (args.limit) params.limit = String(args.limit);
      if (args.cursor) params.cursor = args.cursor as string;
      if (args.types) params.types = args.types as string;
      return slackFetch(context, 'conversations.list', params);
    }
    case 'slack_channel_history': {
      await ensureInChannel(context, args.channel as string);
      const params: Record<string, string> = { channel: args.channel as string };
      if (args.limit) params.limit = String(args.limit);
      if (args.cursor) params.cursor = args.cursor as string;
      if (args.oldest) params.oldest = args.oldest as string;
      if (args.latest) params.latest = args.latest as string;
      return slackFetch(context, 'conversations.history', params);
    }
    case 'slack_send_message': {
      await ensureInChannel(context, args.channel as string);
      const body: Record<string, unknown> = {
        channel: args.channel,
        text: args.text,
      };
      if (args.thread_ts) body.thread_ts = args.thread_ts;
      return slackPost(context, 'chat.postMessage', body);
    }
    case 'slack_list_users': {
      const params: Record<string, string> = {};
      if (args.limit) params.limit = String(args.limit);
      if (args.cursor) params.cursor = args.cursor as string;
      return slackFetch(context, 'users.list', params);
    }
    case 'slack_join_channel':
      return slackPost(context, 'conversations.join', { channel: args.channel });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 10 }, provider: 'slack' } satisfies McpToolExport;
