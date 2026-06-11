// Ticket 0045 - Personalized /my visitor dashboard.
//
// Client-side store of the AI Readiness Quiz tier persona the visitor most
// recently completed, surfaced as a card on the /my dashboard. Mirrors the
// parse-safe pattern of src/utils/recentDemosStore.ts: every localStorage
// read/write is wrapped in try/catch, a malformed stored value resolves to
// null, and a quota-exceeded write is silently tolerated.
//
// Captures the tier label and completion timestamp ONLY (no per-question
// answers, no ROI estimate) so the /trust data-handling disclosure stays
// narrow per the ticket's privacy clause and the per-demo data chips
// (ticket 0033).

export interface QuizPersona {
  persona: string;
  completedAt: number;
}

const STORAGE_KEY = 'dca_quiz_persona_v1';

function isQuizPersona(value: unknown): value is QuizPersona {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.persona === 'string' &&
    v.persona.length > 0 &&
    typeof v.completedAt === 'number' &&
    Number.isFinite(v.completedAt)
  );
}

/**
 * Persist the visitor's quiz tier persona and completion timestamp.
 * Storage failures (quota, private mode, missing backend) are silent.
 */
export function setQuizPersona(persona: string, completedAt: number): void {
  if (typeof persona !== 'string' || persona.length === 0) return;
  if (!Number.isFinite(completedAt)) return;
  try {
    const payload: QuizPersona = { persona, completedAt };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* storage unavailable - non-fatal */
  }
}

/**
 * Read the stored quiz persona. A malformed stored value, a quota-exceeded
 * environment, or an absent storage backend all resolve to null.
 */
export function getQuizPersona(): QuizPersona | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; /* storage unavailable - non-fatal */
  }
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  return isQuizPersona(parsed) ? parsed : null;
}
