# Proxenio MCP Server

MCP (Model Context Protocol) server for the **Proxenio verified intent network**. Enables AI agents running in Claude Desktop, Cursor, VS Code, and other MCP-compatible clients to discover and interact with Proxenio's professional matching engine.

## What It Does

This server gives your AI agent four tools:

| Tool | What it does |
|------|-------------|
| `proxenio_discover` | Learn about the platform, trust model, and API — no auth required |
| `proxenio_set_api_key` | Configure your Proxenio API key for authentication |
| `proxenio_get_matches` | Read your principal's verified professional matches |
| `proxenio_accept_match` | Accept an introduction request, creating a deal |

Your agent inherits the human principal's trust tier. It sees exactly what the principal sees — same matching engine, same rules, same skip layers. No shortcuts.

## Prerequisites

- **Node.js** 18+ 
- A **Proxenio account** with a verified email and completed profile
- An **API key** generated at [proxenio.ai/agents](https://www.proxenio.ai/agents)

## Installation

```bash
# Clone or download
git clone https://github.com/proxenio/proxenio-mcp-server.git
cd proxenio-mcp-server

# Install dependencies
npm install

# Build
npm run build
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "proxenio": {
      "command": "node",
      "args": ["/path/to/proxenio-mcp-server/dist/index.js"]
    }
  }
}
```

Then in Claude Desktop, you can say:

> "What is Proxenio?"  
> → Claude uses `proxenio_discover` automatically

> "Connect to Proxenio with this key: prx_abc123..."  
> → Claude uses `proxenio_set_api_key`

> "Show me my professional matches"  
> → Claude uses `proxenio_get_matches`

> "Accept the introduction from Maria Georgiou"  
> → Claude uses `proxenio_accept_match`

## Usage with Cursor

Add to your Cursor MCP settings:

```json
{
  "proxenio": {
    "command": "node",
    "args": ["/path/to/proxenio-mcp-server/dist/index.js"]
  }
}
```

## Remote Deployment (HTTP)

For multi-client or cloud deployment:

```bash
TRANSPORT=http PORT=3001 node dist/index.js
```

The server exposes:
- `POST /mcp` — MCP protocol endpoint
- `GET /health` — Health check

## Tools Reference

### `proxenio_discover`

No authentication required. Returns platform info, trust model, capabilities, and links.

### `proxenio_set_api_key`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `api_key` | string | Yes | Full API key (36 chars, starts with `prx_`) |

### `proxenio_get_matches`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `filter_type` | `all\|premium\|strong\|regular` | `all` | Filter by match quality |
| `filter_status` | `all\|pending\|accepted` | `all` | Filter by status |
| `min_score` | number (40-100) | `40` | Minimum match score |

Returns: Principal info, matches with counterparty profiles, trust tiers, scores, and rate limit status.

### `proxenio_accept_match`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `match_id` | string (UUID) | Yes | Match ID from `proxenio_get_matches` |

Returns: Confirmation, counterparty details, new deal ID, rate limit status.

**Guard rails**: Principal must be the receiving party. Cannot accept own requests. Match must be active with a pending intro.

## Trust Model

- Agents inherit their human principal's trust tier at request time
- Trust tiers: 0 (Unverified) → 1 (Starter) → 2 (Active) → 3 (Trusted) → 4 (Proven)
- All 5 skip engine layers apply — agents cannot bypass any
- Counterparties see transparency badge: `🤖 AI Agent active on behalf of [Name]`
- Only humans can log outcomes and confirm deals

## Rate Limits

- 60 requests/hour per API key
- 3 keys maximum per user (= 180 requests/hour total)
- Rate limit headers included in all responses

## Security

- API keys are never logged or stored by the MCP server
- Keys are validated on format before use (prefix, length)
- All communication uses HTTPS
- The MCP server acts as a pass-through — no data is cached

## Links

- **Platform**: [proxenio.ai](https://www.proxenio.ai)
- **Agent Docs**: [proxenio.ai/agents/docs](https://www.proxenio.ai/agents/docs)
- **Discovery Manifest**: [.well-known/proxenio.json](https://www.proxenio.ai/.well-known/proxenio.json)
- **OpenAPI Spec**: [api/agent/openapi.json](https://www.proxenio.ai/api/agent/openapi.json)

## License

MIT — Proxenio Technologies Ltd
