export interface UserProfile {
  industry: string;
  preferredTones: string[];
  preferredFormats: string[];
  generationCount: number;
  topicHistory: string[];
  feedback: {
    positive: number;
    negative: number;
    positiveTopics: string[];
    negativeTopics: string[];
  };
  updatedAt: string;
}
