export interface GrowthPlan {
  id: string;
  goal: string;
  difficulty: 'easy' | 'medium' | 'hard';
  durationWeeks: number;
  reelsPerWeek: number;
  startDate: string;
  endDate: string;
  industry: string;

  plan: GrowthPlanAI;

  completedDays: string[];
  notificationsEnabled: boolean;
  notificationTime: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;

  initialFollowers?: number;
  followerLog: FollowerEntry[];
}

export interface FollowerEntry {
  date: string;
  count: number;
  weekNumber: number;
}

export interface GrowthPlanAI {
  summary: string;
  weeklySchedule: WeeklyTask[];
  milestones: Milestone[];
  contentPillars: string[];
  bestPostingTimes: string[];
  expectedGrowth: string;
  tips: string[];
  difficultyOptions: DifficultyOption[];
}

export interface WeeklyTask {
  day: string;
  action: string;
  contentType: string;
}

export interface Milestone {
  week: number;
  target: string;
  metric: string;
  checkpoints: string[];
  expectedFollowers?: number;
}

export interface DifficultyOption {
  level: 'easy' | 'medium' | 'hard';
  label: string;
  durationWeeks: number;
  reelsPerWeek: number;
  description: string;
}
