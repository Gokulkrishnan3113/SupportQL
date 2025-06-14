# SupportQL MySQL Adapter

Natural language querying for MySQL databases through Claude Desktop.

## Setup

1. **Install [Claude Desktop](https://claude.ai/download)**

2. **Configure Claude Desktop**
   
   Open your `claude_desktop_config.json` file and add:

   ```json
   {
     "mcpServers": {
       "SupportQL-Mysql": {
         "command": "npx",
         "args": [
           "-y",
           "@supportql/mysql",
           "<mysql-connection-string>"
         ]
       }
     }
   }
   ```

3. **Restart Claude Desktop**

## License

Licensed under the [ISC License](https://opensource.org/licenses/ISC).