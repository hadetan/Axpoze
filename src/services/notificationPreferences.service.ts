import { supabase } from './supabase';
import { INotificationPreferences, NotificationPreferencesFormData } from '../types/notification.types';

export const notificationPreferencesService = {
  async getPreferences(userId: string): Promise<INotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found
        // Create default preferences
        return this.createPreferences(userId);
      }
      throw error;
    }

    return data;
  },

  async createPreferences(userId: string): Promise<INotificationPreferences> {
    const defaultPreferences = {
      user_id: userId,
      goal_deadline_reminder: true,
      deadline_days_threshold: 7,
      goal_progress_alert: true,
      progress_threshold: 20,
      monthly_spending_alert: true,
      spending_threshold: 120,
      email_notifications: true,
      notification_types: ['goal', 'expense', 'system']
    };

    const { data, error } = await supabase
      .from('notification_preferences')
      .insert([defaultPreferences])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePreferences(userId: string, preferences: NotificationPreferencesFormData): Promise<INotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
