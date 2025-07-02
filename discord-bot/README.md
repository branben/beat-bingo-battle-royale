# Sound Royale Discord Bot

## Setup Instructions for Replit

### 1. Create Discord Application
1. Go to https://discord.com/developers/applications
2. Click "New Application" and name it "Sound Royale"
3. Go to "Bot" section and click "Add Bot"
4. Copy the bot token (keep this secret!)
5. Under "Privileged Gateway Intents", enable:
   - Message Content Intent
   - Server Members Intent

### 2. Get Required IDs
- **Client ID**: Found in "General Information" section of your Discord app
- **Guild ID**: Right-click your Discord server → "Copy Server ID" (enable Developer Mode in Discord settings)

### 3. Setup in Replit
1. Create a new Replit project with Node.js
2. Upload all files from this discord-bot folder
3. In Replit's "Secrets" tab (lock icon), add:
   ```
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_bot_client_id_here  
   GUILD_ID=your_server_id_here
   WEB_APP_URL=your_web_app_url_here
   ```

### 4. Install Dependencies
Run in Replit console:
```bash
npm install
```

### 5. Invite Bot to Server
1. Go to Discord Developer Portal → Your App → OAuth2 → URL Generator
2. Select scopes: `bot` and `applications.commands`
3. Select bot permissions: `Send Messages`, `Use Slash Commands`, `Read Message History`
4. Copy the generated URL and invite bot to your server

### 6. Run the Bot
In Replit, click "Run" or use:
```bash
npm start
```

## Available Commands

- `/join` - Join as a competitor
- `/spectate` - Join as a spectator  
- `/vote <player>` - Vote for a player
- `/status` - Check your stats
- `/leaderboard` - View leaderboard
- `/handicap <type>` - Use a handicap

## Keep Bot Online 24/7

For free 24/7 hosting on Replit:
1. Use Replit's "Always On" feature (paid)
2. Or use a free service like UptimeRobot to ping your bot every 5 minutes

## Integration with Web App

The bot currently sends users to the web app. Future enhancements:
- Real-time sync between Discord and web interface
- Webhook integration for live updates
- Voice channel integration for live performances
