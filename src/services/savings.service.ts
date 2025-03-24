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
    // When creating a new goal, store initial amount separately
    const initialAmount = data.current_amount || 0;
    const { data: newGoal, error } = await supabase
      .from('savings')
      .insert([{ 
        ...data, 
        user_id: userId,
        initial_amount: initialAmount, // Add this field to your savings table
        current_amount: initialAmount
      }])
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
    // First, add the contribution
    const { data: contribution, error } = await supabase
      .from('savings_history')
      .insert([{ ...data, goal_id: goalId }])
      .select()
      .single();

    if (error) throw error;

    // Calculate the new total amount using RPC function
    const { data: newTotal, error: calcError } = await supabase
      .rpc('calculate_goal_progress', { goal_id: goalId });

    if (calcError) throw calcError;

    // Get the goal's initial amount
    const { data: goal, error: goalError } = await supabase
      .from('savings')
      .select('initial_amount')
      .eq('id', goalId)
      .single();

    if (goalError) throw goalError;

    // Update goal's current amount (totalContributions + initialAmount)
    const { error: updateError } = await supabase
      .from('savings')
      .update({ current_amount: (newTotal || 0) + (goal?.initial_amount || 0) })
      .eq('id', goalId);

    if (updateError) throw updateError;

    return contribution;
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

  async deleteContribution(goalId: string, contributionId: string): Promise<void> {
    const { error } = await supabase
      .from('savings_history')
      .delete()
      .eq('id', contributionId)
      .eq('goal_id', goalId);

    if (error) throw error;
  }
};

// Add this to your database setup (Supabase SQL Editor):
/*
-- Create or replace the function to calculate goal progress
CREATE OR REPLACE FUNCTION calculate_goal_progress(goal_id UUID)
RETURNS NUMERIC AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(amount)
     FROM savings_history
     WHERE goal_id = $1),
    0
  );
END;
$$ LANGUAGE plpgsql;
*/
