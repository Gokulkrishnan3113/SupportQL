import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as mysql from "mysql2/promise";

// MCP Server setup
const server = new Server(
    {
        name: "mcp-server/mysql",
        version: "0.1.0",
    },
    {
        capabilities: {
            resources: {},
            tools: {},
        },
    },
);

// Get DB connection string
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("Please provide a MySQL connection URI as an argument");
    process.exit(1);
}

const databaseUrl = args[0];
const resourceBaseUrl = new URL(databaseUrl);
resourceBaseUrl.protocol = "mysql:";
resourceBaseUrl.password = "";

// Create MySQL pool
const pool = mysql.createPool({ uri: databaseUrl });
const SCHEMA_PATH = "schema";

// List available tables
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const [rows] = await pool.query<any[]>(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()"
    );
    return {
        resources: rows.map((row: any) => ({
            uri: new URL(`${row.table_name}/${SCHEMA_PATH}`, resourceBaseUrl).href,
            mimeType: "application/json",
            name: `"${row.table_name}" table schema`,
        })),
    };
});

// Fetch table schema
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const resourceUrl = new URL(request.params.uri);
    const pathComponents = resourceUrl.pathname.split("/");
    const schema = pathComponents.pop();
    const tableName = pathComponents.pop();

    if (schema !== SCHEMA_PATH) {
        throw new Error("Invalid resource URI");
    }

    const [rows] = await pool.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ? AND table_schema = DATABASE()",
        [tableName]
    );

    return {
        contents: [
            {
                uri: request.params.uri,
                mimeType: "application/json",
                text: JSON.stringify(rows, null, 2),
            },
        ],
    };
});

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "query",
                description: "Run a read-only SQL query",
                inputSchema: {
                    type: "object",
                    properties: {
                        sql: { type: "string" },
                    },
                },
            },
        ],
    };
});

// Handle tool call (SQL execution)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "query") {
        const sqlText = request.params.arguments?.sql as string;

        try {
            const [rows] = await pool.query(sqlText);
            return {
                content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
                isError: false,
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: String(error) }],
                isError: true,
            };
        }
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
});

// Launch server
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
runServer().catch(console.error);
