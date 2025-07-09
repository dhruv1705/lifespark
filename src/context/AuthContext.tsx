import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isOfflineMode: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isOfflineMode: false,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    // Check if we're in a proper environment with valid Supabase config
    const isValidConfig = process.env.EXPO_PUBLIC_SUPABASE_URL && 
                         process.env.EXPO_PUBLIC_SUPABASE_URL !== 'your-supabase-url-here' &&
                         process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

    if (!isValidConfig) {
      console.log('🔄 Running in offline/demo mode - Supabase not configured');
      setIsOfflineMode(true);
      
      // Create a demo user for offline mode
      const demoUser = {
        id: 'demo-user-id',
        email: 'demo@lifespark.app',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: { name: 'Demo User' },
        aud: 'authenticated',
        email_confirmed_at: new Date().toISOString(),
      } as User;

      const demoSession = {
        access_token: 'demo-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'demo-refresh',
        user: demoUser,
      } as Session;

      setSession(demoSession);
      setUser(demoUser);
      setLoading(false);
      return;
    }

    // Try to connect to Supabase with proper error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Auth error:', error);
          setIsOfflineMode(true);
          setLoading(false);
          return;
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Network error during auth:', error);
        setIsOfflineMode(true);
        setLoading(false);
      });

    // Only set up auth listener if we have a valid config
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setIsOfflineMode(true);
      setLoading(false);
    }
  }, []);

  const signOut = async () => {
    if (isOfflineMode) {
      // In offline mode, just clear the session
      setSession(null);
      setUser(null);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error.message);
      }
    } catch (error) {
      console.error('Network error during sign out:', error);
      // Still clear local session even if network call fails
      setSession(null);
      setUser(null);
    }
  };

  const value = {
    session,
    user,
    loading,
    isOfflineMode,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};