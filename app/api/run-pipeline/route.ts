import { NextRequest } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { buildAccountSuggestionPrompt, buildScenarioPrompt } from '@/lib/ai/prompts';
import { AccountSuggestionResponse } from '@/lib/ai/types';
import { fetchUserReels, fetchMediaByShortcode } from '@/lib/instagram/client';
import { extractReelsFromResponse } from '@/lib/instagram/transform';
import { Brief } from '@/types/brief';
import { Reel } from '@/types/reel';
import { UserProfile } from '@/types/user-profile';

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function parseAndSendScenario(
  fullText: string,
  accounts: string[],
  reelsUsed: number,
  send: (data: Record<string, unknown>) => void
) {
  const scenarioJsonMatch = fullText.match(/\{[\s\S]*\}/);
  if (scenarioJsonMatch) {
    const scenario = JSON.parse(scenarioJsonMatch[0]);
    send({
      step: 'scenario',
      status: 'done',
      data: { scenario, accounts, reelsUsed },
    });
  } else {
    send({
      step: 'scenario',
      status: 'done',
      data: {
        scenario: {
          reelAnalyses: [],
          topic: '',
          format: '',
          tone: '',
          duration: '',
          hook: fullText,
          hookVisual: '',
          hookRules: '',
          mainContent: [],
          mainContentRules: '',
          cta: '',
          ctaPunchline: '',
          musicMood: '',
          subtitleStyle: '',
          cameraWork: '',
          estimatedRecordingTime: '',
          viralPotential: '',
          viralReason: '',
          bestPublishTime: '',
          needsFollowUp: false,
          filmingTips: [],
          estimatedDuration: '',
          patterns: [],
        },
        accounts,
        reelsUsed,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { brief, profile } = body as { brief: Brief; profile?: UserProfile | null };

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

        const prompt = buildAccountSuggestionPrompt(brief, profile);
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

        // Step 2: Scrape reels from accounts (try up to 8, extend to 10 if needed)
        send({
          step: 'reels',
          status: 'running',
          message: `Pobieram Reelsy z ${Math.min(accounts.length, 8)} kont...`,
        });

        const allReels: Reel[] = [];
        let successCount = 0;
        let failCount = 0;

        // First batch: try up to 8 accounts
        const firstBatch = accounts.slice(0, 8);
        for (const account of firstBatch) {
          try {
            send({ step: 'reels', status: 'running', message: `Scraping @${account}...` });
            const data = await fetchUserReels(account);
            const reels = extractReelsFromResponse(data, account);
            allReels.push(...reels);
            successCount++;
            if (reels.length > 0) {
              send({ step: 'reels', status: 'running', message: `@${account}: ${reels.length} reelsów` });
            }
          } catch (err) {
            failCount++;
            console.error(`Error scraping "${account}":`, err);
            send({ step: 'reels', status: 'running', message: `@${account}: brak dostępu` });
          }
        }

        // If too few reels, try remaining accounts
        if (allReels.length < 3 && accounts.length > 8) {
          const extraAccounts = accounts.slice(8);
          for (const account of extraAccounts) {
            try {
              send({ step: 'reels', status: 'running', message: `Scraping @${account} (dodatkowe)...` });
              const data = await fetchUserReels(account);
              const reels = extractReelsFromResponse(data, account);
              allReels.push(...reels);
              successCount++;
            } catch (err) {
              failCount++;
              console.error(`Error scraping "${account}":`, err);
            }
          }
        }

        const uniqueReels = Array.from(
          new Map(allReels.map((r) => [r.id, r])).values()
        );

        const sortedReels = uniqueReels
          .sort((a, b) => b.viralScore - a.viralScore);

        const topReels = sortedReels.slice(0, 5);

        // Send reels done with stats
        send({
          step: 'reels',
          status: 'done',
          data: {
            totalFound: sortedReels.length,
            accountsScraped: successCount,
            accountsFailed: failCount,
            topReels: topReels.map((r) => ({
              id: r.id,
              shortcode: r.shortcode,
              ownerUsername: r.ownerUsername,
              viralScore: r.viralScore,
              views: r.metrics.views,
              likes: r.metrics.likes,
            })),
            ...(sortedReels.length === 0 && {
              warning: 'Nie znaleziono Reelsów. Scenariusz zostanie wygenerowany bez inspiracji.',
            }),
          },
        });

        // Step 3: Enrich captions for top reels (skip if none)
        if (topReels.length > 0) {
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

          // Step 4: Generate scenario with reels
          send({ step: 'scenario', status: 'running' });

          const scenarioPrompt = buildScenarioPrompt(brief, enrichedReels, profile);
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

          parseAndSendScenario(fullText, accounts, topReels.length, send);
        } else {
          // Skip enrichment, generate without reels
          send({ step: 'enrich', status: 'done', data: { skipped: true } });
          send({ step: 'scenario', status: 'running', message: 'Generuję scenariusz bez inspiracji z Reelsów...' });

          const scenarioPrompt = buildScenarioPrompt(brief, [], profile);
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

          parseAndSendScenario(fullText, accounts, 0, send);
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
