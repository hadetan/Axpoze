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
    // Get the user_id from the category being deleted
    const { data: categoryToDelete, error: categoryError } = await supabase
      .from('expense_categories')
      .select('user_id')
      .eq('id', id)
      .single();

    if (categoryError) throw categoryError;

    // Check for existing Uncategorized category for this user
    const { data: uncategorized, error: fetchError } = await supabase
      .from('expense_categories')
      .select('id')
      .eq('name', 'Uncategorized')
      .eq('user_id', categoryToDelete.user_id)
      .single();

    let uncategorizedId: string;

    if (fetchError) {
      // Create Uncategorized category if it doesn't exist
      const { data: newUncategorized, error: createError } = await supabase
        .from('expense_categories')
        .insert([{
          name: 'Uncategorized',
          color: '#808080',
          icon: 'default',
          user_id: categoryToDelete.user_id // Important: Set the user_id
        }])
        .select()
        .single();

      if (createError) throw createError;
      uncategorizedId = newUncategorized.id;
    } else {
      uncategorizedId = uncategorized.id;
    }

    // Move expenses to Uncategorized category
    const { error: updateError } = await supabase
      .from('expenses')
      .update({ category_id: uncategorizedId })
      .eq('category_id', id);

    if (updateError) throw updateError;

    // Finally delete the category
    const { error: deleteError } = await supabase
      .from('expense_categories')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
  }
};
