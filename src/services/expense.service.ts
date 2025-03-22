import { supabase } from './supabase';
import { IExpense, IExpenseFormData, IExpenseCategory } from '../types/expense.types';

interface ExpenseFilters {
  category?: string;
  search?: string;
  paymentMode?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const expenseService = {
  async getExpenses(userId: string, filters?: ExpenseFilters): Promise<IExpense[]> {
    let query = supabase
      .from('expenses')
      .select(`
        *,
        category:expense_categories(*)
      `)
      .eq('user_id', userId);

    if (filters) {
      const { category, search, paymentMode, startDate, endDate, minAmount, maxAmount } = filters;
      
      if (category) {
        query = query.eq('category_id', category);
      }
      
      if (paymentMode) {
        query = query.eq('payment_mode', paymentMode);
      }
      
      if (search) {
        // Fix: Use ilike for text search in description only
        query = query.ilike('description', `%${search}%`);
      }
      
      if (startDate) {
        query = query.gte('date', startDate);
      }
      
      if (endDate) {
        query = query.lte('date', endDate);
      }

      if (minAmount) {
        query = query.gte('amount', minAmount);
      }

      if (maxAmount) {
        query = query.lte('amount', maxAmount);
      }
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCategories(userId: string): Promise<IExpenseCategory[]> {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('user_id', userId)
      .neq('name', 'Uncategorized'); // Add this line to exclude Uncategorized

    if (error) throw error;
    return data || [];
  },

  async addExpense(expense: IExpenseFormData, userId: string): Promise<IExpense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: userId }])
      .select(`
        *,
        category:expense_categories(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async createExpense(expense: IExpenseFormData, userId: string): Promise<IExpense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: userId }])
      .select(`
        *,
        category:expense_categories(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateExpense(expenseId: string, data: Partial<IExpenseFormData>): Promise<IExpense> {
    const { data: updatedExpense, error } = await supabase
      .from('expenses')
      .update(data)
      .eq('id', expenseId)
      .select(`
        *,
        category:expense_categories(*)
      `)
      .single();

    if (error) throw error;
    return updatedExpense;
  },

  async deleteExpense(expenseId: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
  }
};
