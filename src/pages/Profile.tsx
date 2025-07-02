
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AuthService, AuthUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleLinkDiscord = async () => {
    try {
      await AuthService.signInWithDiscord();
      toast({
        title: 'Discord Linked!',
        description: 'Your Discord account has been successfully linked.',
      });
    } catch (error) {
      toast({
        title: 'Error Linking Discord',
        description: 'There was a problem linking your Discord account.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 p-8 text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Profile</h1>
        <div className="bg-slate-800/50 p-6 rounded-lg">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Competitor ELO:</strong> {user.competitor_elo}</p>
          <p><strong>Spectator ELO:</strong> {user.spectator_elo}</p>
          
          {!user.discord_id && (
            <Button onClick={handleLinkDiscord} className="mt-4">
              Link Discord Account
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
