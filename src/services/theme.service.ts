import { supabase } from './supabase';

export const themeService = {
  async updateThemePreference(userId: string, theme: 'light' | 'dark'): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ theme_preference: theme })
      .eq('id', userId);

    if (error) {
      console.error('Error updating theme preference:', error);
      throw new Error('Failed to update theme preference');
    }
  },

  async getThemePreference(userId: string): Promise<'light' | 'dark'> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('theme_preference')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Return the stored preference or fall back to the localStorage value or 'dark'
      return data?.theme_preference || localStorage.getItem('themeMode') as 'light' | 'dark' || 'dark';
    } catch (error) {
      console.error('Error fetching theme preference:', error);
      // Fall back to localStorage or default
      return localStorage.getItem('themeMode') as 'light' | 'dark' || 'dark';
    }
  }
};
