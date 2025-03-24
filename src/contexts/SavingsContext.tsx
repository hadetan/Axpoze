import React, { createContext, useContext, useState, useCallback } from 'react';
import { ISavingsGoal, ISavingsFormData, ISavingsHistory, ISavingsHistoryFormData } from '../types/savings.types';
import { savingsService } from '../services/savings.service';
import { useAuth } from './AuthContext';
import { notificationTriggerService } from '../services/notificationTrigger.service';
import { notificationPreferencesService } from '../services/notificationPreferences.service';
import { supabase } from '../services/supabase';

interface SavingsContextType {
  goals: ISavingsGoal[];
  loading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  addGoal: (data: ISavingsFormData) => Promise<ISavingsGoal>;
  updateGoal: (id: string, data: Partial<ISavingsFormData>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  history: Record<string, ISavingsHistory[]>;
  loadingHistory: boolean;
  addContribution: (goalId: string, data: ISavingsHistoryFormData) => Promise<void>;
  fetchHistory: (goalId: string) => Promise<void>;
  deleteContribution: (goalId: string, contributionId: string) => Promise<void>;
  fetchSavings: () => Promise<void>; // Add this line
}

const SavingsContext = createContext<SavingsContextType | null>(null);

export const SavingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<ISavingsGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, ISavingsHistory[]>>({});
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { authState } = useAuth();

  const fetchGoals = useCallback(async () => {
    if (!authState.user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await savingsService.getSavingsGoals(authState.user.id);
      setGoals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authState.user?.id]);

  const addGoal = async (data: ISavingsFormData) => {
    if (!authState.user?.id) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);
    try {
      const newGoal = await savingsService.createSavingsGoal(data, authState.user.id);
      setGoals(prev => [newGoal, ...prev]);

      // Check goal triggers
      const preferences = await notificationPreferencesService.getPreferences(authState.user.id);
      await notificationTriggerService.evaluateGoalTriggers(newGoal, preferences);

      return newGoal;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (id: string, data: Partial<ISavingsFormData>) => {
    if (!authState.user?.id) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);
    try {
      const updatedGoal = await savingsService.updateSavingsGoal(id, data);
      setGoals(prev => prev.map(goal => 
        goal.id === id ? updatedGoal : goal
      ));

      // Check goal triggers after update
      const preferences = await notificationPreferencesService.getPreferences(authState.user.id);
      await notificationTriggerService.evaluateGoalTriggers(updatedGoal, preferences);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await savingsService.deleteSavingsGoal(id);
      setGoals(prev => prev.filter(goal => goal.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = useCallback(async (goalId: string) => {
    if (!authState.user?.id) return;
    
    setLoadingHistory(true);
    try {
      const data = await savingsService.getSavingsHistory(goalId);
      setHistory(prev => ({ ...prev, [goalId]: data }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, [authState.user?.id]);

  const addContribution = async (goalId: string, data: ISavingsHistoryFormData) => {
    if (!authState.user?.id) throw new Error('User not authenticated');

    setLoading(true);
    try {
      const contribution = await savingsService.addContribution(goalId, data);
      
      // Update history state
      setHistory(prev => ({
        ...prev,
        [goalId]: [...(prev[goalId] || []), contribution]
      }));

      // Fetch updated goal to get new current_amount
      const { data: updatedGoal } = await supabase
        .from('savings')
        .select('*')
        .eq('id', goalId)
        .single();

      if (updatedGoal) {
        setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteContribution = async (goalId: string, contributionId: string) => {
    try {
      await savingsService.deleteContribution(goalId, contributionId);
      
      // Update local state after successful deletion
      setHistory(prev => ({
        ...prev,
        [goalId]: prev[goalId].filter(item => item.id !== contributionId)
      }));

      // Re-fetch the updated goal to get new current_amount
      const updatedGoal = (await savingsService.getSavingsGoals(authState.user!.id))
        .find(g => g.id === goalId);

      if (updatedGoal) {
        setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const fetchSavings = useCallback(async () => {
    if (!authState.user?.id) return;
    await fetchGoals();
  }, [fetchGoals]);

  return (
    <SavingsContext.Provider value={{
      goals,
      loading,
      error,
      fetchGoals,
      addGoal,
      updateGoal,
      deleteGoal,
      history,
      loadingHistory,
      addContribution,
      fetchHistory,
      deleteContribution,
      fetchSavings, // Add this line
    }}>
      {children}
    </SavingsContext.Provider>
  );
};

export const useSavings = () => {
  const context = useContext(SavingsContext);
  if (!context) {
    throw new Error('useSavings must be used within a SavingsProvider');
  }
  return context;
};
