import type { SavedScenario } from '@/types/saved-scenario';

const STORAGE_KEY = 'rsg_scenarios';

export function getScenarios(): SavedScenario[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveScenario(scenario: SavedScenario): void {
  const scenarios = getScenarios();
  scenarios.unshift(scenario);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

export function deleteScenario(id: string): void {
  const scenarios = getScenarios().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

export function getScenarioById(id: string): SavedScenario | null {
  return getScenarios().find((s) => s.id === id) || null;
}
