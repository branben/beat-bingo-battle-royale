
-- Check existing tables first, then add missing ones
-- Add missing columns to existing players table if needed
DO $$ 
BEGIN
    -- Add discord_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'discord_id') THEN
        ALTER TABLE public.players ADD COLUMN discord_id TEXT UNIQUE;
    END IF;
    
    -- Add username column if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'username') THEN
        ALTER TABLE public.players ADD COLUMN username TEXT NOT NULL DEFAULT 'Unknown';
    END IF;
END $$;

-- Create matches table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1 UUID REFERENCES players(id),
  player2 UUID REFERENCES players(id),
  winner_id UUID REFERENCES players(id),
  called_genres TEXT[],
  handicaps_used JSONB DEFAULT '[]',
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'production', 'voting', 'handicap', 'finished')),
  production_deadline TIMESTAMPTZ,
  voting_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create match_spectators table
CREATE TABLE IF NOT EXISTS public.match_spectators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, player_id)
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  spectator_id UUID REFERENCES players(id),
  voted_player_id UUID REFERENCES players(id),
  vote_power DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, spectator_id)
);

-- Create beat_submissions table
CREATE TABLE IF NOT EXISTS public.beat_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  genre TEXT NOT NULL,
  audio_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  is_ready BOOLEAN DEFAULT FALSE
);

-- Create matchmaking queue table
CREATE TABLE IF NOT EXISTS public.matchmaking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id TEXT NOT NULL,
  username TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('player', 'spectator')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bingo_cards table
CREATE TABLE IF NOT EXISTS public.bingo_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  squares JSONB NOT NULL,
  marked JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables only if not already enabled
DO $$
BEGIN
    -- Enable RLS on tables that might not have it
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'matches' AND relrowsecurity = true) THEN
        ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'match_spectators' AND relrowsecurity = true) THEN
        ALTER TABLE public.match_spectators ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'votes' AND relrowsecurity = true) THEN
        ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'beat_submissions' AND relrowsecurity = true) THEN
        ALTER TABLE public.beat_submissions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'matchmaking' AND relrowsecurity = true) THEN
        ALTER TABLE public.matchmaking ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'bingo_cards' AND relrowsecurity = true) THEN
        ALTER TABLE public.bingo_cards ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policies only if they don't exist
DO $$
BEGIN
    -- Policies for matches
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on matches') THEN
        CREATE POLICY "Allow all operations on matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- Policies for match_spectators
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on match_spectators') THEN
        CREATE POLICY "Allow all operations on match_spectators" ON public.match_spectators FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- Policies for votes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on votes') THEN
        CREATE POLICY "Allow all operations on votes" ON public.votes FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- Policies for beat_submissions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on beat_submissions') THEN
        CREATE POLICY "Allow all operations on beat_submissions" ON public.beat_submissions FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- Policies for matchmaking
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on matchmaking') THEN
        CREATE POLICY "Allow all operations on matchmaking" ON public.matchmaking FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- Policies for bingo_cards
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on bingo_cards') THEN
        CREATE POLICY "Allow all operations on bingo_cards" ON public.bingo_cards FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
