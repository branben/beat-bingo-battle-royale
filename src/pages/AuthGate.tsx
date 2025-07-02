
import React, { useState, useEffect } from 'react';
import { AuthService, AuthUser } from '@/lib/auth';
import Index from './Index';
import { Player } from '@/types/game';

const AuthGate = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        const user = await AuthService.getCurrentUser();
        console.log('Initial user:', user);
        setAuthUser(user);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Set up auth state listener
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      console.log('Auth state changed in AuthGate:', user);
      setAuthUser(user);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const player: Player | null = authUser ? {
    id: authUser.id,
    username: authUser.username,
    competitor_elo: authUser.competitor_elo,
    spectator_elo: authUser.spectator_elo,
    wins: authUser.games_won,
    losses: authUser.games_played - authUser.games_won,
    correct_votes: authUser.total_votes_received,
    coins: authUser.coins,
    role: authUser.competitor_elo >= 1200 ? 'Gold II' : 'Silver III'
  } : null;

  return <Index initialPlayer={player} initialAuthUser={authUser} />;
};

export default AuthGate;
