import { NextRequest } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { buildGrowthPlanPrompt } from '@/lib/ai/prompts';
import { UserProfile } from '@/types/user-profile';
import { GrowthPlanAI } from '@/types/growth-plan';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { goal, industry, notes, profile, currentFollowers } = body as {
    goal: string;
    industry: string;
    notes?: string;
    profile?: UserProfile | null;
    currentFollowers?: number;
  };

  if (!goal?.trim()) {
    return new Response(
      JSON.stringify({ error: 'Podaj cel rozwoju konta' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const prompt = buildGrowthPlanPrompt(goal, industry, notes || '', profile, currentFollowers);
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt,
      temperature: 0.7,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Nie udało się sparsować odpowiedzi AI' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const plan: GrowthPlanAI = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(plan), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Growth plan generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Błąd generowania planu' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
