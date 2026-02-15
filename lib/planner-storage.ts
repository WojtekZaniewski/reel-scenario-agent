import type { GrowthPlan, FollowerEntry } from '@/types/growth-plan';

const PLAN_KEY = 'rsg_growth_plan';

const DAYS_PL = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

export function getGrowthPlan(): GrowthPlan | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveGrowthPlan(plan: GrowthPlan): void {
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

export function deleteGrowthPlan(): void {
  localStorage.removeItem(PLAN_KEY);
}

export function markDayCompleted(date: string): void {
  const plan = getGrowthPlan();
  if (!plan) return;
  if (!plan.completedDays.includes(date)) {
    plan.completedDays.push(date);
    saveGrowthPlan(plan);
  }
}

export function isDayCompleted(date: string): boolean {
  const plan = getGrowthPlan();
  if (!plan) return false;
  return plan.completedDays.includes(date);
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function shouldPostToday(plan: GrowthPlan): boolean {
  if (plan.status !== 'active') return false;

  const today = new Date();
  const start = new Date(plan.startDate);
  const end = new Date(plan.endDate);
  if (today < start || today > end) return false;

  const todayDay = DAYS_PL[today.getDay()];
  return plan.plan.weeklySchedule.some((t) => t.day === todayDay);
}

export function isTodayCompleted(): boolean {
  return isDayCompleted(getTodayStr());
}

export function markTodayCompleted(): void {
  markDayCompleted(getTodayStr());
}

export function getProgress(plan: GrowthPlan): { completed: number; total: number; percentage: number } {
  const start = new Date(plan.startDate);
  const end = new Date(plan.endDate);
  const now = new Date();

  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const scheduledDaysPerWeek = plan.plan.weeklySchedule.length;
  const totalWeeks = plan.durationWeeks;
  const total = scheduledDaysPerWeek * totalWeeks;

  const completed = plan.completedDays.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

export function getCurrentWeek(plan: GrowthPlan): number {
  const start = new Date(plan.startDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  const week = Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1;
  return Math.max(1, Math.min(week, plan.durationWeeks));
}

export function addFollowerEntry(count: number): void {
  const plan = getGrowthPlan();
  if (!plan) return;
  const today = getTodayStr();
  const week = getCurrentWeek(plan);

  // Replace if entry for today already exists
  const log = (plan.followerLog || []).filter((e) => e.date !== today);
  log.push({ date: today, count, weekNumber: week });
  plan.followerLog = log;
  saveGrowthPlan(plan);
}

export function getLatestFollowerCount(plan: GrowthPlan): number | null {
  const log = plan.followerLog || [];
  if (log.length === 0) return plan.initialFollowers ?? null;
  return log[log.length - 1].count;
}

export function getFollowerTrend(plan: GrowthPlan): 'exceeding' | 'on-track' | 'lagging' | null {
  const latest = getLatestFollowerCount(plan);
  if (latest === null) return null;

  const week = getCurrentWeek(plan);
  const milestones = plan.plan.milestones || [];

  // Find closest milestone for current week (current or next)
  const current = milestones.find((m) => m.week >= week && m.expectedFollowers != null);
  const past = [...milestones].reverse().find((m) => m.week <= week && m.expectedFollowers != null);

  const target = current || past;
  if (!target || target.expectedFollowers == null) return null;

  const diff = latest - target.expectedFollowers;
  const threshold = Math.max(target.expectedFollowers * 0.1, 20); // 10% or min 20

  if (diff > threshold) return 'exceeding';
  if (diff < -threshold) return 'lagging';
  return 'on-track';
}

export function getFollowerGrowth(plan: GrowthPlan): number | null {
  const latest = getLatestFollowerCount(plan);
  const initial = plan.initialFollowers;
  if (latest === null || initial == null) return null;
  return latest - initial;
}

export function getCurrentMilestoneTarget(plan: GrowthPlan): number | null {
  const week = getCurrentWeek(plan);
  const milestones = plan.plan.milestones || [];
  const current = milestones.find((m) => m.week >= week && m.expectedFollowers != null);
  return current?.expectedFollowers ?? null;
}
