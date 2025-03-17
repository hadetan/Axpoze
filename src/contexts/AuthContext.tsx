import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthError as SupabaseAuthError, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { IAuthState, AuthError } from '../types/auth.types';

interface AuthContextType {
  authState: IAuthState;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType>({
  authState: { isAuthenticated: false, user: null, loading: true },
  signIn: async () => ({ user: null, error: null }),
  signUp: async () => ({ user: null, error: null }),
  signOut: async () => ({ error: null }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<IAuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  const handleAuthError = (error: SupabaseAuthError): AuthError => {
    console.error('Auth error:', error);
    return {
      message: error.message,
      status: error.status || 500
    };
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        setAuthState({
          user: session?.user ?? null,
          isAuthenticated: !!session,
          loading: false,
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState(state => ({ ...state, loading: false }));
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setAuthState({
        user: session?.user ?? null,
        isAuthenticated: !!session,
        loading: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!user?.email_confirmed_at) {
        return {
          user: null,
          error: { message: 'Please verify your email before logging in.' }
        };
      }

      setAuthState({
        user,
        isAuthenticated: !!session,
        loading: false
      });

      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: handleAuthError(error as SupabaseAuthError) 
      };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });

      if (error) throw error;

      return { 
        user, 
        error: null 
      };
    } catch (error) {
      return { 
        user: null, 
        error: handleAuthError(error as SupabaseAuthError) 
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { 
        error: handleAuthError(error as SupabaseAuthError) 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ authState, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
