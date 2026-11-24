/**
 * Outbound-call number policy (toll-fraud guard for api/vapi-call.ts).
 * Only plain NANP numbers; premium (900/976) and the Caribbean/Pacific NANP
 * area codes that are classic international-revenue-share fraud targets are refused.
 */

const NANP = /^\+1[2-9]\d{2}[2-9]\d{6}$/;

export const BLOCKED_AREA_CODES = new Set([
  '900', '976',
  '242', '246', '264', '268', '284', '340', '345', '441', '473', '649', '658', '664',
  '670', '671', '684', '721', '758', '767', '784', '787', '809', '829', '849', '868',
  '869', '876', '939',
]);

/** Normalize to E.164 the same way src/utils/vapiClient.ts does. */
export function toE164(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return `+${digits.slice(1).replace(/\+/g, '')}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

export type PhoneCheck = { ok: true; e164: string } | { ok: false; reason: string };

export function checkOutboundNumber(raw: unknown): PhoneCheck {
  if (typeof raw !== 'string' || raw.length > 40) {
    return { ok: false, reason: 'Please enter a valid US or Canadian phone number.' };
  }
  const e164 = toE164(raw);
  if (!NANP.test(e164)) {
    return { ok: false, reason: 'The demo can only call US and Canadian phone numbers.' };
  }
  if (BLOCKED_AREA_CODES.has(e164.slice(2, 5))) {
    return { ok: false, reason: 'The demo cannot call that area code. Please use a US or Canadian mobile or landline number.' };
  }
  return { ok: true, e164 };
}
