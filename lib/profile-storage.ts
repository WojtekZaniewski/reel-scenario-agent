import type { UserProfile } from '@/types/user-profile';
import type { Brief } from '@/types/brief';
import { getScenarios } from '@/lib/storage';

const PROFILE_KEY = 'rsg_profile';

function defaultProfile(): UserProfile {
  return {
    industry: '',
    preferredTones: [],
    preferredFormats: [],
    generationCount: 0,
    topicHistory: [],
    feedback: { positive: 0, negative: 0, positiveTopics: [], negativeTopics: [] },
    updatedAt: new Date().toISOString(),
  };
}

export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile): void {
  profile.updatedAt = new Date().toISOString();
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function updateProfileFromBrief(brief: Brief): void {
  const profile = getProfile() || defaultProfile();

  profile.generationCount++;

  // Track topic history (max 20)
  profile.topicHistory.unshift(brief.treatment);
  if (profile.topicHistory.length > 20) profile.topicHistory = profile.topicHistory.slice(0, 20);

  // Update industry if consistent
  if (brief.industry && brief.industry !== 'other') {
    profile.industry = brief.industry;
  }

  // Track preferred tones
  const tones = brief.tone.split(',').map((t) => t.trim()).filter(Boolean);
  for (const tone of tones) {
    if (!profile.preferredTones.includes(tone)) {
      profile.preferredTones.push(tone);
    }
  }
  // Keep max 5
  if (profile.preferredTones.length > 5) {
    profile.preferredTones = profile.preferredTones.slice(-5);
  }

  // Track preferred formats
  if (brief.reelFormat && brief.reelFormat !== 'random' && !profile.preferredFormats.includes(brief.reelFormat)) {
    profile.preferredFormats.push(brief.reelFormat);
  }
  if (profile.preferredFormats.length > 5) {
    profile.preferredFormats = profile.preferredFormats.slice(-5);
  }

  saveProfile(profile);
}

export function updateProfileFeedback(topic: string, positive: boolean): void {
  const profile = getProfile() || defaultProfile();

  if (positive) {
    profile.feedback.positive++;
    if (!profile.feedback.positiveTopics.includes(topic)) {
      profile.feedback.positiveTopics.unshift(topic);
      if (profile.feedback.positiveTopics.length > 10) {
        profile.feedback.positiveTopics = profile.feedback.positiveTopics.slice(0, 10);
      }
    }
  } else {
    profile.feedback.negative++;
    if (!profile.feedback.negativeTopics.includes(topic)) {
      profile.feedback.negativeTopics.unshift(topic);
      if (profile.feedback.negativeTopics.length > 10) {
        profile.feedback.negativeTopics = profile.feedback.negativeTopics.slice(0, 10);
      }
    }
  }

  saveProfile(profile);
}

export function resetProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}

function mode<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  const counts = new Map<T, number>();
  for (const item of arr) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  let best: T = arr[0];
  let bestCount = 0;
  for (const [item, count] of counts) {
    if (count > bestCount) {
      best = item;
      bestCount = count;
    }
  }
  return best;
}

export function suggestFromLikedScenarios(): Partial<Brief> | null {
  const scenarios = getScenarios();
  const liked = scenarios.filter((s) => s.feedback === 'positive');
  if (liked.length === 0) return null;

  const briefs = liked.map((s) => s.brief);

  // Industry — most common
  const industries = briefs.map((b) => b.industry).filter(Boolean);
  const industry = mode(industries);

  // Tones — count frequency across all briefs, take top 2
  const toneFreq = new Map<string, number>();
  for (const b of briefs) {
    const tones = b.tone.split(',').map((t) => t.trim()).filter(Boolean);
    for (const t of tones) {
      toneFreq.set(t, (toneFreq.get(t) || 0) + 1);
    }
  }
  const topTones = [...toneFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([t]) => t);
  const tone = topTones.length > 0 ? topTones.join(',') : undefined;

  // Format — most common (excluding "random")
  const formats = briefs.map((b) => b.reelFormat).filter((f) => f && f !== 'random');
  const reelFormat = mode(formats);

  // Duration — most common
  const durations = briefs.map((b) => b.duration).filter(Boolean);
  const duration = mode(durations);

  // Language — most common
  const languages = briefs.map((b) => b.language).filter(Boolean);
  const language = mode(languages);

  // Controversy — average rounded
  const controversyValues = briefs.map((b) => b.controversyLevel).filter((v) => v >= 1 && v <= 5);
  const controversyLevel = controversyValues.length > 0
    ? Math.round(controversyValues.reduce((a, b) => a + b, 0) / controversyValues.length)
    : undefined;

  // Target audience — most common non-empty
  const audiences = briefs.map((b) => b.targetAudience).filter(Boolean);
  const targetAudience = mode(audiences);

  const suggestion: Partial<Brief> = {};
  if (industry) suggestion.industry = industry;
  if (tone) suggestion.tone = tone;
  if (reelFormat) suggestion.reelFormat = reelFormat;
  if (duration) suggestion.duration = duration;
  if (language) suggestion.language = language;
  if (controversyLevel !== undefined) suggestion.controversyLevel = controversyLevel;
  if (targetAudience) suggestion.targetAudience = targetAudience;

  return Object.keys(suggestion).length > 0 ? suggestion : null;
}
