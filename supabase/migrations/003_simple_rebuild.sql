-- Sound Royale Database - Simple Clean Build
-- This script handles partial schemas more gracefully

-- =====================================================
-- SAFE CLEANUP
-- =====================================================

-- First, let's check what exists and clean it up safely
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop views first (they depend on tables)
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public' AND viewname LIKE 'leaderboard_%') LOOP
        EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.viewname) || ' CASCADE';
    END LOOP;
    
    -- Drop triggers
    FOR r IN (SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE event_object_schema = 'public') LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON public.' || quote_ident(r.event_object_table);
    END LOOP;
    
    -- Drop functions
    FOR r IN (SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE 'handle_%') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.routine_name) || '() CASCADE';
    END LOOP;
    
    -- Drop tables in safe order
    DROP TABLE IF EXISTS public.handicaps CASCADE;
    DROP TABLE IF EXISTS public.votes CASCADE;
    DROP TABLE IF EXISTS public.audio_submissions CASCADE;
    DROP TABLE IF EXISTS public.matches CASCADE;
    DROP TABLE IF EXISTS public.users CASCADE;
    
    RAISE NOTICE 'Cleanup completed successfully';
END
$$;

-- Clean up storage bucket safely
DELETE FROM storage.buckets WHERE id = 'audio-submissions';

-- Clean up storage policies
DO $$
BEGIN
    -- Drop existing storage policies if they exist
    DROP POLICY IF EXISTS "Anyone can view audio files" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload audio files" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own audio files" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own audio files" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Storage policies cleanup completed (some may not have existed)';
END
$$;

-- =====================================================
-- CREATE FRESH SCHEMA
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Discord OAuth data
  discord_id TEXT UNIQUE,
  discord_username TEXT,
  discord_avatar TEXT,
  
  -- Game profile
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  
  -- ELO ratings (separate for competitor vs spectator)
  competitor_elo INTEGER DEFAULT 500,
  spectator_elo INTEGER DEFAULT 1000,
  
  -- Game statistics
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  rounds_won INTEGER DEFAULT 0,
  total_votes_cast INTEGER DEFAULT 0,
  total_votes_received INTEGER DEFAULT 0,
  
  -- Economy
  coins INTEGER DEFAULT 100,
  
  -- Preferences
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- MATCHES TABLE  
-- =====================================================
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Match details
  match_number INTEGER GENERATED ALWAYS AS IDENTITY,
  status TEXT CHECK (status IN ('waiting', 'active', 'voting', 'finished', 'cancelled')) DEFAULT 'waiting',
  
  -- Players
  player1_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Game state
  current_round INTEGER DEFAULT 0,
  called_genres JSONB DEFAULT '[]'::jsonb,
  current_genre TEXT,
  
  -- Bingo cards (stored as JSON)
  player1_card JSONB,
  player2_card JSONB,
  
  -- Timing
  round_start_time TIMESTAMP WITH TIME ZONE,
  voting_deadline TIMESTAMP WITH TIME ZONE,
  
  -- Match metadata
  spectator_count INTEGER DEFAULT 0,
  total_rounds INTEGER DEFAULT 0,
  match_duration_seconds INTEGER,
  
  -- Discord integration
  discord_channel_id TEXT,
  discord_guild_id TEXT
);

-- =====================================================
-- AUDIO_SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE public.audio_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Submission details
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  genre TEXT NOT NULL,
  
  -- Audio file details
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  duration_seconds REAL NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Metadata
  title TEXT,
  description TEXT,
  
  -- Processing status
  processing_status TEXT CHECK (processing_status IN ('uploading', 'processing', 'ready', 'failed')) DEFAULT 'uploading',
  
  UNIQUE(match_id, user_id, round_number)
);

-- =====================================================
-- VOTES TABLE
-- =====================================================
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Vote details
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  voted_for_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  
  -- Vote metadata
  vote_power REAL NOT NULL DEFAULT 1.0, -- Based on voter's spectator ELO
  voter_spectator_elo INTEGER NOT NULL, -- Snapshot at time of vote
  
  -- Prevent duplicate votes
  UNIQUE(match_id, voter_id, round_number)
);

-- =====================================================
-- HANDICAPS TABLE (for future implementation)
-- =====================================================
CREATE TABLE public.handicaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Handicap details
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL for self-handicaps
  
  -- Handicap type and effects
  handicap_type TEXT CHECK (handicap_type IN ('blind_spot', 'double_trouble', 'coin_monsoon', 'elo_shift')) NOT NULL,
  cost_coins INTEGER NOT NULL,
  round_applied INTEGER,
  duration_rounds INTEGER DEFAULT 1,
  
  -- Effects (stored as JSON for flexibility)
  effects JSONB NOT NULL,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'cancelled')) DEFAULT 'pending'
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handicaps ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile and public profiles of others
CREATE POLICY "Users can view public profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Matches are publicly readable, but only system can create/update
CREATE POLICY "Anyone can view matches" ON public.matches
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage matches" ON public.matches
  FOR ALL USING (auth.role() = 'service_role');

-- Audio submissions can be viewed by anyone, but only owners can create
CREATE POLICY "Anyone can view audio submissions" ON public.audio_submissions
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own audio submissions" ON public.audio_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio submissions" ON public.audio_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- Votes can be viewed by anyone, but only voters can create their own votes
CREATE POLICY "Anyone can view votes" ON public.votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own votes" ON public.votes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- Handicaps can be viewed by participants, created by users
CREATE POLICY "Participants can view handicaps" ON public.handicaps
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = target_user_id);

CREATE POLICY "Users can create handicaps" ON public.handicaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER handle_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_matches
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user creation from Discord OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, discord_id, discord_username, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'provider_id',
    NEW.raw_user_meta_data->>'user_name',
    COALESCE(NEW.raw_user_meta_data->>'user_name', 'User' || substring(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile when new auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-submissions', 'audio-submissions', false);

-- Storage policies for audio files
CREATE POLICY "Anyone can view audio files" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio-submissions');

CREATE POLICY "Authenticated users can upload audio files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio-submissions' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own audio files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'audio-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio files" ON storage.objects
  FOR DELETE USING (bucket_id = 'audio-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX idx_users_discord_id ON public.users(discord_id);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_competitor_elo ON public.users(competitor_elo DESC);
CREATE INDEX idx_users_spectator_elo ON public.users(spectator_elo DESC);

-- Match indexes
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_players ON public.matches(player1_id, player2_id);
CREATE INDEX idx_matches_created_at ON public.matches(created_at DESC);

-- Audio submission indexes
CREATE INDEX idx_audio_submissions_match_id ON public.audio_submissions(match_id);
CREATE INDEX idx_audio_submissions_user_id ON public.audio_submissions(user_id);

-- Vote indexes
CREATE INDEX idx_votes_match_id ON public.votes(match_id);
CREATE INDEX idx_votes_voter_id ON public.votes(voter_id);

-- =====================================================
-- LEADERBOARDS VIEWS (Create after tables exist)
-- =====================================================
CREATE VIEW public.leaderboard_competitors AS
SELECT 
  u.id,
  u.username,
  u.display_name,
  u.discord_username,
  u.competitor_elo,
  u.games_played,
  u.games_won,
  CASE 
    WHEN u.games_played > 0 THEN ROUND((u.games_won::float / u.games_played::float) * 100, 1)
    ELSE 0
  END as win_percentage,
  u.rounds_won,
  u.coins,
  CASE
    WHEN u.competitor_elo >= 3000 THEN 'Grandmaster'
    WHEN u.competitor_elo >= 2500 THEN 'Master'
    WHEN u.competitor_elo >= 2000 THEN 'Diamond III'
    WHEN u.competitor_elo >= 1500 THEN 'Platinum I'
    WHEN u.competitor_elo >= 1200 THEN 'Gold II'
    WHEN u.competitor_elo >= 1000 THEN 'Silver III'
    ELSE 'Bronze V'
  END as rank,
  ROW_NUMBER() OVER (ORDER BY u.competitor_elo DESC, u.games_won DESC) as rank_position
FROM public.users u
WHERE u.is_active = true AND u.games_played > 0
ORDER BY u.competitor_elo DESC, u.games_won DESC;

CREATE VIEW public.leaderboard_spectators AS
SELECT 
  u.id,
  u.username,
  u.display_name,
  u.discord_username,
  u.spectator_elo,
  u.total_votes_cast,
  CASE 
    WHEN u.total_votes_cast > 0 THEN ROUND((u.total_votes_received::float / u.total_votes_cast::float) * 100, 1)
    ELSE 0
  END as accuracy_percentage,
  ROUND(1.0 + (u.spectator_elo::float / 1000), 2) as vote_power,
  u.coins,
  ROW_NUMBER() OVER (ORDER BY u.spectator_elo DESC, u.total_votes_cast DESC) as rank_position
FROM public.users u
WHERE u.is_active = true AND u.total_votes_cast > 0
ORDER BY u.spectator_elo DESC, u.total_votes_cast DESC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🎉 Sound Royale database schema created successfully!';
  RAISE NOTICE '✅ Tables: users, matches, audio_submissions, votes, handicaps';
  RAISE NOTICE '✅ Views: leaderboard_competitors, leaderboard_spectators';
  RAISE NOTICE '✅ Storage bucket: audio-submissions';
  RAISE NOTICE '✅ RLS policies and triggers configured';
  RAISE NOTICE '🚀 Ready for Discord OAuth and game integration!';
END
$$;
