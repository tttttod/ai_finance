'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';
import type { SupabaseClient, User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const supabase = await getSupabaseBrowserClientWithRetry();
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            if (!mounted) return;
            setSession(newSession);
            setUser(newSession?.user ?? null);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
