# SupportQL
A MCP server that lets you query SQL databases without the need for SQL knowledge and just through natural language

---

## 🛠️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Gokulkrishnan3113/SupportQL.git
cd supportql
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the MCP server (STDIO-based)

```bash
npm run build
```

This compiles the TypeScript files and generates the `dist` folder with `index.js`.

### 4. Configure with Claude Desktop (STDIO-based)

#### 4.1 Launch Claude Desktop  
If not already installed, you can download it from the official site: [Download](https://claude.ai/download)

#### 4.2 Open the configuration file of Claude Desktop
Add the following configuration to the "mcpServers" section of your claude_desktop_config.json:

#### 4.3 Add the following MCP server entry:

```json
{
    "mcpServers": {
        "SupportQL": {
            "command": "node",
            "args": [
                "<path-to-your-project>/dist/index.js",
                "<postgres-connection-string>"
            ]
        }
    }
}
```

### 5. Start using SupportQL

Once configured, you can begin querying your database using natural language.