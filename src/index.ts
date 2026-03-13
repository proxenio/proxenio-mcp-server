#!/usr/bin/env node

// Proxenio MCP Server
// Enables AI agents to discover, authenticate, and interact with the
// Proxenio verified intent network through the Model Context Protocol.
//
// Transport options:
//   stdio (default): For local use with Claude Desktop, Cursor, etc.
//   http: For remote deployment as a web service.
//
// Usage:
//   TRANSPORT=stdio node dist/index.js     (or just: node dist/index.js)
//   TRANSPORT=http PORT=3000 node dist/index.js

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { registerTools } from "./tools/register.js";

// Initialize the MCP server
const server = new McpServer({
  name: "proxenio-mcp-server",
  version: "1.1.0",
});

// Register all Proxenio tools
registerTools(server);

/**
 * Run in stdio mode — for local clients like Claude Desktop and Cursor.
 */
async function runStdio(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Proxenio MCP server running on stdio");
}

/**
 * Run in HTTP mode — for remote deployment.
 */
async function runHTTP(): Promise<void> {
  const app = express();
  app.use(express.json());

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "proxenio-mcp-server", version: "1.1.0" });
  });

  // MCP endpoint
  app.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT ?? "3001", 10);
  app.listen(port, () => {
    console.error(`Proxenio MCP server running on http://localhost:${port}/mcp`);
  });
}

// Choose transport based on environment
const transport = process.env.TRANSPORT ?? "stdio";

if (transport === "http") {
  runHTTP().catch((error: unknown) => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio().catch((error: unknown) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
