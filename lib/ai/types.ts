export interface AccountSuggestionResponse {
  accounts: string[];
  reasoning: string;
}

export interface ScenarioAIResponse {
  hook: string;
  mainContent: string[];
  cta: string;
  musicMood: string;
  filmingTips: string[];
  estimatedDuration: string;
  patterns: string[];
}
