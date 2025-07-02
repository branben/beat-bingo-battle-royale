# Supabase Setup Guide for Sound Royale

## 🚀 Quick Setup Checklist

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Project Name: `sound-royale`
5. Database Password: Generate a strong password (save it!)
6. Region: Choose closest to your users
7. Click "Create new project"

### 2. Apply Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" (this may take 30-60 seconds)
6. ✅ You should see "Success. No rows returned" message

### 3. Configure Discord OAuth Provider

#### Step 3a: Discord Application Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" → Name: "Sound Royale Auth"
3. Go to **OAuth2** section
4. Add these Redirect URIs:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   http://localhost:8081/auth/callback
   ```
   (Replace `your-project-ref` with your actual Supabase project reference)
5. Copy your **Client ID** and **Client Secret**

#### Step 3b: Supabase Auth Configuration
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find "Discord" and toggle it ON
3. Enter your Discord **Client ID** and **Client Secret**
4. Click "Save"

### 4. Get Environment Variables
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values for your `.env.local` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Discord OAuth (for web app)
VITE_DISCORD_CLIENT_ID=your-discord-client-id

# Discord Bot (for bot deployment)
DISCORD_TOKEN=your-bot-token-here
CLIENT_ID=your-bot-application-id-here  
GUILD_ID=your-discord-server-id-here
WEB_APP_URL=http://localhost:8081
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

### 5. Verify Setup

#### Database Verification
Run this query in SQL Editor to verify tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'matches', 'audio_submissions', 'votes');
```
You should see 4 tables returned.

#### Storage Verification
1. Go to **Storage** in Supabase dashboard
2. You should see `audio-submissions` bucket
3. Upload a test file to verify it works

#### Auth Verification
1. Go to **Authentication** → **Users**
2. You should see the Discord provider enabled
3. Test login flow from your web app

## 🔧 Configuration Details

### Database Tables Created
- **users**: User profiles with Discord OAuth data and ELO ratings
- **matches**: Game sessions with state and bingo cards
- **audio_submissions**: Beat uploads with metadata
- **votes**: Spectator voting records with weighted power
- **handicaps**: Strategic gameplay modifiers (future feature)

### Row Level Security (RLS) Policies
- Users can read public profiles, update their own
- Matches are publicly readable
- Audio submissions viewable by all, creatable by owners
- Votes viewable by all, creatable by voters
- Secure by default with proper access controls

### Storage Buckets
- `audio-submissions`: Private bucket for beat uploads
- Authenticated users can upload to their own folders
- Public read access for playback during voting

### Views Created
- `leaderboard_competitors`: Ranked competitor ELO leaderboard
- `leaderboard_spectators`: Ranked spectator ELO leaderboard

## 🎯 Next Steps After Supabase Setup

1. **Update Web App Environment Variables**
   ```bash
   # Create .env.local in your web app root
   cp .env.example .env.local
   # Add your Supabase keys
   ```

2. **Test Database Connection**
   ```bash
   npm run dev
   # Check browser console for Supabase connection
   ```

3. **Deploy Discord Bot**
   - Set up Replit project
   - Add environment variables
   - Test slash commands

4. **Enable Real-time Features**
   - Configure Supabase real-time subscriptions
   - Add live game state synchronization

## 🐛 Troubleshooting

### Common Issues

#### "relation does not exist" errors
- **Cause**: Schema not applied correctly
- **Solution**: Re-run the migration SQL in SQL Editor

#### Discord OAuth not working
- **Cause**: Redirect URIs don't match exactly
- **Solution**: Ensure URIs in Discord app match Supabase exactly (including trailing slashes)

#### Storage upload fails
- **Cause**: RLS policies blocking access
- **Solution**: Verify user is authenticated and policies are correct

#### Real-time not working
- **Cause**: RLS blocking real-time updates
- **Solution**: Add `auth.uid()` checks to RLS policies

### Performance Optimization

#### Database Indexes
All necessary indexes are created by the migration:
- User lookup by Discord ID and username
- Match queries by status and players
- Vote and audio submission lookups

#### Query Optimization
- Use the pre-built leaderboard views for rankings
- Filter matches by status for active games
- Use pagination for large result sets

## 🔐 Security Best Practices

### Environment Variables
- Never commit `.env.local` to version control
- Use different Discord apps for development vs production
- Rotate keys regularly in production

### Database Security
- RLS policies enforce data access rules
- Service role key only used for admin operations
- User data properly scoped by authentication

### Audio File Security
- Files stored in private buckets
- Access controlled through Supabase auth
- Automatic cleanup after matches (implement in app logic)

## 📊 Monitoring & Analytics

### Built-in Metrics
- User registration and activity tracking
- Game completion rates via match status
- Audio submission success rates
- Vote participation metrics

### Performance Monitoring
- Monitor Supabase dashboard for query performance
- Set up alerts for high error rates
- Track storage usage for audio files

---

**Need Help?** Check the Supabase documentation or Discord community for additional support.
