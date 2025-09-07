'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { usePlantStore } from '@/lib/plant-store';
import { 
  isOfflineMode, 
  validateOfflineAdmin, 
  OFFLINE_ADMIN,
  loadDummyDataIfEmpty 
} from '@/utils/offlineMode';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isOffline: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline] = useState(() => isOfflineMode());

  useEffect(() => {
    // Handle offline mode initialization
    if (isOffline) {
      // Check if admin is already logged in offline
      const savedOfflineUser = localStorage.getItem('planter_offline_user');
      if (savedOfflineUser) {
        try {
          const offlineUser = JSON.parse(savedOfflineUser);
          setUser(offlineUser);
          // Load dummy data if needed
          setTimeout(() => {
            const { plants, addPlant } = usePlantStore.getState();
            loadDummyDataIfEmpty(plants, addPlant);
          }, 100);
        } catch (error) {
          console.error('Failed to parse offline user:', error);
          localStorage.removeItem('planter_offline_user');
        }
      }
      setLoading(false);
      return;
    }

    // Skip auth setup if Supabase is not configured
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Failed to get session:', error);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    let subscription: any = null;
    if (supabase) {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );
      subscription = authSubscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isOffline]);

  const signIn = async (email: string, password: string) => {
    // Handle offline admin authentication
    if (isOffline) {
      if (validateOfflineAdmin(email, password)) {
        const offlineUser = OFFLINE_ADMIN.user as any;
        setUser(offlineUser);
        localStorage.setItem('planter_offline_user', JSON.stringify(offlineUser));
        
        // Load dummy data if plants array is empty
        setTimeout(() => {
          const { plants, addPlant } = usePlantStore.getState();
          loadDummyDataIfEmpty(plants, addPlant);
        }, 100);
        
        return {};
      } else {
        return { error: 'Invalid admin credentials. Use admin@planter.test / admin123' };
      }
    }

    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Authentication not available' };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    // Disable signup in offline mode
    if (isOffline) {
      return { error: 'Sign up not available in offline mode. Use admin login instead.' };
    }

    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Authentication not available' };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    // Handle offline mode signout
    if (isOffline) {
      setUser(null);
      localStorage.removeItem('planter_offline_user');
      // Clear local plant data when user signs out
      usePlantStore.setState({ plants: [], recentlyWateredPlant: null });
      return;
    }

    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    // Clear local plant data when user signs out
    usePlantStore.setState({ plants: [], recentlyWateredPlant: null });
  };

  const value = {
    user,
    session,
    loading,
    isOffline,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 