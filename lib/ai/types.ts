export interface AccountSuggestionResponse {
  accounts: string[];
  reasoning: string;
}

export interface ReelAnalysis {
  hookType: string;
  dominantEmotion: string;
  tempoStructure: string;
  attentionMechanism: string;
  commentInsights: string;
  whyItWorks: string;
}

export interface ScenarioAIResponse {
  // Analiza Reelsów
  reelAnalyses: ReelAnalysis[];

  // Meta scenariusza
  topic: string;
  format: string;
  tone: string;
  duration: string;

  // Hook
  hook: string;
  hookVisual: string;
  hookRules: string;

  // Rozwinięcie
  mainContent: string[];
  mainContentRules: string;

  // CTA
  cta: string;
  ctaPunchline: string;

  // Notatki produkcyjne
  musicMood: string;
  subtitleStyle: string;
  cameraWork: string;
  estimatedRecordingTime: string;

  // Prognoza viralowości
  viralPotential: string;
  viralReason: string;
  bestPublishTime: string;
  needsFollowUp: boolean;
  followUpTopic?: string;

  // Legacy (kompatybilność)
  filmingTips: string[];
  estimatedDuration: string;
  patterns: string[];
}
