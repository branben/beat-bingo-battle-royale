# Discord Bot Setup & Troubleshooting Guide

## Quick Setup Checklist

### 1. Discord Developer Portal Setup
1. Go to https://discord.com/developers/applications
2. Click "New Application" → Name: "Sound Royale" 
3. Go to "Bot" section → Click "Add Bot"
4. **IMPORTANT:** Under "Privileged Gateway Intents" enable:
   - ✅ Message Content Intent
   - ✅ Server Members Intent (optional but recommended)

### 2. Get Your Bot Token & IDs
- **Bot Token**: Bot section → "Token" → Click "Copy"
- **Client ID**: General Information → "Application ID" → Copy
- **Guild ID**: Right-click your Discord server → "Copy Server ID" 
  (Enable Developer Mode: Settings → Advanced → Developer Mode)

### 3. Bot Permissions & Invite
1. Go to OAuth2 → URL Generator
2. **Scopes:** Select `bot` and `applications.commands`
3. **Bot Permissions:** Select:
   - ✅ Send Messages
   - ✅ Use Slash Commands  
   - ✅ Read Message History
   - ✅ Connect (for voice features later)
   - ✅ Speak (for voice features later)
4. Copy the generated URL and invite bot to your server

## Common Issues & Solutions

### Issue: Old commands still showing (like `/lol`)
**Solution:** Clear and re-register commands
```javascript
// This is now automatic in our bot - it clears old commands first
```

### Issue: "Unknown command" errors
**Cause:** Commands not properly registered or bot lacks permissions
**Solution:** 
1. Check bot has "applications.commands" scope
2. Verify CLIENT_ID and GUILD_ID are correct
3. Make sure bot is in the server

### Issue: Bot shows offline
**Cause:** Invalid token or bot not invited properly
**Solution:**
1. Double-check DISCORD_TOKEN in environment
2. Re-invite bot with correct permissions
3. Check bot token hasn't been regenerated

### Issue: Commands don't appear in Discord
**Cause:** Registration failed or wrong guild ID
**Solution:**
1. Check console logs for registration errors
2. Verify GUILD_ID matches your server ID
3. Wait up to 1 hour for commands to sync (or restart Discord)

## Environment Variables Needed

Create `.env` file with:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_application_id_here  
GUILD_ID=your_discord_server_id_here
WEB_APP_URL=http://localhost:8080
```

## Testing Commands

After setup, these commands should work:
- `/join` - Join as competitor
- `/spectate` - Join as spectator
- `/vote player1` - Vote for player 1
- `/status` - Check stats
- `/leaderboard` - View rankings
- `/handicap blind` - Use handicap

## Debugging Steps

### 1. Check Bot Status
```bash
node index.js
```
Look for these messages:
- ✅ "🎵 Sound Royale Bot is online as BotName#1234!"
- ✅ "🔄 Started refreshing application (/) commands..."
- ✅ "✅ Successfully registered X application (/) commands"

### 2. Common Error Codes
- **50001**: Missing Access - Bot lacks permissions
- **10002**: Unknown Application - Wrong CLIENT_ID
- **50035**: Invalid Form Body - Malformed command structure

### 3. Force Clear All Commands
If commands are stuck, run this once:
```javascript
// Add to your bot file temporarily
await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] }); // Global
await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] }); // Guild
```

## Replit-Specific Setup

### 1. Create New Replit Project
- Choose "Node.js" template
- Import from GitHub or upload files

### 2. Set Environment Variables
In Replit sidebar, click "Secrets" (🔒) and add:
- `DISCORD_TOKEN`
- `CLIENT_ID` 
- `GUILD_ID`
- `WEB_APP_URL`

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Bot
Click "Run" button or:
```bash
npm start
```

### 5. Keep Bot Online 24/7
**Free Option:** Use UptimeRobot to ping your Replit URL every 5 minutes
**Paid Option:** Enable Replit "Always On" feature

## Next Steps After Bot Works

1. Test all slash commands work
2. Connect bot to web app (Phase 2)
3. Add real-time game integration
4. Implement voice channel features

## Troubleshooting Contact

If still having issues:
1. Check console logs for specific error messages
2. Verify all IDs are copied correctly (no extra spaces)
3. Ensure bot has been invited with correct permissions
4. Try creating a fresh bot application if persistent issues
