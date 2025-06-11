# SupportQL
A MCP server that lets you query SQL databases (PostgreSQL and MySQL) using natural language — no SQL knowledge required.

Supports `npx` execution for seamless plug-and-play use in Claude Desktop.

---

## 🛠️ Configuration

### 1. Claude Desktop

#### 1.1 Launch Claude Desktop  
If not already installed, download it from the official site: [Download](https://claude.ai/download)

#### 1.2 Open the configuration file of Claude Desktop
Add the following configuration to the "mcpServers" section of your claude_desktop_config.json:

#### 1.3 Add the following MCP server entry for **PostgreSQL**:

```json
{
    "mcpServers": {
        "PostgreSQL": {
            "command": "npx",
            "args": [
                "-y",
                "supportql/postgres",
                "<postgres-connection-string>"
            ]
        }
    }
}
```

#### 1.4 Add the following MCP server entry for **MySQL**:

```json
{
    "mcpServers": {
        "MySQL": {
            "command": "npx",
            "args": [
                "-y",
                "supportql/mysql",
                "<mysql-connection-string>"
            ]
        }
    }
}
```

### 2. Start using SupportQL

Once configured, you can begin querying your databases using natural language — right inside Claude Desktop.

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

© 2025 Gokul Krishnan
