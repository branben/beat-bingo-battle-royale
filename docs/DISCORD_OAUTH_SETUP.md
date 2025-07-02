# Discord OAuth Setup for Sound Royale

## 🎯 Quick Setup (5 minutes)

### Step 1: Create Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name: **"Sound Royale"** (or "Sound Royale Auth")
4. Click **"Create"**

### Step 2: Get Client ID
1. In your new application, go to **"General Information"**
2. Copy the **"Application ID"** (this is your Client ID)
3. Save it for later: `VITE_DISCORD_CLIENT_ID=paste_here`

### Step 3: Set Up OAuth2
1. Go to **"OAuth2"** → **"General"**
2. Click **"Add Redirect"** and add:
   ```
   https://futioilrogbfwpgyqlqu.supabase.co/auth/v1/callback
   ```
3. Copy the **"Client Secret"** (you'll need this for Supabase)

### Step 4: Configure Supabase Auth
1. In your Supabase dashboard → **Authentication** → **Providers**
2. Find **"Discord"** and toggle it **ON**
3. Enter:
   - **Client ID**: (from Step 2)
   - **Client Secret**: (from Step 3)
4. Click **"Save"**

### Step 5: Update Your .env.local
Add the Discord Client ID to your `.env.local` file:
```env
VITE_SUPABASE_URL=https://futioilrogbfwpgyqlqu.supabase.co
VITE_SUPABASE_ANON_KEY=your_existing_anon_key_here
VITE_DISCORD_CLIENT_ID=your_discord_client_id_here
```

## 🛠️ Fix Your Database

1. Go to Supabase → **SQL Editor**
2. Copy all content from `supabase/migrations/003_simple_rebuild.sql`
3. Paste and click **"Run"**
4. You should see success messages with emoji checkmarks ✅

## 🧪 Test Everything

1. Restart your dev server: `npm run dev`
2. Go to `http://localhost:8081`
3. Click **"Connect Discord"**
4. You should be redirected to Discord for login
5. After approval, you'll be redirected back with a working account!

## 🐛 Troubleshooting

### "Invalid Redirect URI"
- Make sure the redirect URI in Discord exactly matches: `https://futioilrogbfwpgyqlqu.supabase.co/auth/v1/callback`
- No trailing slashes, must be exact

### "Client ID not found"
- Double-check the Client ID is copied correctly to `.env.local`
- Restart your dev server after changing `.env.local`

### "Users table does not exist"
- Run the new migration script (`003_simple_rebuild.sql`)
- Check Supabase logs for any migration errors

## ✅ Success Checklist

- [ ] Discord application created
- [ ] Client ID and Secret copied
- [ ] Supabase Discord provider enabled
- [ ] Database migration completed successfully
- [ ] `.env.local` updated with Discord Client ID
- [ ] Dev server restarted
- [ ] Discord login working on web app

Once all checkboxes are complete, your Discord OAuth integration should work perfectly! 🎵
