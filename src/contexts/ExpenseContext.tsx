import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { IExpense, IExpenseFormData, IExpenseCategory } from '../types/expense.types';
import { expenseService } from '../services/expense.service';
import { useAuth } from './AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface ExpenseContextType {
  expenses: IExpense[];
  categories: IExpenseCategory[];
  loading: boolean;
  error: string | null;
  fetchExpenses: (filters?: {
    category?: string;
    search?: string;
    paymentMode?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
  addExpense: (data: IExpenseFormData) => Promise<IExpense | undefined>;
  deleteExpense: (id: string) => Promise<void>;
  updateExpense: (id: string, data: Partial<IExpenseFormData>) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [categories, setCategories] = useState<IExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  const fetchExpenses = useCallback(async (filters?: {
    category?: string;
    search?: string;
    paymentMode?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    if (!authState.user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const [expensesData, categoriesData] = await Promise.all([
        expenseService.getExpenses(authState.user.id, filters),
        expenseService.getCategories(authState.user.id)
      ]);
      
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authState.user?.id]);

  const addExpense = async (data: IExpenseFormData) => {
    if (!authState.user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const newExpense = await expenseService.addExpense(data, authState.user.id);
      // Update expenses list immediately with the new expense at the beginning
      setExpenses(prev => [
        {
          ...newExpense,
          category: categories.find(c => c.id === newExpense.category_id)
        },
        ...prev
      ]);
      return newExpense;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const expenseToDelete = expenses.find(e => e.id === id);
      if (!expenseToDelete) {
        throw new Error('Expense not found');
      }

      await expenseService.deleteExpense(id);
      
      // Optimistic update
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete expense';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (id: string, data: Partial<IExpenseFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedExpense = await expenseService.updateExpense(id, data);
      setExpenses(prev => prev.map(expense => 
        expense.id === id ? updatedExpense : expense
      ));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authState.user?.id) return;

    const channel = supabase
      .channel(`expenses:${authState.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${authState.user.id}`
        },
        async (payload) => {
          console.log('Real-time change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const category = categories.find(c => c.id === payload.new.category_id);
            const newExpense: IExpense = {
              ...payload.new,
              category,
              id: payload.new.id,
              user_id: payload.new.user_id,
              category_id: payload.new.category_id,
              amount: payload.new.amount,
              description: payload.new.description,
              date: payload.new.date,
              payment_mode: payload.new.payment_mode,
              created_at: payload.new.created_at,
            };
            setExpenses(prev => [newExpense, ...prev]);
          }
          
          if (payload.eventType === 'DELETE') {
            setExpenses(prev => 
              prev.filter(expense => expense.id !== payload.old.id)
            );
          }

          if (payload.eventType === 'UPDATE') {
            setExpenses(prev => 
              prev.map(expense => {
                if (expense.id === payload.new.id) {
                  const category = expense.category_id === payload.new.category_id
                    ? expense.category
                    : categories.find(c => c.id === payload.new.category_id);
                  
                  return {
                    ...expense,
                    ...payload.new,
                    category
                  };
                }
                return expense;
              })
            );
          }
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [authState.user?.id, categories]);

  return (
    <ExpenseContext.Provider 
      value={{ 
        expenses, 
        categories, 
        loading, 
        error, 
        fetchExpenses, 
        addExpense, 
        deleteExpense,
        updateExpense 
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
