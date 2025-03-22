import { NotificationTrigger, INotificationPreferences } from '../types/notification.types';
import { notificationService } from './notification.service';
import { ISavingsGoal } from '../types/savings.types';
import { IExpense } from '../types/expense.types';

export const notificationTriggerService = {
  async evaluateGoalTriggers(
    goal: ISavingsGoal, 
    preferences: INotificationPreferences
  ): Promise<void> {
    if (!preferences.goal_deadline_reminder && !preferences.goal_progress_alert) {
      return;
    }

    const triggers: NotificationTrigger[] = [];

    // Deadline trigger
    if (preferences.goal_deadline_reminder && goal.deadline) {
      const daysUntilDeadline = Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeadline <= preferences.deadline_days_threshold && daysUntilDeadline > 0) {
        triggers.push({
          type: 'goal',
          condition: { goalNearDeadline: daysUntilDeadline },
          message: `${goal.name} deadline is approaching! ${daysUntilDeadline} days left`,
          priority: daysUntilDeadline <= 3 ? 'high' : 'medium'
        });
      }
    }

    // Progress trigger
    if (preferences.goal_progress_alert && goal.deadline) {
      const progress = (goal.current_amount / goal.target_amount) * 100;
      const totalDays = Math.ceil(
        (new Date(goal.deadline).getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      const remainingDays = Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      const expectedProgress = ((totalDays - remainingDays) / totalDays) * 100;

      if (progress < expectedProgress - preferences.progress_threshold) {
        triggers.push({
          type: 'goal',
          condition: { goalProgressBelow: preferences.progress_threshold },
          message: `You're falling behind on ${goal.name}`,
          priority: 'medium'
        });
      }
    }

    // Create notifications for triggered conditions
    for (const trigger of triggers) {
      await notificationService.createNotification({
        user_id: goal.user_id,
        title: trigger.type === 'goal' ? 'Goal Alert' : 'Notification',
        message: trigger.message,
        type: trigger.type,
        priority: trigger.priority,
        status: 'unread',
        action_url: '/savings'
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
