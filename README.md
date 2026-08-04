# mcp-slack_connect

Slack MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `slack_list_channels` | List channels in the Slack workspace. Returns channel names, IDs, and metadata. |
| `slack_channel_history` | Get message history from a Slack channel. Bot auto-joins the channel if needed. |
| `slack_send_message` | Send a message to a Slack channel. Bot auto-joins the channel if needed. |
| `slack_list_users` | List users in the Slack workspace. Returns user profiles, IDs, and status. |
| `slack_join_channel` | Join a public Slack channel so the bot can read history and post messages. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "slack_connect": {
      "url": "https://gateway.pipeworx.io/slack_connect/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Slack_connect data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
