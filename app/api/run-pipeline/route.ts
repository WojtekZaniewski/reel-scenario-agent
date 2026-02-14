import { NextRequest } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { buildAccountSuggestionPrompt, buildScenarioPrompt } from '@/lib/ai/prompts';
import { AccountSuggestionResponse } from '@/lib/ai/types';
import { fetchUserReels, fetchMediaByShortcode } from '@/lib/instagram/client';
import { extractReelsFromResponse } from '@/lib/instagram/transform';
import { Brief } from '@/types/brief';
import { Reel } from '@/types/reel';

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { brief } = body as { brief: Brief };

  if (!brief?.treatment) {
    return new Response(
      JSON.stringify({ error: 'Podaj przynajmniej zabieg/usługę' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(sseEvent(data)));
      }

      try {
        // Step 1: Suggest accounts
        send({ step: 'accounts', status: 'running' });

        const prompt = buildAccountSuggestionPrompt(brief);
        const { text } = await generateText({
          model: google('gemini-2.5-flash'),
          prompt,
          temperature: 0.7,
        });

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          send({ step: 'accounts', status: 'error', message: 'Nie udało się sparsować odpowiedzi AI' });
          controller.close();
          return;
        }

        const parsed: AccountSuggestionResponse = JSON.parse(jsonMatch[0]);
        const accounts = parsed.accounts.slice(0, 10);

        send({
          step: 'accounts',
          status: 'done',
          data: { accounts, reasoning: parsed.reasoning },
        });

        // Step 2: Scrape reels from accounts
        send({
          step: 'reels',
          status: 'running',
          message: `Pobieram Reelsy z ${accounts.length} kont...`,
        });

        const allReels: Reel[] = [];
        for (const account of accounts.slice(0, 5)) {
          try {
            const data = await fetchUserReels(account);
            const reels = extractReelsFromResponse(data, account);
            allReels.push(...reels);
          } catch (err) {
            console.error(`Error scraping "${account}":`, err);
          }
        }

        const uniqueReels = Array.from(
          new Map(allReels.map((r) => [r.id, r])).values()
        );

        const sortedReels = uniqueReels
          .sort((a, b) => b.viralScore - a.viralScore);

        const topReels = sortedReels.slice(0, 5);

        send({
          step: 'reels',
          status: 'done',
          data: {
            totalFound: sortedReels.length,
            topReels: topReels.map((r) => ({
              id: r.id,
              shortcode: r.shortcode,
              ownerUsername: r.ownerUsername,
              viralScore: r.viralScore,
              views: r.metrics.views,
              likes: r.metrics.likes,
            })),
          },
        });

        // Step 3: Enrich captions for top reels
        send({ step: 'enrich', status: 'running' });

        const enrichedReels = await Promise.all(
          topReels.map(async (reel) => {
            try {
              const media = await fetchMediaByShortcode(reel.shortcode);
              return {
                ...reel,
                caption: media?.caption?.text || reel.caption,
              };
            } catch {
              return reel;
            }
          })
        );

        send({ step: 'enrich', status: 'done' });

        // Step 4: Generate scenario (streaming)
        send({ step: 'scenario', status: 'running' });

        const scenarioPrompt = buildScenarioPrompt(brief, enrichedReels);
        const result = streamText({
          model: google('gemini-2.5-flash'),
          prompt: scenarioPrompt,
          temperature: 0.8,
        });

        let fullText = '';
        for await (const chunk of result.textStream) {
          fullText += chunk;
          send({ step: 'scenario', status: 'streaming', chunk });
        }

        // Parse final scenario
        const scenarioJsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (scenarioJsonMatch) {
          const scenario = JSON.parse(scenarioJsonMatch[0]);
          send({
            step: 'scenario',
            status: 'done',
            data: { scenario, accounts, reelsUsed: topReels.length },
          });
        } else {
          send({
            step: 'scenario',
            status: 'done',
            data: {
              scenario: {
                hook: fullText,
                mainContent: [],
                cta: '',
                musicMood: '',
                filmingTips: [],
                estimatedDuration: '',
                patterns: [],
              },
              accounts,
              reelsUsed: topReels.length,
            },
          });
        }
      } catch (error) {
        console.error('Pipeline error:', error);
        send({
          step: 'error',
          status: 'error',
          message: error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
