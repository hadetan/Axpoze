export type SavingType = 'Emergency' | 'Investment' | 'Goal';

export interface ISavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  priority: 'High' | 'Medium' | 'Low';
  type: SavingType;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ISavingsFormData {
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  priority: 'High' | 'Medium' | 'Low';
  type: SavingType;
  notes?: string;
}

export interface ISavingsHistory {
  id: string;
  goal_id: string;
  amount: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface ISavingsHistoryFormData {
  amount: number;
  date: string;
  notes?: string;
}
