-- Function to safely update spectator count
CREATE OR REPLACE FUNCTION update_spectator_count(match_id UUID, increment BOOLEAN)
RETURNS VOID AS $$
BEGIN
  IF increment THEN
    UPDATE matches 
    SET spectator_count = spectator_count + 1,
        updated_at = timezone('utc'::text, now())
    WHERE id = match_id;
  ELSE
    UPDATE matches 
    SET spectator_count = GREATEST(0, spectator_count - 1),
        updated_at = timezone('utc'::text, now())
    WHERE id = match_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_spectator_count(UUID, BOOLEAN) TO authenticated;
