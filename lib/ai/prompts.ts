import { Brief } from '@/types/brief';
import { Reel } from '@/types/reel';
import { UserProfile } from '@/types/user-profile';
import type { GrowthPlanAI } from '@/types/growth-plan';

function buildProfileContext(profile?: UserProfile | null): string {
  if (!profile) return '';
  const parts: string[] = [];
  if (profile.businessName) parts.push(`- Firma: ${profile.businessName}`);
  if (profile.businessDescription) parts.push(`- Opis: ${profile.businessDescription}`);
  if (profile.targetNiche) parts.push(`- Nisza: ${profile.targetNiche}`);
  if (profile.uniqueSellingPoints) parts.push(`- USP: ${profile.uniqueSellingPoints}`);
  if (profile.contentGoals) parts.push(`- Cel contentu: ${profile.contentGoals}`);
  if (profile.personalStyle) parts.push(`- Styl: ${profile.personalStyle}`);
  if (profile.industry) parts.push(`- Branża: ${profile.industry}`);
  if (profile.preferredTones.length > 0) parts.push(`- Preferowane tony: ${profile.preferredTones.join(', ')}`);
  if (profile.preferredFormats.length > 0) parts.push(`- Najczęstsze formaty: ${profile.preferredFormats.join(', ')}`);
  if (profile.feedback.positiveTopics.length > 0) {
    parts.push(`- Tematy ocenione pozytywnie: ${profile.feedback.positiveTopics.slice(0, 5).join(', ')}`);
  }
  if (parts.length === 0) return '';
  return `\n\nPROFIL UŻYTKOWNIKA:\n${parts.join('\n')}`;
}

export function buildAccountSuggestionPrompt(brief: Brief, profile?: UserProfile | null): string {
  const industry = brief.industry || 'beauty';
  const lang = brief.language === 'en' ? 'angielskim' : 'polskim';

  return `Jesteś ekspertem od Instagram Reels i marketingu w branży ${industry}.

Na podstawie poniższego briefu zaproponuj 6-10 kont Instagram (username), które tworzą viralowe Reelsy w tej niszy. Szukamy kont, które mogą posłużyć jako INSPIRACJA do stworzenia scenariusza Reela.

BRIEF:
- Zabieg/usługa: ${brief.treatment}
- Grupa docelowa: ${brief.targetAudience}
- Ton komunikacji: ${brief.tone}
- Branża: ${industry}
- Język: ${lang}
${brief.notes ? `- Dodatkowe notatki: ${brief.notes}` : ''}
${buildProfileContext(profile)}

ZASADY:
- Podawaj PRAWDZIWE konta Instagram, które istnieją i są aktywne
- Mix polskich i zagranicznych kont z branży ${industry}
- Uwzględnij zarówno duże konta (influencerzy) jak i mniejsze biznesy z viralowymi treściami
- Podaj same nazwy użytkowników BEZ znaku @
- Skup się na kontach, które regularnie publikują Reelsy
- WAŻNE: Podaj TYLKO konta, które na pewno istnieją. Lepiej podać mniej kont niż zmyślone nazwy.

Odpowiedz WYŁĄCZNIE w formacie JSON:
{
  "accounts": ["username1", "username2", ...],
  "reasoning": "Krótkie wyjaśnienie dlaczego te konta"
}`;
}

export interface GrowthContext {
  trend: 'exceeding' | 'on-track' | 'lagging';
  currentFollowers: number;
  targetFollowers: number;
  weekNumber: number;
  totalWeeks: number;
}

function buildGrowthContextSection(ctx?: GrowthContext | null): string {
  if (!ctx) return '';
  const trendPl = ctx.trend === 'exceeding' ? 'WYPRZEDZA PLAN' : ctx.trend === 'on-track' ? 'NA DOBREJ DRODZE' : 'OPÓŹNIONY';
  const diff = ctx.currentFollowers - ctx.targetFollowers;
  const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;

  return `

KONTEKST WZROSTU KONTA:
- Aktualna liczba obserwujących: ${ctx.currentFollowers}
- Cel na najbliższy milestone: ${ctx.targetFollowers}
- Status: ${trendPl} (${diffStr} vs cel)
- Tydzień: ${ctx.weekNumber}/${ctx.totalWeeks}

DOSTOSUJ SCENARIUSZ DO STATUSU WZROSTU:
${ctx.trend === 'exceeding' ? '- Konto WYPRZEDZA plan — pozwól sobie na eksperymentalny content, testuj nowe formaty, buduj lojalność (nie tylko zasięg)' : ''}${ctx.trend === 'on-track' ? '- Konto idzie ZGODNIE Z PLANEM — kontynuuj sprawdzone wzorce, utrzymuj regularność, dodaj subtelne CTA' : ''}${ctx.trend === 'lagging' ? '- Konto jest OPÓŹNIONE — użyj mocniejszych hooków, więcej kontrowersji, CTA na share/save/komentarz, maximalizuj zasięg' : ''}`;
}

export function buildScenarioPrompt(brief: Brief, reels: Reel[], profile?: UserProfile | null, growthContext?: GrowthContext | null): string {
  const industry = brief.industry || 'beauty';
  const controversyDesc = brief.controversyLevel <= 2 ? 'bezpieczny, delikatny' : brief.controversyLevel === 3 ? 'zbalansowany' : 'odważny, kontrowersyjny';
  const lang = brief.language === 'en' ? 'angielskim' : 'polskim';

  const hasReels = reels.length > 0;

  const reelsSummary = hasReels
    ? reels
        .slice(0, 5)
        .map(
          (r, i) =>
            `${i + 1}. [@${r.ownerUsername || 'nieznany'} | Viral Score: ${r.viralScore}/100 | Wyświetlenia: ${r.metrics.views.toLocaleString('pl-PL')} | Polubienia: ${r.metrics.likes.toLocaleString('pl-PL')}]
   ${r.caption ? `Opis: ${r.caption.slice(0, 300)}${r.caption.length > 300 ? '...' : ''}` : '(brak opisu)'}`
        )
        .join('\n\n')
    : '';

  const reelsSection = hasReels
    ? `TOP VIRALOWE REELSY Z NISZY:
${reelsSummary}

---

TWOJE ZADANIE — WYKONAJ W DWÓCH ETAPACH:

ETAP 1: ANALIZA REELSÓW
Przeanalizuj każdy z powyższych Reelsów i dla każdego wyciągnij:
- Typ hooka (szok / pytanie / kontrowersja / ból / obietnica / POV)
- Emocję dominującą (strach / FOMO / aspiracja / wstyd / gniew / nadzieja)
- Tempo i strukturę (ile sekund hook / mięso / CTA)
- Mechanizm zatrzymania uwagi (napisy / zmiany ujęć / jump cuty / pattern interrupt)
- Komentarze — czego ludzie nie rozumieją? Co ich triggeruje?
- Dlaczego to działa? (Desire, Certainty, Trust — który element jest silny)

ETAP 2: SCENARIUSZ REELA
Na podstawie analizy stwórz scenariusz, kierując się tymi zasadami:`
    : `Nie udało się znaleźć viralowych Reelsów jako inspiracji. Stwórz scenariusz wyłącznie na podstawie swojej wiedzy o viralowych treściach w branży ${industry}, kierując się tymi zasadami:`;

  return `Jesteś ekspertem od tworzenia viralowych treści na Instagram Reels. Specjalizujesz się w inżynierii uwagi i psychologii viralowości.

BRIEF:
- Zabieg/usługa: ${brief.treatment}
- Branża: ${industry}
- Grupa docelowa: ${brief.targetAudience}
- Ton komunikacji: ${brief.tone}
- Format Reela: ${brief.reelFormat === 'random' ? 'dobierz najlepszy format' : brief.reelFormat}
- Długość: ${brief.duration}
- Język: ${lang}
- Poziom kontrowersji: ${brief.controversyLevel}/5 (${controversyDesc})
${brief.notes ? `- Dodatkowe notatki: ${brief.notes}` : ''}
${buildProfileContext(profile)}${buildGrowthContextSection(growthContext)}

${reelsSection}

ZASADY BUDOWANIA SCENARIUSZA:

1. Buying Journey — Reel trafia w konkretny etap: nieświadomy problemu → świadomy problemu → świadomy rozwiązania → gotowy do działania.

2. Desire, Certainty, Trust — Czy podniosłem poziom pragnienia? Czy zwiększyłem pewność? Czy zbudowałem zaufanie?

3. Progi działania — CTA proporcjonalne do poziomu relacji. Nie każę kupować, jeśli nie dałem wartości.

4. Dopamina — Hook = szok/obietnica/konflikt. Środek = mini nagrody co kilka sekund. Koniec = niedosyt. Otwarta pętla.

5. Kontrast — Stare vs nowe. Większość vs Ty. Mit vs prawda. Chaos vs prostota.

6. Prostota — Jeśli da się powiedzieć krócej, mówię krócej. Nie komplikuję.

7. Jeden cel — Jedna myśl. Jedna transformacja. Jedno działanie.

HOOK — ZASADY:
- Pierwsze zdanie musi: uderzać w ból ALBO obiecywać konkretny efekt ALBO łamać przekonanie
- Bez wstępu. Bez "Cześć kochani". Bez kontekstu. Wchodzimy jak młot.

ROZWINIĘCIE — ZASADY:
- Problem pogłębiony → Dlaczego większość robi to źle → Proste rozwiązanie → Mini-dowód
- Krótkie zdania. Jedna myśl = jedno ujęcie. Cięcie co 1-2 sekundy. Każda linijka sprzedaje kolejną.

CTA — ZASADY:
- Punchline + niedomknięta pętla ciekawości + jedno konkretne działanie
- Przykłady: "Zapisz to." / "Napisz 'START' w komentarzu." / "Chcesz część 2?" / "Obserwuj, bo jutro pokażę…"

Odpowiedz WYŁĄCZNIE w formacie JSON (bez żadnego tekstu poza JSON):
{
  "reelAnalyses": [${hasReels ? `
    {
      "hookType": "typ hooka",
      "dominantEmotion": "dominująca emocja",
      "tempoStructure": "np. 3s hook / 20s mięso / 5s CTA",
      "attentionMechanism": "mechanizm zatrzymania uwagi",
      "commentInsights": "co triggeruje ludzi w komentarzach",
      "whyItWorks": "dlaczego to działa (DCT)"
    }` : ''}
  ],
  "topic": "jasny temat w 1 zdaniu",
  "format": "Hook + Transformacja / Storytelling / Q&A / Kontrowersja / Before-After / POV",
  "tone": "edukacyjny / zabawny / kontrowersyjny / motywacyjny / sprzedażowy",
  "duration": "${brief.duration}",
  "hook": "dokładny tekst hooka do powiedzenia",
  "hookVisual": "co widzimy na ekranie + jaki napis",
  "hookRules": "dlaczego ten hook zadziała",
  "mainContent": [
    "Krok 1: tekst mówiony + opis ujęcia + napis",
    "Krok 2: ...",
    "Krok 3: ..."
  ],
  "mainContentRules": "zasady zastosowane w rozwinięciu",
  "cta": "dokładny tekst CTA",
  "ctaPunchline": "punchline + niedomknięta pętla",
  "musicMood": "opis muzyki: tempo, nastrój, czy trendujące audio",
  "subtitleStyle": "styl napisów: duże/małe, kolor, animacja",
  "cameraWork": "kadry: zbliżenia, jump cuty, ujęcia",
  "estimatedRecordingTime": "realny szacunek czasu nagrania",
  "viralPotential": "niski / średni / wysoki / viralowy",
  "viralReason": "dlaczego (emocja + mechanizm + trigger)",
  "bestPublishTime": "dzień + godzina",
  "needsFollowUp": true,
  "followUpTopic": "temat części 2 (jeśli needsFollowUp=true)",
  "filmingTips": ["wskazówka 1", "wskazówka 2"],
  "estimatedDuration": "${brief.duration}",
  "patterns": ["wzorzec viralowości 1", "wzorzec 2"]
}

Zawsze odpowiadaj WYŁĄCZNIE w powyższym formacie JSON. Nie dodawaj niczego poza tym schematem.`;
}

export function buildGrowthPlanPrompt(
  goal: string,
  industry: string,
  notes: string,
  profile?: UserProfile | null,
  currentFollowers?: number
): string {
  const profileCtx = buildProfileContext(profile);
  const generationInfo = profile
    ? `\nDOTYCHCZASOWA AKTYWNOŚĆ:
- Wygenerowanych scenariuszy: ${profile.generationCount}
- Ostatnie tematy: ${profile.topicHistory.slice(0, 5).join(', ') || 'brak'}
- Pozytywne oceny: ${profile.feedback.positive}, Negatywne: ${profile.feedback.negative}`
    : '';

  return `Jesteś ekspertem od strategii wzrostu na Instagramie. Tworzysz realistyczne plany rozwoju kont oparte na PRAWDZIWYCH statystykach i benchmarkach.

CEL UŻYTKOWNIKA: ${goal}
BRANŻA: ${industry}
${currentFollowers != null ? `AKTUALNA LICZBA OBSERWUJĄCYCH: ${currentFollowers}` : ''}
${notes ? `DODATKOWE INFO: ${notes}` : ''}
${profileCtx}
${generationInfo}

REALNE STATYSTYKI INSTAGRAMA (2024-2025) — UŻYWAJ ICH:
- Konto 0-1K followers: realistyczny wzrost 50-200 obs/miesiąc przy regularnym postingu 3-5 Reelsów/tydzień
- Konto 1K-10K: wzrost 200-1000 obs/miesiąc przy 4-5 Reelsów/tydzień + Stories codziennie
- Konto 10K-50K: wzrost 500-3000 obs/miesiąc przy profesjonalnym contencie
- Engagement rate benchmark: micro (<10K) = 3-8%, small (10-50K) = 1-5%, medium (50-500K) = 0.5-3%
- Reelsy z hookiem w pierwszych 3 sekundach mają 2-3x więcej wyświetleń
- Najlepsze godziny publikacji: 8-10 rano, 12-14, 18-21 (zależy od niszy)
- Optymalny posting: 3-5 Reelsów/tydzień (codziennie może obniżyć jakość)
- Pierwszy viralowy Reel: typowo po 20-50 opublikowanych (nie gwarantowane)
- 80% ruchu organicznego z Reelsów, 15% ze Stories, 5% z postów statycznych
- Czas na zbudowanie zaangażowanej społeczności: minimum 3-6 miesięcy
- Konwersja obserwujących na klientów: typowo 1-3% (zależy od niszy i oferty)

TWOJE ZADANIE:
1. Oceń cel użytkownika pod kątem realizmu
2. Stwórz plan z TRZEMA wariantami trudności (łatwy, średni, trudny)
3. Dla każdego wariantu podaj realistyczny czas realizacji i wymagany wysiłek
4. Zaplanuj harmonogram tygodniowy (które dni tygodnia, co robić)
5. Wyznacz kamienie milowe (co tydzień/co 2 tygodnie)
6. Zaproponuj 3-4 filary contentu dopasowane do branży i celu

ZASADY:
- Bądź BRUTALNIE SZCZERY. Nie obiecuj viralowości. Nie obiecuj szybkiego wzrostu.
- Jeśli cel jest nierealistyczny w podanym czasie, powiedz wprost i zaproponuj realistyczną alternatywę.
- Harmonogram tygodniowy powinien uwzględniać dni odpoczynku (nie codziennie!)
- Każdy milestone powinien być mierzalny i konkretny
- Dla każdego milestone podaj expectedFollowers — oczekiwaną liczbę obserwujących na ten tydzień (oblicz realistycznie na podstawie statystyk i aktualnej liczby)

Odpowiedz WYŁĄCZNIE w formacie JSON:
{
  "summary": "2-3 zdania o planie i ocenie celu",
  "weeklySchedule": [
    { "day": "Poniedziałek", "action": "co zrobić", "contentType": "typ contentu" },
    { "day": "Środa", "action": "co zrobić", "contentType": "typ contentu" },
    { "day": "Piątek", "action": "co zrobić", "contentType": "typ contentu" }
  ],
  "milestones": [
    {
      "week": 2,
      "target": "konkretny cel na ten tydzień",
      "metric": "co mierzyć",
      "checkpoints": ["co sprawdzić 1", "co sprawdzić 2"],
      "expectedFollowers": 500
    }
  ],
  "contentPillars": ["filar 1", "filar 2", "filar 3"],
  "bestPostingTimes": ["8:00-10:00", "18:00-20:00"],
  "expectedGrowth": "realistyczny opis oczekiwanego wzrostu z liczbami",
  "tips": ["wskazówka 1", "wskazówka 2", "wskazówka 3"],
  "difficultyOptions": [
    {
      "level": "easy",
      "label": "Spokojne tempo",
      "durationWeeks": 12,
      "reelsPerWeek": 3,
      "description": "3 Reelsy tygodniowo, mniej presji, dłuższy czas na cel"
    },
    {
      "level": "medium",
      "label": "Zbalansowany",
      "durationWeeks": 8,
      "reelsPerWeek": 4,
      "description": "4 Reelsy tygodniowo, regularny wysiłek"
    },
    {
      "level": "hard",
      "label": "Intensywny",
      "durationWeeks": 5,
      "reelsPerWeek": 6,
      "description": "6 Reelsów tygodniowo, maksymalne tempo, wymaga dyscypliny"
    }
  ]
}

Zawsze odpowiadaj WYŁĄCZNIE w powyższym formacie JSON.`;
}
