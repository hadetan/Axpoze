import { ISavingsHistory } from "../types/savings.types";

export interface ContributionSuggestion {
  amount: number;
  frequency: string;
  type: 'deadline' | 'general';
}

export interface ContributionStrategy {
  amount: number;
  frequency: string;
  type: 'deadline' | 'general' | 'smart';
  confidence: number;
  description?: string;
}

interface HistoricalMetrics {
  averageContribution: number;
  highestContribution: number;
  preferredFrequency: string;
  contributionPattern: 'consistent' | 'irregular' | 'increasing' | 'decreasing';
}

interface HistoricalPatternAnalysis {
  weekdayPreference: Record<number, number>;
  monthlyTiming: 'early' | 'mid' | 'late';
  averageInterval: number;
  consistencyScore: number;
  seasonalPattern?: Record<number, number>;
  recentTrend: 'increasing' | 'decreasing' | 'stable';
}

const analyzeHistory = (history: ISavingsHistory[]): HistoricalMetrics & HistoricalPatternAnalysis => {
  if (!history.length) {
    return {
      averageContribution: 0,
      highestContribution: 0,
      preferredFrequency: 'month',
      contributionPattern: 'irregular',
      weekdayPreference: {},
      monthlyTiming: 'mid',
      averageInterval: 30,
      consistencyScore: 0,
      recentTrend: 'stable'
    };
  }

  const sortedHistory = [...history].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate basic metrics
  const total = history.reduce((sum, item) => sum + item.amount, 0);
  const average = total / history.length;
  const highest = Math.max(...history.map(item => item.amount));

  // Analyze contribution frequency
  const intervals = getContributionIntervals(sortedHistory);
  const preferredFrequency = determinePreferredFrequency(intervals);

  // Analyze pattern
  const pattern = analyzeContributionPattern(sortedHistory);

  // Analyze weekday preference
  const weekdayPreference = sortedHistory.reduce((acc, item) => {
    const day = new Date(item.date).getDay();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Analyze monthly timing pattern
  const dayOfMonthCounts = sortedHistory.reduce((acc, item) => {
    const day = new Date(item.date).getDate();
    if (day <= 10) acc.early++;
    else if (day <= 20) acc.mid++;
    else acc.late++;
    return acc;
  }, { early: 0, mid: 0, late: 0 });

  const monthlyTiming = Object.entries(dayOfMonthCounts)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0] as 'early' | 'mid' | 'late';

  // Calculate consistency score (0-1)
  const amounts = sortedHistory.map(item => item.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
  const consistencyScore = Math.max(0, 1 - (Math.sqrt(variance) / mean));

  // Analyze recent trend using last 3 contributions
  const recentAmounts = amounts.slice(-3);
  const recentTrend = analyzeRecentTrend(recentAmounts);

  // Calculate preferred intervals
  const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  // Seasonal pattern analysis
  const seasonalPattern = analyzeSeasonalPattern(sortedHistory);

  return {
    averageContribution: average,
    highestContribution: highest,
    preferredFrequency,
    contributionPattern: pattern,
    weekdayPreference,
    monthlyTiming,
    averageInterval,
    consistencyScore,
    seasonalPattern,
    recentTrend
  };
};

const getContributionIntervals = (sortedHistory: ISavingsHistory[]): number[] => {
  const intervals: number[] = [];
  for (let i = 1; i < sortedHistory.length; i++) {
    const days = Math.round(
      (new Date(sortedHistory[i].date).getTime() - 
       new Date(sortedHistory[i-1].date).getTime()) / (1000 * 60 * 60 * 24)
    );
    intervals.push(days);
  }
  return intervals;
};

const determinePreferredFrequency = (intervals: number[]): string => {
  if (!intervals.length) return 'month';

  const averageInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
  
  if (averageInterval <= 7) return 'week';
  if (averageInterval <= 14) return 'fortnight';
  return 'month';
};

const analyzeContributionPattern = (
  sortedHistory: ISavingsHistory[]
): 'consistent' | 'irregular' | 'increasing' | 'decreasing' => {
  if (sortedHistory.length < 3) return 'irregular';

  const amounts = sortedHistory.map(item => item.amount);
  const variations = amounts.slice(1).map((amount, i) => amount - amounts[i]);
  
  const increasing = variations.filter(v => v > 0).length;
  const decreasing = variations.filter(v => v < 0).length;
  const consistent = variations.filter(v => Math.abs(v) < amounts[0] * 0.1).length;

  if (consistent > variations.length * 0.7) return 'consistent';
  if (increasing > variations.length * 0.7) return 'increasing';
  if (decreasing > variations.length * 0.7) return 'decreasing';
  return 'irregular';
};

const analyzeSeasonalPattern = (history: ISavingsHistory[]): Record<number, number> => {
  return history.reduce((acc, item) => {
    const month = new Date(item.date).getMonth();
    acc[month] = (acc[month] || 0) + item.amount;
    return acc;
  }, {} as Record<number, number>);
};

const analyzeRecentTrend = (amounts: number[]): 'increasing' | 'decreasing' | 'stable' => {
  if (amounts.length < 2) return 'stable';
  
  const changes = amounts.slice(1).map((amount, i) => amount - amounts[i]);
  const increasingCount = changes.filter(c => c > 0).length;
  const decreasingCount = changes.filter(c => c < 0).length;

  if (increasingCount > decreasingCount) return 'increasing';
  if (decreasingCount > increasingCount) return 'decreasing';
  return 'stable';
};

export const calculateRequiredContribution = (
  remainingAmount: number,
  daysRemaining: number | null,
  history: ISavingsHistory[] = []
): ContributionStrategy[] => {
  const strategies: ContributionStrategy[] = [];
  const patterns = analyzeHistory(history);

  // Add pattern-based strategies
  if (patterns.consistencyScore > 0.7) {
    // Suggest based on established pattern
    const preferredWeekday = Object.entries(patterns.weekdayPreference)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    const nextDate = getNextDateForWeekday(Number(preferredWeekday));
    strategies.push({
      amount: patterns.averageContribution,
      frequency: `every ${nextDate.toLocaleDateString('en-US', { weekday: 'long' })}`,
      type: 'smart',
      confidence: patterns.consistencyScore,
      description: 'Based on your consistent contribution pattern'
    });
  }

  if (patterns.monthlyTiming) {
    const timingDescription = {
      early: '1st-10th',
      mid: '11th-20th',
      late: '21st-31st'
    }[patterns.monthlyTiming];

    strategies.push({
      amount: calculateOptimalAmount(remainingAmount, patterns),
      frequency: `monthly (${timingDescription})`,
      type: 'smart',
      confidence: 0.85,
      description: 'Aligned with your preferred contribution timing'
    });
  }

  // If we have a deadline
  if (daysRemaining) {
    // Daily strategy
    if (daysRemaining <= 7) {
      strategies.push({
        amount: Math.ceil(remainingAmount / daysRemaining),
        frequency: 'per day',
        type: 'deadline',
        confidence: 0.9,
        description: 'Based on upcoming deadline'
      });
    }

    // Weekly strategy
    if (daysRemaining <= 30) {
      const weeksRemaining = Math.ceil(daysRemaining / 7);
      strategies.push({
        amount: Math.ceil(remainingAmount / weeksRemaining),
        frequency: 'per week',
        type: 'deadline',
        confidence: 0.85,
        description: 'Weekly contributions to meet deadline'
      });
    }

    // Monthly strategy
    const monthsRemaining = Math.ceil(daysRemaining / 30);
    strategies.push({
      amount: Math.ceil(remainingAmount / monthsRemaining),
      frequency: 'per month',
      type: 'deadline',
      confidence: 0.8,
      description: 'Monthly contributions to meet deadline'
    });
  }

  // Smart strategies based on history
  if (patterns.averageContribution > 0) {
    // Suggest based on user's typical contribution pattern
    strategies.push({
      amount: Math.min(
        patterns.averageContribution,
        remainingAmount
      ),
      frequency: `per ${patterns.preferredFrequency}`,
      type: 'smart',
      confidence: 0.95,
      description: 'Based on your contribution history'
    });

    // Stretch goal based on highest contribution
    if (patterns.highestContribution > patterns.averageContribution) {
      strategies.push({
        amount: Math.min(
          patterns.highestContribution,
          remainingAmount
        ),
        frequency: 'stretch goal',
        type: 'smart',
        confidence: 0.7,
        description: 'Ambitious goal based on your best contribution'
      });
    }
  }

  // General strategies
  strategies.push({
    amount: Math.ceil(remainingAmount / 10),
    frequency: 'flexible',
    type: 'general',
    confidence: 0.6,
    description: '10 equal contributions'
  });

  return strategies.sort((a, b) => b.confidence - a.confidence);
};

const calculateOptimalAmount = (
  remainingAmount: number,
  patterns: HistoricalMetrics & HistoricalPatternAnalysis
): number => {
  const baseAmount = patterns.averageContribution;
  const adjustmentFactor = patterns.recentTrend === 'increasing' ? 1.1 : 
                          patterns.recentTrend === 'decreasing' ? 0.9 : 1;

  return Math.ceil(baseAmount * adjustmentFactor);
};

const getNextDateForWeekday = (weekday: number): Date => {
  const today = new Date();
  const daysUntilNext = (weekday - today.getDay() + 7) % 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntilNext);
  return nextDate;
};

export const calculateMilestoneProgress = (
  currentAmount: number,
  milestoneAmount: number
): number => {
  return Math.min((currentAmount / milestoneAmount) * 100, 100);
};

export const getMilestoneStatus = (
  currentAmount: number,
  milestone: {
    target_amount: number;
    deadline?: string | null;
  }
) => {
  const progress = calculateMilestoneProgress(currentAmount, milestone.target_amount);
  const isCompleted = progress >= 100;

  if (!milestone.deadline) {
    return {
      status: isCompleted ? 'completed' : 'in-progress',
      progress
    };
  }

  const now = new Date();
  const deadline = new Date(milestone.deadline);
  const isOverdue = now > deadline;

  if (isCompleted) return { status: 'completed', progress };
  if (isOverdue) return { status: 'overdue', progress };

  const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return {
    status: daysRemaining <= 7 ? 'urgent' : 'in-progress',
    progress,
    daysRemaining
  };
};
