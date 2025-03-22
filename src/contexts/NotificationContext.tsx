import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { INotification, NotificationTrigger } from '../types/notification.types';
import { notificationService } from '../services/notification.service';
import { useAuth } from './AuthContext';
import { useSavings } from './SavingsContext';
import { useExpense } from './ExpenseContext';

interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { authState } = useAuth();
  const { goals } = useSavings();
  const { expenses } = useExpense();

  const getUserId = useCallback((): string | null => {
    return authState.user?.id || null;
  }, [authState.user]);

  const createNotification = async (notification: Omit<INotification, 'id' | 'created_at'>) => {
    const userId = getUserId();
    if (!userId) return;
    
    try {
      const newNotification = await notificationService.createNotification({
        ...notification,
        user_id: userId
      });
      setNotifications(prev => [newNotification, ...prev]);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  const defaultTriggers: NotificationTrigger[] = [
    {
      type: 'goal',
      condition: {
        goalNearDeadline: 7,
        goalProgressBelow: 20,
        goalAchieved: true
      },
      message: '', // Will be dynamically set
      priority: 'medium'
    },
    {
      type: 'expense',
      condition: {
        monthlySpendingExceeds: 120, // 120% of average
      },
      message: '', // Will be dynamically set
      priority: 'high'
    }
  ];

  const checkGoalDeadlines = useCallback(() => {
    const userId = getUserId();
    if (!userId) return;

    const deadlineTrigger = defaultTriggers.find(
      t => t.type === 'goal' && t.condition.goalNearDeadline
    );

    if (!deadlineTrigger) return;

    goals.forEach(goal => {
      if (!goal.deadline) return;

      const daysUntilDeadline = Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeadline <= deadlineTrigger.condition.goalNearDeadline! && daysUntilDeadline > 0) {
        const progressPercentage = (goal.current_amount / goal.target_amount) * 100;
        createNotification({
          user_id: userId,
          title: 'Goal Deadline Approaching',
          message: `${goal.name} deadline is approaching! ${daysUntilDeadline} days left. Currently at ${progressPercentage.toFixed(1)}%`,
          type: 'goal',
          priority: daysUntilDeadline <= 3 ? 'high' : 'medium',
          status: 'unread',
          action_url: '/savings'
        });
      }
    });
  }, [goals, getUserId]);

  const checkGoalProgress = useCallback(() => {
    const userId = getUserId();
    if (!userId) return;

    const progressTrigger = defaultTriggers.find(
      t => t.type === 'goal' && t.condition.goalProgressBelow !== undefined
    );

    if (!progressTrigger) return;

    goals.forEach(goal => {
      const progress = (goal.current_amount / goal.target_amount) * 100;

      if (progress >= 100 && defaultTriggers.find(t => t.condition.goalAchieved)) {
        createNotification({
          user_id: userId,
          title: 'Goal Achieved! 🎉',
          message: `Congratulations! You've reached your goal: ${goal.name}`,
          type: 'goal',
          priority: 'high',
          status: 'unread',
          action_url: '/savings'
        });
      } else if (goal.deadline) {
        const totalDays = Math.ceil(
          (new Date(goal.deadline).getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        const remainingDays = Math.ceil(
          (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        const expectedProgress = ((totalDays - remainingDays) / totalDays) * 100;

        if (progress < expectedProgress - progressTrigger.condition.goalProgressBelow!) {
          createNotification({
            user_id: userId,
            title: 'Goal Progress Alert',
            message: `You're falling behind on ${goal.name}. Consider increasing your savings to stay on track.`,
            type: 'goal',
            priority: 'medium',
            status: 'unread',
            action_url: '/savings'
          });
        }
      }
    });
  }, [goals, getUserId]);

  const checkMonthlySpending = useCallback(() => {
    const userId = getUserId();
    if (!userId || !expenses.length) return;

    const spendingTrigger = defaultTriggers.find(
      t => t.type === 'expense' && t.condition.monthlySpendingExceeds
    );

    if (!spendingTrigger) return;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });

    const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const averageSpentLastMonth = 50000;

    if (totalSpent > averageSpentLastMonth * (spendingTrigger.condition.monthlySpendingExceeds! / 100)) {
      createNotification({
        user_id: userId,
        title: 'High Monthly Spending',
        message: `Your spending this month is higher than usual. You've spent ${totalSpent.toLocaleString()} so far.`,
        type: 'expense',
        priority: spendingTrigger.priority,
        status: 'unread',
        action_url: '/expenses'
      });
    }
  }, [expenses, getUserId]);

  const fetchNotifications = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications(userId);
      setNotifications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'read' } : n)
      );
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const archiveNotification = async (id: string) => {
    try {
      await notificationService.archiveNotification(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'archived' } : n)
      );
    } catch (err: any) {
      console.error('Failed to archive notification:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      console.error('Failed to delete notification:', err);
    }
  };

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    const runChecks = () => {
      checkGoalDeadlines();
      checkGoalProgress();
      checkMonthlySpending();
    };

    runChecks();
    const interval = setInterval(runChecks, 12 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkGoalDeadlines, checkGoalProgress, checkMonthlySpending, getUserId]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount: notifications.filter(n => n.status === 'unread').length,
      loading,
      error,
      fetchNotifications,
      markAsRead,
      archiveNotification,
      deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
