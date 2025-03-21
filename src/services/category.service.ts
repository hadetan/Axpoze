import { supabase } from './supabase';
import { IExpenseCategory } from '../types/expense.types';

interface CategoryFormData {
  name: string;
  color: string;
}

export const categoryService = {
  async createCategory(data: CategoryFormData, userId: string): Promise<IExpenseCategory> {
    const { data: newCategory, error } = await supabase
      .from('expense_categories')
      .insert([{ 
        ...data, 
        user_id: userId,
        icon: 'default' // We can enhance this later
      }])
      .select()
      .single();

    if (error) throw error;
    return newCategory;
  },

  async updateCategory(id: string, data: CategoryFormData): Promise<IExpenseCategory> {
    const { data: updatedCategory, error } = await supabase
      .from('expense_categories')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedCategory;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('expense_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
