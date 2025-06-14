# SupportQL PostgreSQL Adapter

Natural language querying for PostgreSQL databases through Claude Desktop.

## Setup

1. **Install [Claude Desktop](https://claude.ai/download)**

2. **Configure Claude Desktop**
   
   Open your `claude_desktop_config.json` file and add:

   ```json
   {
     "mcpServers": {
       "SupportQL-Postgres": {
         "command": "npx",
         "args": [
           "-y",
           "@supportql/postgres",
           "<postgres-connection-string>"
         ]
       }
     }
   }
   ```

3. **Restart Claude Desktop**

## License

Licensed under the [ISC License](https://opensource.org/licenses/ISC).