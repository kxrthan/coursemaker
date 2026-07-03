import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  username?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ 
          id: session.user.id, 
          email: session.user.email || '',
          username: session.user.user_metadata?.username
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ 
          id: session.user.id, 
          email: session.user.email || '',
          username: session.user.user_metadata?.username
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateUsername = async (newUsername: string) => {
    if (!user) return;
    const { data, error } = await supabase.auth.updateUser({
      data: { username: newUsername }
    });
    if (!error && data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        username: data.user.user_metadata?.username
      });
    }
    return { error };
  };

  return { user, logout, loading, updateUsername };
};
