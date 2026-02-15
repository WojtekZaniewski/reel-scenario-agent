import type { GrowthPlan } from '@/types/growth-plan';

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
