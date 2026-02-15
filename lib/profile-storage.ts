import type { UserProfile } from '@/types/user-profile';
import type { Brief } from '@/types/brief';

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
