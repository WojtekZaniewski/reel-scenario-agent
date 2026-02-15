export const INDUSTRY_OPTIONS = [
  { value: 'beauty', label: 'Beauty / Salon kosmetyczny' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'gastro', label: 'Gastronomia' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'local', label: 'Usługi lokalne' },
  { value: 'marketing', label: 'Marketing / Agencja' },
  { value: 'other', label: 'Inna' },
];

export const TONE_OPTIONS = [
  { value: 'edukacyjny', label: 'Edukacyjny' },
  { value: 'zabawny', label: 'Zabawny' },
  { value: 'kontrowersyjny', label: 'Kontrowersyjny' },
  { value: 'motywacyjny', label: 'Motywacyjny' },
  { value: 'sprzedazowy', label: 'Sprzedażowy' },
];

export const FORMAT_OPTIONS = [
  { value: 'hook-transformation', label: 'Hook + Transformacja' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'qa', label: 'Q&A' },
  { value: 'before-after', label: 'Before-After' },
  { value: 'behind-scenes', label: 'Behind the scenes' },
  { value: 'random', label: 'Losowy' },
];

export const DURATION_OPTIONS = [
  { value: '15s', label: 'Krótki (15s)' },
  { value: '30s', label: 'Średni (30s)' },
  { value: '60s', label: 'Długi (60s)' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'pl', label: 'Polski' },
  { value: 'en', label: 'Angielski' },
];

export const CONTROVERSY_LABELS: Record<number, string> = {
  1: 'Bezpieczny',
  2: 'Delikatny',
  3: 'Zbalansowany',
  4: 'Odważny',
  5: 'Kontrowersyjny',
};
