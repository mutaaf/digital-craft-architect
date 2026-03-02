import type { TranscriptEntry, CallStatus } from '@/data/voiceNegotiation';

type VapiInstance = {
  start(assistantId: string): Promise<void>;
  stop(): void;
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
