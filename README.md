# mcp-slack_connect

Slack MCP Pack

Part of the [Pipeworx](https://pipeworx.io) open MCP gateway.

## Tools

| Tool | Description |
|------|-------------|
| `slack_list_channels` | List channels in the Slack workspace. Returns channel names, IDs, and metadata. |
| `slack_channel_history` | Get message history from a Slack channel. Bot auto-joins the channel if needed. |
| `slack_send_message` | Send a message to a Slack channel. Bot auto-joins the channel if needed. |
| `slack_list_users` | List users in the Slack workspace. Returns user profiles, IDs, and status. |
| `slack_join_channel` | Join a public Slack channel so the bot can read history and post messages. |

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "slack_connect": {
      "url": "https://gateway.pipeworx.io/slack_connect/mcp"
    }
  }
}
```

Or use the CLI:

```bash
npx pipeworx use slack_connect
```

## License

MIT
