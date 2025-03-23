export type NotificationType = 'goal' | 'expense' | 'system';
export type NotificationPriority = 'high' | 'medium' | 'low';
export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface INotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

export interface NotificationTrigger {
  type: NotificationType;
  condition: TriggerCondition;
  message: string;
  priority: NotificationPriority;
}

interface TriggerCondition {
  goalNearDeadline?: number;
  goalProgressBelow?: number;
  goalAchieved?: boolean;
  milestoneAchieved?: boolean;
  milestoneNearDeadline?: number;
  expenseAbove?: number;
  monthlySpendingExceeds?: number;
  categorySpendingExceeds?: {
    category_id: string;
    amount: number;
  };
}

export interface INotificationPreferences {
  id: string;
  user_id: string;
  goal_deadline_reminder: boolean;
  deadline_days_threshold: number;
  goal_progress_alert: boolean;
  progress_threshold: number;
  monthly_spending_alert: boolean;
  spending_threshold: number;
  email_notifications: boolean;
  notification_types: NotificationType[];
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferencesFormData {
  goal_deadline_reminder: boolean;
  deadline_days_threshold: number;
  goal_progress_alert: boolean;
  progress_threshold: number;
  monthly_spending_alert: boolean;
  spending_threshold: number;
  email_notifications: boolean;
  notification_types: NotificationType[];
}
