import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email?: string;
  discord_id?: string;
  discord_username?: string;
  discord_avatar?: string;
  username: string;
  display_name?: string;
  competitor_elo: number;
  spectator_elo: number;
  games_played: number;
  games_won: number;
  rounds_won: number;
  total_votes_cast: number;
  total_votes_received: number;
  coins: number;
  is_active: boolean;
  last_seen: string;
}

export class AuthService {
  static async signUpWithEmail(email, password, username) {
    // 1. Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          display_name: username,
        },
      },
    });

    if (signUpError) {
      console.error('Email sign up error:', signUpError);
      throw signUpError;
    }
    
    if (!signUpData.user) {
        throw new Error("Signup succeeded but no user object was returned.");
    }

    // 2. Manually create their profile in the database
    await this.ensureProfile(signUpData.user);

    // 3. Immediately sign them in to create a session (bypassing email confirm for MVP)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        console.error('Auto sign-in after signup failed:', signInError);
        throw signInError;
    }

    return signInData;
  }

  static async signInWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Email sign in error:', error);
      throw error;
    }

    return data;
  }

  static async signInWithDiscord() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'identify'
      }
    });

    if (error) {
      console.error('Discord sign in error:', error);
      throw error;
    }

    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return null;
      }

      // Get the user profile from our users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        // If no profile, could be a new user, let's create one.
        if (profileError.code === 'PGRST116') { // "single() row not found"
            return this.ensureProfile(user);
        }
        console.error('Profile fetch error:', profileError);
        return null;
      }

      return profile as AuthUser;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async updateProfile(updates: Partial<AuthUser>) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      throw error;
    }

    return data as AuthUser;
  }

  static async createGuestUser(username: string): Promise<AuthUser> {
    // For guest users, we'll create a temporary user record
    // This is a fallback when Discord OAuth is not used
    const tempId = `guest_${Math.random().toString(36).substr(2, 9)}`;
    
    const guestUser: AuthUser = {
      id: tempId,
      username,
      display_name: username,
      competitor_elo: 500,
      spectator_elo: 1000,
      games_played: 0,
      games_won: 0,
      rounds_won: 0,
      total_votes_cast: 0,
      total_votes_received: 0,
      coins: 100,
      is_active: true,
      last_seen: new Date().toISOString()
    };

    // Store in localStorage for guest sessions
    localStorage.setItem('guest_user', JSON.stringify(guestUser));
    
    return guestUser;
  }

  static getGuestUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem('guest_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static clearGuestUser() {
    localStorage.removeItem('guest_user');
  }

  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else if (event === 'SIGNED_OUT') {
        this.clearGuestUser();
        callback(null);
      }
    });
  }

  static async ensureProfile(user: User): Promise<AuthUser> {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return existingProfile as AuthUser;
    }

    // Create new profile from OAuth or email data
    const metadata = user.user_metadata;
    const newProfileData = {
      id: user.id,
      email: user.email,
      discord_id: user.app_metadata.provider === 'discord' ? metadata.provider_id : null,
      discord_username: user.app_metadata.provider === 'discord' ? metadata.user_name : null,
      discord_avatar: user.app_metadata.provider === 'discord' ? metadata.avatar_url : null,
      username: metadata.username || metadata.user_name || `user-${user.id.slice(0, 6)}`,
      display_name: metadata.display_name || metadata.full_name || metadata.user_name,
      competitor_elo: 500,
      spectator_elo: 1000,
      games_played: 0,
      games_won: 0,
      rounds_won: 0,
      total_votes_cast: 0,
      total_votes_received: 0,
      coins: 100,
      is_active: true,
      last_seen: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .insert(newProfileData)
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      throw error;
    }

    return data as AuthUser;
  }
}

export default AuthService;
