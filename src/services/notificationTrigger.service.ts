import { NotificationType, NotificationPriority, NotificationTrigger, TriggerCondition, INotificationPreferences } from '../types/notification.types';
import { notificationService } from './notification.service';
import { ISavingsGoal } from '../types/savings.types';
import { IExpense } from '../types/expense.types';
import { formatCurrency } from '../utils/currency';

export const notificationTriggerService = {
  async evaluateGoalTriggers(
    goal: ISavingsGoal, 
    preferences: INotificationPreferences
  ): Promise<void> {
    if (!preferences.goal_progress_alert) return;

    const triggers: NotificationTrigger[] = [];

    // Check if goal target is reached
    if (goal.current_amount >= goal.target_amount) {
      triggers.push({
        type: 'goal',
        condition: { goalReached: true } as TriggerCondition,
        message: `Goal reached: ${goal.name} (${formatCurrency(goal.target_amount)})`,
        priority: 'high' as NotificationPriority
      });
    }

    // Check if goal deadline is approaching
    if (goal.deadline) {
      const daysUntilDeadline = Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeadline <= preferences.deadline_days_threshold && daysUntilDeadline > 0) {
        triggers.push({
          type: 'goal',
          condition: { deadlineApproaching: daysUntilDeadline } as TriggerCondition,
          message: `Goal deadline approaching: ${goal.name}`,
          priority: daysUntilDeadline <= 3 ? 'high' : 'medium'
        });
      }
    }

    // Create notifications for triggered conditions
    for (const trigger of triggers) {
      await notificationService.createNotification({
        user_id: goal.user_id,
        title: 'Goal Update',
        message: trigger.message,
        type: trigger.type as NotificationType,
        priority: trigger.priority as NotificationPriority,
        status: 'unread',
        action_url: `/savings?goal=${goal.id}`
      });
    }
  },

  async evaluateExpenseTriggers(
    expenses: IExpense[], 
    preferences: INotificationPreferences
  ): Promise<void> {
    if (!preferences.monthly_spending_alert || !preferences.spending_threshold) {
      return;
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });

    const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const averageMonthlySpend = 50000; // This should come from historical data

    if (totalSpent > averageMonthlySpend * (preferences.spending_threshold / 100)) {
      const userId = expenses[0]?.user_id;
      if (!userId) return;

      await notificationService.createNotification({
        user_id: userId,
        title: 'High Monthly Spending',
        message: `Your spending this month (${totalSpent.toLocaleString()}) has exceeded ${preferences.spending_threshold}% of your average`,
        type: 'expense',
        priority: 'high',
        status: 'unread',
        action_url: '/expenses'
      });
    }
  }
};
