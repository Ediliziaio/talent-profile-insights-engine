/**
 * Costanti centralizzate per l'applicazione TalentProfile
 * Evita valori hardcoded sparsi nel codice
 */

// ============ QUESTIONARIO ============
export const QUESTIONS_PER_PAGE = 20;
export const TOTAL_QUESTIONS = 242;

export const ANSWER_OPTIONS = [
  { value: 'A' as const, label: 'Sì, sempre', shortLabel: 'Sì, sempre' },
  { value: 'B' as const, label: 'A volte', shortLabel: 'A volte' },
  { value: 'C' as const, label: 'No, mai', shortLabel: 'No, mai' },
] as const;

export type AnswerValue = typeof ANSWER_OPTIONS[number]['value'];

// ============ ETÀ E FILTRI ============
export const AGE_THRESHOLDS = {
  SENIOR: 55,
  MIN: 16,
  MAX: 99,
} as const;

export const AGE_RANGES = [
  { value: '18-30', label: '18-30 anni', min: 18, max: 30 },
  { value: '31-45', label: '31-45 anni', min: 31, max: 45 },
  { value: '46-60', label: '46-60 anni', min: 46, max: 60 },
  { value: '60+', label: 'Oltre 60 anni', min: 60, max: 999 },
] as const;

// ============ FIT SCORING ============
export const FIT_SCORE_THRESHOLDS = {
  NON_IDONEO: 35,
  DA_VALUTARE: 50,
  IDONEO_CON_RISERVA: 70,
} as const;

// ============ SESSIONE ============
export const SESSION_TOKEN_EXPIRY_HOURS = 24;

// ============ QUERY CLIENT ============
export const QUERY_CONFIG = {
  STALE_TIME: 1000 * 60 * 5, // 5 minuti
  GC_TIME: 1000 * 60 * 10, // 10 minuti
  RETRY_COUNT: 2,
  RETRY_DELAY_BASE: 1000,
  RETRY_DELAY_MAX: 30000,
} as const;

// ============ PAGINATION ============
export const DEFAULT_PAGE_SIZE = 50;

// ============ VALIDAZIONE ============
export const VALIDATION = {
  EMAIL_MAX_LENGTH: 255,
  NAME_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 6,
  PHONE_REGEX: /^(\+39)?[\s]?[0-9]{6,15}$/,
  USERNAME_MAX_LENGTH: 50,
} as const;

// ============ DATE PRESETS ============
export const DATE_PRESETS = [
  { value: 'all', label: 'Tutto' },
  { value: 'today', label: 'Oggi' },
  { value: 'week', label: 'Ultima settimana' },
  { value: 'month', label: 'Ultimo mese' },
  { value: '3months', label: 'Ultimi 3 mesi' },
] as const;
