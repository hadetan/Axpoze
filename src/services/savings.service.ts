import { supabase } from './supabase';
import { ISavingsGoal, ISavingsFormData, ISavingsHistory, ISavingsHistoryFormData } from '../types/savings.types';

export const savingsService = {
  async getSavingsGoals(userId: string): Promise<ISavingsGoal[]> {
    const { data, error } = await supabase
      .from('savings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createSavingsGoal(data: ISavingsFormData, userId: string): Promise<ISavingsGoal> {
    const { data: newGoal, error } = await supabase
      .from('savings')
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return newGoal;
  },

  async updateSavingsGoal(id: string, data: Partial<ISavingsFormData>): Promise<ISavingsGoal> {
    const { data: updatedGoal, error } = await supabase
      .from('savings')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedGoal;
  },

  async deleteSavingsGoal(id: string): Promise<void> {
    const { error } = await supabase
      .from('savings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addContribution(
    goalId: string, 
    data: ISavingsHistoryFormData
  ): Promise<ISavingsHistory> {
    const { data: contribution, error } = await supabase
      .from('savings_history')
      .insert([{ ...data, goal_id: goalId }])
      .select()
      .single();

    if (error) throw error;

    // Update goal's current amount
    await this.updateSavingsGoal(goalId, {
      current_amount: supabase.rpc('calculate_goal_progress', { goal_id: goalId })
    });

    return contribution;
  },

  async deleteContribution(goalId: string, contributionId: string): Promise<void> {
    // Begin transaction
    const { data: contribution, error: fetchError } = await supabase
      .from('savings_history')
      .select('amount')
      .eq('id', contributionId)
      .single();

    if (fetchError) throw fetchError;

    const { error: deleteError } = await supabase
      .from('savings_history')
      .delete()
      .eq('id', contributionId);

    if (deleteError) throw deleteError;

    // Update goal's current amount
    await this.updateSavingsGoal(goalId, {
      current_amount: supabase.rpc('calculate_goal_progress', { goal_id: goalId })
    });
  },

  async getSavingsHistory(goalId: string): Promise<ISavingsHistory[]> {
    const { data, error } = await supabase
      .from('savings_history')
      .select('*')
      .eq('goal_id', goalId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
