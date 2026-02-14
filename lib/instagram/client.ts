import { Instagram120ReelsResponse, Instagram120MediaResponse } from './types';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'instagram120.p.rapidapi.com';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': RAPIDAPI_KEY,
    'X-RapidAPI-Host': RAPIDAPI_HOST,
  };
}

async function rapidApiPost<T>(endpoint: string, body: Record<string, string>): Promise<T> {
  const url = `https://${RAPIDAPI_HOST}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`RapidAPI error ${response.status}: ${text}`);
  }

  return response.json();
}

export async function fetchUserReels(username: string): Promise<Instagram120ReelsResponse> {
  return rapidApiPost<Instagram120ReelsResponse>('/api/instagram/reels', {
    username,
    maxId: '',
  });
}

export async function fetchMediaByShortcode(shortcode: string): Promise<Instagram120MediaResponse> {
  return rapidApiPost<Instagram120MediaResponse>('/api/instagram/mediaByShortcode', {
    shortcode,
  });
}
