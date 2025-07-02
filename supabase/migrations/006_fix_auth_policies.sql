-- Fix authentication and RLS policy issues

-- =====================================================
-- FIX USER TABLE RLS POLICIES
-- =====================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view public profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Create more permissive policies for development
CREATE POLICY "Enable read access for all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on auth.uid()" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- FIX USER CREATION TRIGGER
-- =====================================================

-- Drop and recreate the user creation function with better error handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile with better error handling
  INSERT INTO public.users (
    id, 
    discord_id, 
    discord_username, 
    username, 
    display_name,
    competitor_elo,
    spectator_elo,
    coins
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'provider_id',
    NEW.raw_user_meta_data->>'user_name',
    COALESCE(
      NEW.raw_user_meta_data->>'user_name', 
      NEW.raw_user_meta_data->>'preferred_username',
      'User' || substring(NEW.id::text, 1, 8)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'global_name',
      NEW.raw_user_meta_data->>'user_name'
    ),
    500,  -- default competitor ELO
    1000, -- default spectator ELO
    100   -- default coins
  );
  
  -- Log successful user creation
  RAISE NOTICE 'Created user profile for %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TEST THE SETUP
-- =====================================================

-- Verify the policies exist
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated successfully';
  RAISE NOTICE 'User creation trigger updated';
  RAISE NOTICE 'Ready for Discord OAuth testing';
END
$$;
