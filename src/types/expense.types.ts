export type PaymentMode = 'Cash' | 'Card' | 'UPI' | 'Other';

export interface IExpenseCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface IExpense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  date: string;
  payment_mode: PaymentMode;
  created_at: string;
  category?: IExpenseCategory;
}

export interface IExpenseFormData {
  amount: number;
  category_id: string;
  description: string;
  date: string;
  payment_mode: PaymentMode;
}
