import { supabase } from './supabase';

export const themeService = {
  async updateThemePreference(userId: string, theme: 'light' | 'dark'): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ theme_preference: theme })
      .eq('id', userId);

    if (error) throw error;
  },

  async getThemePreference(userId: string): Promise<'light' | 'dark'> {
    const { data, error } = await supabase
      .from('users')
      .select('theme_preference')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.theme_preference || 'dark';
  }
};
