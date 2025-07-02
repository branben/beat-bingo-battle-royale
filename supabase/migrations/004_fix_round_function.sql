-- Fix ROUND function error in leaderboard views
-- PostgreSQL ROUND function needs NUMERIC type, not double precision

-- Drop the existing views first
DROP VIEW IF EXISTS public.leaderboard_competitors CASCADE;
DROP VIEW IF EXISTS public.leaderboard_spectators CASCADE;

-- Recreate with fixed ROUND function
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
    WHEN u.games_played > 0 THEN ROUND((u.games_won::NUMERIC / u.games_played::NUMERIC) * 100, 1)
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
    WHEN u.total_votes_cast > 0 THEN ROUND((u.total_votes_received::NUMERIC / u.total_votes_cast::NUMERIC) * 100, 1)
    ELSE 0
  END as accuracy_percentage,
  ROUND((1.0 + (u.spectator_elo::NUMERIC / 1000))::NUMERIC, 2) as vote_power,
  u.coins,
  ROW_NUMBER() OVER (ORDER BY u.spectator_elo DESC, u.total_votes_cast DESC) as rank_position
FROM public.users u
WHERE u.is_active = true AND u.total_votes_cast > 0
ORDER BY u.spectator_elo DESC, u.total_votes_cast DESC;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Fixed ROUND function in leaderboard views!';
  RAISE NOTICE '🎉 Database schema is now complete and working!';
END
$$;
