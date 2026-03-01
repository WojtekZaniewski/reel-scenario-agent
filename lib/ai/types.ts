import type { ContentType } from '@/types/brief';

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

export interface CarouselSlide {
  slideNumber: number;
  headline: string;
  content: string;
  visualDescription: string;
}

export interface ScenarioAIResponse {
  // Typ treści
  contentType?: ContentType;

  // Analiza Reelsów
  reelAnalyses: ReelAnalysis[];

  // Meta scenariusza
  topic: string;
  format: string;
  tone: string;
  duration: string;

  // Hook (reels)
  hook: string;
  hookVisual: string;
  hookRules: string;

  // Rozwinięcie (reels)
  mainContent: string[];
  mainContentRules: string;

  // CTA (wspólne)
  cta: string;
  ctaPunchline: string;

  // Notatki produkcyjne (reels)
  musicMood: string;
  subtitleStyle: string;
  cameraWork: string;
  estimatedRecordingTime: string;

  // Prognoza viralowości (wspólne)
  viralPotential: string;
  viralReason: string;
  bestPublishTime: string;
  needsFollowUp: boolean;
  followUpTopic?: string;

  // Legacy (kompatybilność)
  filmingTips: string[];
  estimatedDuration: string;
  patterns: string[];

  // Karuzela
  slides?: CarouselSlide[];
  numberOfSlides?: number;
  designStyle?: string;
  colorScheme?: string;
  typography?: string;

  // Post
  photoDescription?: string;
  editingStyle?: string;
  photoTips?: string[];

  // Wspólne: caption i hashtagi (karuzela + post)
  captionText?: string;
  hashtags?: string[];
}
