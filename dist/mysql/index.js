#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const mysql = __importStar(require("mysql2/promise"));
// MCP Server setup
const server = new index_js_1.Server({
    name: "mcp-server/mysql",
    version: "0.1.0",
}, {
    capabilities: {
        resources: {},
        tools: {},
    },
});
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
server.setRequestHandler(types_js_1.ListResourcesRequestSchema, () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()");
    return {
        resources: rows.map((row) => ({
            uri: new URL(`${row.table_name}/${SCHEMA_PATH}`, resourceBaseUrl).href,
            mimeType: "application/json",
            name: `"${row.table_name}" table schema`,
        })),
    };
}));
// Fetch table schema
server.setRequestHandler(types_js_1.ReadResourceRequestSchema, (request) => __awaiter(void 0, void 0, void 0, function* () {
    const resourceUrl = new URL(request.params.uri);
    const pathComponents = resourceUrl.pathname.split("/");
    const schema = pathComponents.pop();
    const tableName = pathComponents.pop();
    if (schema !== SCHEMA_PATH) {
        throw new Error("Invalid resource URI");
    }
    const [rows] = yield pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ? AND table_schema = DATABASE()", [tableName]);
    return {
        contents: [
            {
                uri: request.params.uri,
                mimeType: "application/json",
                text: JSON.stringify(rows, null, 2),
            },
        ],
    };
}));
// Define available tools
server.setRequestHandler(types_js_1.ListToolsRequestSchema, () => __awaiter(void 0, void 0, void 0, function* () {
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
}));
// Handle tool call (SQL execution)
server.setRequestHandler(types_js_1.CallToolRequestSchema, (request) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (request.params.name === "query") {
        const sqlText = (_a = request.params.arguments) === null || _a === void 0 ? void 0 : _a.sql;
        try {
            const [rows] = yield pool.query(sqlText);
            return {
                content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
                isError: false,
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: String(error) }],
                isError: true,
            };
        }
    }
    throw new Error(`Unknown tool: ${request.params.name}`);
}));
// Launch server
function runServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const transport = new stdio_js_1.StdioServerTransport();
        yield server.connect(transport);
    });
}
runServer().catch(console.error);
