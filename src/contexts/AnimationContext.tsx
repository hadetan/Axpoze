import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

interface AnimationContextType {
  animationsEnabled: boolean;
  toggleAnimations: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();

  useEffect(() => {
    const loadPreference = async () => {
      if (!authState.user?.id) return;
      
      try {
        setLoading(true);
        setError(null);

        // First check if user has preferences
        let { data, error } = await supabase
          .from('users')
          .select('animation_enabled')
          .eq('id', authState.user.id);

        if (error) throw error;

        // If no row exists or animation_enabled is null, create/update with default value
        if (!data?.length || data[0].animation_enabled === null) {
          const { error: updateError } = await supabase
            .from('users')
            .upsert({ 
              id: authState.user.id,
              email: authState.user.email,
              animation_enabled: true,
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            });

          if (updateError) throw updateError;
          setAnimationsEnabled(true);
        } else {
          setAnimationsEnabled(data[0].animation_enabled);
        }
      } catch (err: any) {
        console.error('Failed to load animation preference:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPreference();
  }, [authState.user?.id, authState.user?.email]);

  const toggleAnimations = async () => {
    if (!authState.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const newValue = !animationsEnabled;
      const { error } = await supabase
        .from('users')
        .update({ 
          animation_enabled: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (error) throw error;
      setAnimationsEnabled(newValue);
    } catch (err: any) {
      console.error('Failed to update animation preference:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimationContext.Provider value={{ 
      animationsEnabled, 
      toggleAnimations,
      loading,
      error 
    }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};
