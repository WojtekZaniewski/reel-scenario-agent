import { Brief } from '@/types/brief';
import { Reel } from '@/types/reel';

export function buildAccountSuggestionPrompt(brief: Brief): string {
  return `Jesteś ekspertem od Instagram Reels i marketingu w branży beauty w Polsce.

Na podstawie poniższego briefu zaproponuj 6-10 kont Instagram (username), które tworzą viralowe Reelsy w tej niszy. Szukamy kont, które mogą posłużyć jako INSPIRACJA do stworzenia scenariusza Reela.

BRIEF:
- Zabieg/usługa: ${brief.treatment}
- Grupa docelowa: ${brief.targetAudience}
- Ton komunikacji: ${brief.tone}
${brief.notes ? `- Dodatkowe notatki: ${brief.notes}` : ''}

ZASADY:
- Podawaj PRAWDZIWE konta Instagram, które istnieją i są aktywne
- Mix polskich i zagranicznych kont z branży beauty/kosmetycznej
- Uwzględnij zarówno duże konta (influencerzy) jak i mniejsze salony z viralowymi treściami
- Podaj same nazwy użytkowników BEZ znaku @
- Skup się na kontach, które regularnie publikują Reelsy

Odpowiedz WYŁĄCZNIE w formacie JSON:
{
  "accounts": ["username1", "username2", ...],
  "reasoning": "Krótkie wyjaśnienie dlaczego te konta"
}`;
}

export function buildScenarioPrompt(brief: Brief, reels: Reel[]): string {
  const reelsSummary = reels
    .slice(0, 5)
    .map(
      (r, i) =>
        `${i + 1}. [@${r.ownerUsername || 'nieznany'} | Viral Score: ${r.viralScore}/100 | Wyświetlenia: ${r.metrics.views.toLocaleString('pl-PL')} | Polubienia: ${r.metrics.likes.toLocaleString('pl-PL')}]
   ${r.caption ? `Opis: ${r.caption.slice(0, 300)}${r.caption.length > 300 ? '...' : ''}` : '(brak opisu)'}`
    )
    .join('\n\n');

  return `Jesteś ekspertem od tworzenia viralowych treści na Instagram Reels w branży beauty/kosmetycznej w Polsce.

BRIEF KLIENTKI:
- Zabieg/usługa: ${brief.treatment}
- Grupa docelowa: ${brief.targetAudience}
- Ton komunikacji: ${brief.tone}
${brief.notes ? `- Dodatkowe notatki: ${brief.notes}` : ''}

ANALIZA TOP VIRALOWYCH REELSÓW Z NISZY:
${reelsSummary}

Na podstawie powyższych danych stwórz scenariusz viralowego Reela dla salonu kosmetycznego.

Odpowiedz WYŁĄCZNIE w formacie JSON:
{
  "hook": "Tekst/opis pierwszych 3 sekund — przyciągający uwagę hook",
  "mainContent": [
    "Punkt 1 scenariusza",
    "Punkt 2 scenariusza",
    "Punkt 3 scenariusza"
  ],
  "cta": "Wezwanie do działania na końcu Reela",
  "musicMood": "Opis sugerowanego nastroju muzycznego",
  "filmingTips": [
    "Wskazówka filmowania 1",
    "Wskazówka filmowania 2"
  ],
  "estimatedDuration": "15-30 sekund",
  "patterns": [
    "Wzorzec viralowości 1 zaobserwowany w top Reelsach",
    "Wzorzec viralowości 2"
  ]
}`;
}
