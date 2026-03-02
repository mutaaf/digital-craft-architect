import type { TranscriptEntry, CallStatus } from '@/data/voiceNegotiation';

type VapiInstance = {
  start(assistantId: string): Promise<void>;
  stop(): void;
  send(message: Record<string, unknown>): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
  removeAllListeners(): void;
};

let VapiClass: (new (publicKey: string) => VapiInstance) | null = null;

async function loadVapiSDK(): Promise<typeof VapiClass> {
  if (VapiClass) return VapiClass;
  try {
    const module = await import('@vapi-ai/web');
    VapiClass = (module.default || module) as unknown as typeof VapiClass;
    return VapiClass;
  } catch {
    console.warn('Vapi SDK not available');
    return null;
  }
}

export async function createVapiInstance(publicKey: string): Promise<VapiInstance | null> {
  const Vapi = await loadVapiSDK();
  if (!Vapi) return null;
  return new Vapi(publicKey);
}

export async function startBrowserCall(
  vapi: VapiInstance,
  assistantId: string,
): Promise<void> {
  await vapi.start(assistantId);
}

export function endCall(vapi: VapiInstance): void {
  vapi.stop();
}

export function cleanup(vapi: VapiInstance): void {
  vapi.removeAllListeners();
}

/** Normalize a phone number to E.164 format (+1XXXXXXXXXX) */
function normalizePhoneNumber(phone: string): string {
  // Strip everything except digits and leading +
  const digits = phone.replace(/[^\d+]/g, '');
  // If it already starts with +, keep as-is
  if (digits.startsWith('+')) return digits;
  // If 10 digits (US), prepend +1
  if (digits.length === 10) return `+1${digits}`;
  // If 11 digits starting with 1 (US with country code), prepend +
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  // Otherwise prepend + and hope for the best
  return `+${digits}`;
}

export async function startPhoneCall(
  assistantId: string,
  phoneNumber: string,
): Promise<{ callId: string }> {
  const normalized = normalizePhoneNumber(phoneNumber);
  const resp = await fetch('/api/vapi-call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assistantId, phoneNumber: normalized }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Failed to start phone call' }));
    throw new Error(err.message || err.error?.message || err.error || 'Failed to start phone call');
  }
  return resp.json();
}

export async function pollCallStatus(
  callId: string,
): Promise<{ status: string; transcript: string; messages: unknown[] }> {
  const resp = await fetch(`/api/vapi-call-status?callId=${encodeURIComponent(callId)}`);
  if (!resp.ok) {
    throw new Error('Failed to poll call status');
  }
  return resp.json();
}

export function sendCoachingMessage(
  vapi: VapiInstance,
  text: string,
): void {
  vapi.send({
    type: 'add-message',
    message: { role: 'system', content: text },
  });
}

export function setupVapiListeners(
  vapi: VapiInstance,
  handlers: {
    onStatusChange: (status: CallStatus) => void;
    onTranscript: (entry: TranscriptEntry) => void;
    onError: (error: string) => void;
  },
): void {
  vapi.on('call-start', () => {
    handlers.onStatusChange('in_progress');
  });

  vapi.on('call-end', () => {
    handlers.onStatusChange('ended');
  });

  vapi.on('message', (message: unknown) => {
    const msg = message as {
      type?: string;
      role?: string;
      transcript?: string;
      transcriptType?: string;
    };

    if (msg.type === 'transcript' && msg.transcript) {
      handlers.onTranscript({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        text: msg.transcript,
        timestamp: Date.now(),
        isFinal: msg.transcriptType === 'final',
      });
    }
  });

  vapi.on('error', (error: unknown) => {
    const err = error as { message?: string };
    handlers.onError(err.message || 'Vapi call error');
    handlers.onStatusChange('error');
  });
}
