import { supabase } from './supabase';
import { ISavingsGoal, ISavingsFormData, ISavingsHistory, ISavingsHistoryFormData, ISavingsMilestone, ISavingsMilestoneFormData } from '../types/savings.types';

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
    // First, add the contribution
    const { data: contribution, error } = await supabase
      .from('savings_history')
      .insert([{ ...data, goal_id: goalId }])
      .select()
      .single();

    if (error) throw error;

    // Calculate new total using rpc call
    const { data: total, error: calcError } = await supabase
      .rpc('calculate_goal_progress', { goal_id: goalId });

    if (calcError) throw calcError;

    // Update goal's current amount
    const { error: updateError } = await supabase
      .from('savings')
      .update({ current_amount: total || 0 })
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

  async getMilestones(goalId: string): Promise<ISavingsMilestone[]> {
    const { data, error } = await supabase
      .from('savings_milestones')
      .select('*')
      .eq('goal_id', goalId)
      .order('target_amount', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createMilestone(
    goalId: string,
    data: ISavingsMilestoneFormData
  ): Promise<ISavingsMilestone> {
    const { data: milestone, error } = await supabase
      .from('savings_milestones')
      .insert([{ ...data, goal_id: goalId }])
      .select()
      .single();

    if (error) throw error;
    return milestone;
  },

  async updateMilestone(
    id: string,
    data: Partial<ISavingsMilestoneFormData>
  ): Promise<ISavingsMilestone> {
    const { data: updatedMilestone, error } = await supabase
      .from('savings_milestones')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedMilestone;
  },

  async deleteMilestone(id: string): Promise<void> {
    const { error } = await supabase
      .from('savings_milestones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async checkMilestoneAchievement(
    goalId: string,
    currentAmount: number
  ): Promise<ISavingsMilestone[]> {
    // Get unachieved milestones that should now be achieved
    const { data: milestones, error } = await supabase
      .from('savings_milestones')
      .select()
      .eq('goal_id', goalId)
      .eq('achieved', false)
      .lte('target_amount', currentAmount);

    if (error) throw error;
    if (!milestones?.length) return [];

    // Update them as achieved
    const updates = milestones.map(milestone => ({
      id: milestone.id,
      achieved: true,
      achieved_at: new Date().toISOString()
    }));

    const updatePromises = updates.map(update => 
      supabase
        .from('savings_milestones')
        .update(update)
        .eq('id', update.id)
        .select()
        .single()
    );

    try {
      const results = await Promise.all(updatePromises);
      const updatedMilestones = results
        .map(result => result.data)
        .filter((data): data is ISavingsMilestone => data !== null);
      return updatedMilestones;
    } catch (updateError) {
      console.error('Error updating milestones:', updateError);
      return [];
    }
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
