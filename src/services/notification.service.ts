import { supabase } from './supabase';
import { INotification } from '../types/notification.types';

export const notificationService = {
  async getNotifications(userId: string): Promise<INotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createNotification(notification: Omit<INotification, 'id' | 'created_at'>): Promise<INotification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async archiveNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'archived' })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }
};
