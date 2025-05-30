import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, cleanupExpiredInviteCodes } from '../lib/db';

interface SupabaseContextValue {
  session: Session | null;
  user: User | null;
  signInWithMagicLink: (email: string) => Promise<any>;
  signOut: () => Promise<any>;
}

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

export const SupabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
    });
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    // Clean up expired invite codes
    cleanupExpiredInviteCodes();

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = (email: string) => supabase.auth.signInWithOtp({ email });
  const signOut = () => supabase.auth.signOut();

  return (
    <SupabaseContext.Provider value={{ session, user, signInWithMagicLink, signOut }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = (): SupabaseContextValue => {
  const context = useContext(SupabaseContext);
  if (!context) throw new Error('useSupabase must be used within SupabaseProvider');
  return context;
}; 