# Replit Setup Guide for Sound Royale Discord Bot

## Quick Setup Steps

### 1. Create Replit Project
1. Go to https://replit.com
2. Click **"Create Repl"**
3. Choose **"Node.js"** template
4. Name it **"sound-royale-bot"**

### 2. Upload Bot Files
Either:
- **Option A:** Clone from GitHub (if you have it there)
- **Option B:** Upload files manually:
  - Upload `package.json`, `index.js`, `.env.example`
  - Create the other files as needed

### 3. Set Environment Variables in Replit
1. Click the **🔒 "Secrets"** tab in the left sidebar
2. Add these 4 secrets:

```
Key: DISCORD_TOKEN
Value: your_actual_bot_token_from_discord_developer_portal

Key: CLIENT_ID  
Value: your_actual_application_id_from_discord_developer_portal

Key: GUILD_ID
Value: your_actual_server_id_from_discord

Key: WEB_APP_URL
Value: http://localhost:8080
```

### 4. Install Dependencies
In the Shell tab, run:
```bash
npm install
```

### 5. Test the Bot
```bash
node index.js
```

You should see:
```
🎵 Sound Royale Bot is online as YourBot#1234!
🔄 Started refreshing application (/) commands...
✅ Successfully registered 6 application (/) commands
```

### 6. Keep Bot Online 24/7

#### Free Option (Recommended):
1. Make your Repl public
2. Copy the Repl URL (e.g., `https://sound-royale-bot.username.repl.co`)
3. Use UptimeRobot (free) to ping this URL every 5 minutes
4. This keeps your Repl awake without paying

#### Paid Option:
- Enable Replit's "Always On" feature ($7/month)

## Common Replit Issues & Solutions

### Issue: "Module not found" errors
**Solution:** Make sure you ran `npm install` in the Shell

### Issue: Environment variables not working
**Solution:** Double-check:
- Variables are in the **Secrets** tab (🔒), not files
- No spaces or quotes around the values
- Exact key names: `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`

### Issue: Bot goes offline after 1 hour
**Solution:** Set up UptimeRobot monitoring (see step 6)

### Issue: "Port 3000 is already in use"
**Solution:** Replit sometimes auto-runs. Click "Stop" first, then run `node index.js`

## File Structure in Replit
```
/
├── package.json      # Dependencies
├── index.js         # Main bot code  
├── .env.example     # Template (don't put real secrets here)
└── README.md        # Documentation
```

## Testing Commands in Discord
After setup, test these in your Discord server:
- `/join` - Should show welcome message with web app link
- `/spectate` - Should show spectator message  
- `/status` - Should show mock player stats
- `/leaderboard` - Should show top players
- `/vote player1` - Should confirm vote submission
- `/handicap blind` - Should activate handicap

## Next Steps
1. ✅ Get bot working on Replit
2. 🔄 Connect bot to real web app data
3. 🎵 Add audio integration 
4. 🔴 Implement real-time sync between Discord and web
