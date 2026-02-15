import type { Brief } from './brief';
import type { ScenarioAIResponse } from '@/lib/ai/types';

export interface SavedScenario {
  id: string;
  title: string;
  brief: Brief;
  scenario: ScenarioAIResponse;
  accounts: string[];
  reelsUsed: number;
  createdAt: string;
  feedback?: 'positive' | 'negative';
}
