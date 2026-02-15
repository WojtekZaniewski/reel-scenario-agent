import { Brief } from '@/types/brief';
import { Reel } from '@/types/reel';
import { UserProfile } from '@/types/user-profile';

function buildProfileContext(profile?: UserProfile | null): string {
  if (!profile) return '';
  const parts: string[] = [];
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

Odpowiedz WYŁĄCZNIE w formacie JSON:
{
  "accounts": ["username1", "username2", ...],
  "reasoning": "Krótkie wyjaśnienie dlaczego te konta"
}`;
}

export function buildScenarioPrompt(brief: Brief, reels: Reel[], profile?: UserProfile | null): string {
  const reelsSummary = reels
    .slice(0, 5)
    .map(
      (r, i) =>
        `${i + 1}. [@${r.ownerUsername || 'nieznany'} | Viral Score: ${r.viralScore}/100 | Wyświetlenia: ${r.metrics.views.toLocaleString('pl-PL')} | Polubienia: ${r.metrics.likes.toLocaleString('pl-PL')}]
   ${r.caption ? `Opis: ${r.caption.slice(0, 300)}${r.caption.length > 300 ? '...' : ''}` : '(brak opisu)'}`
    )
    .join('\n\n');

  const industry = brief.industry || 'beauty';
  const controversyDesc = brief.controversyLevel <= 2 ? 'bezpieczny, delikatny' : brief.controversyLevel === 3 ? 'zbalansowany' : 'odważny, kontrowersyjny';
  const lang = brief.language === 'en' ? 'angielskim' : 'polskim';

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
${buildProfileContext(profile)}

TOP VIRALOWE REELSY Z NISZY:
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
Na podstawie analizy stwórz scenariusz, kierując się tymi zasadami:

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
  "reelAnalyses": [
    {
      "hookType": "typ hooka",
      "dominantEmotion": "dominująca emocja",
      "tempoStructure": "np. 3s hook / 20s mięso / 5s CTA",
      "attentionMechanism": "mechanizm zatrzymania uwagi",
      "commentInsights": "co triggeruje ludzi w komentarzach",
      "whyItWorks": "dlaczego to działa (DCT)"
    }
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
