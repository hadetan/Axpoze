import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { IAuthState } from '../types/auth.types';

const AuthContext = createContext<{
    authState: IAuthState;
    signIn: (email: string, password: string) => Promise<any>;
    signUp: (email: string, password: string, fullName: string) => Promise<any>;
    signOut: () => Promise<any>;
}>({
    authState: { isAuthenticated: false, user: null, loading: true },
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<IAuthState>({
        isAuthenticated: false,
        user: null,
        loading: true,
    });

    useEffect(() => {
        // Check current session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setAuthState({
                user: session?.user ?? null,
                isAuthenticated: !!session,
                loading: false,
            });
        };
        
        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthState({
                user: session?.user ?? null,
                isAuthenticated: !!session,
                loading: false,
            });
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        return supabase.auth.signInWithPassword({ email, password });
    };

    const signUp = async (email: string, password: string, fullName: string) => {
        return supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });
    };

    const signOut = async () => {
        return supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ authState, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
