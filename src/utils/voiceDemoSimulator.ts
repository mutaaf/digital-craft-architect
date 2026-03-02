import type { TranscriptEntry, VoiceCallConfig, CallStatus } from '@/data/voiceNegotiation';
import { streamChat } from '@/utils/openaiChat';
import { generateVoiceSystemPrompt } from '@/utils/voicePromptGenerator';

interface DemoTurn {
  role: 'assistant' | 'user';
  text: string;
}

const DEMO_CONVERSATION: DemoTurn[] = [
  {
    role: 'assistant',
    text: "Hi there! This is Sarah from DigitalCraft AI. I hope I'm not catching you at a bad time — I saw your property listing and I'm really interested in learning more about it.",
  },
  {
    role: 'user',
    text: "Oh hi, no you're fine. Which property are you calling about?",
  },
  {
    role: 'assistant',
    text: "Great! I'm calling about your property on Elm Street. I've been looking in that area for a while and honestly, your place really caught my eye. How long have you had it on the market?",
  },
  {
    role: 'user',
    text: "It's been about two months now. We've had some interest but nothing serious yet.",
  },
  {
    role: 'assistant',
    text: "I hear you — the market can be tricky right now. If you don't mind me asking, what's prompting the sale? Sometimes knowing the situation helps me figure out if we can make something work for both of us.",
  },
  {
    role: 'user',
    text: "We're relocating for work. My wife got a new position in Texas, so we need to move within the next couple months ideally.",
  },
  {
    role: 'assistant',
    text: "Oh congratulations to her! That's exciting. I totally understand the time pressure though. So, I've been doing my homework — I looked at some comparable sales in the area, and I want to be straightforward with you. Properties similar to yours have been going for around $285,000 to $310,000 recently. Would you be open to discussing an offer?",
  },
  {
    role: 'user',
    text: "Sure, I mean we listed at $340,000 for a reason though. We put a lot of work into the place.",
  },
  {
    role: 'assistant',
    text: "Absolutely, and I can tell you've taken great care of it. One thing that works in your favor with me is that I can do an as-is purchase, no inspection contingencies dragging things out. Given the comps and the current market, I'd like to start at $295,000. And since you need to move quickly, I can close in as little as three weeks.",
  },
  {
    role: 'user',
    text: "That's quite a bit below our asking. I don't think we could go below $320,000.",
  },
  {
    role: 'assistant',
    text: "I completely understand where you're coming from. Let me see what I can do — if I come up to $310,000 with a guaranteed close in three weeks and I cover all closing costs, does that start to feel more workable? That way you have certainty and you're not paying any additional fees.",
  },
  {
    role: 'user',
    text: "Hmm, if you cover closing costs and can really close that fast... I'd need to talk it over with my wife but $310,000 could work.",
  },
  {
    role: 'assistant',
    text: "That sounds great! Why don't you two discuss it tonight and I'll follow up tomorrow? I'll have our team get the paperwork ready on our end so we can move fast if you're on board. Does that work for you?",
  },
  {
    role: 'user',
    text: "Yeah that works. I'll give you a call back tomorrow afternoon.",
  },
  {
    role: 'assistant',
    text: "Perfect, I really appreciate your time today. I'm genuinely excited about this property and I think we can make this work for everyone. Talk to you tomorrow!",
  },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runDemoConversation(
  config: VoiceCallConfig,
  onTranscript: (entry: TranscriptEntry) => void,
  onStatusChange: (status: CallStatus) => void,
  signal?: AbortSignal,
): Promise<TranscriptEntry[]> {
  const entries: TranscriptEntry[] = [];
  let useAI = false;

  // Try to detect if OpenAI is available by making a small test
  try {
    const testResp = await fetch('/api/vapi-status');
    // If the server responds, we know the API layer works
    // We'll try AI-generated conversation via /api/stream
    if (testResp.ok) {
      useAI = true;
    }
  } catch {
    // Fall back to pre-baked
  }

  onStatusChange('connecting');
  await delay(800);
  if (signal?.aborted) return entries;

  onStatusChange('ringing');
  await delay(1500);
  if (signal?.aborted) return entries;

  onStatusChange('in_progress');

  if (useAI) {
    // Try AI-generated dynamic conversation
    try {
      const aiEntries = await runAIConversation(config, onTranscript, signal);
      if (aiEntries.length > 0) return aiEntries;
    } catch {
      // Fall through to pre-baked demo
    }
  }

  // Pre-baked demo conversation with realistic timing
  for (const turn of DEMO_CONVERSATION) {
    if (signal?.aborted) break;

    // Simulate typing/speaking delay (1-3 seconds)
    const thinkDelay = 800 + Math.random() * 1500;
    await delay(thinkDelay);
    if (signal?.aborted) break;

    // Reveal text incrementally
    const words = turn.text.split(' ');
    let revealed = '';

    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) break;
      revealed += (i > 0 ? ' ' : '') + words[i];

      const interim: TranscriptEntry = {
        role: turn.role,
        text: revealed,
        timestamp: Date.now(),
        isFinal: i === words.length - 1,
      };

      // Only emit every few words for efficiency (or on final)
      if (i % 3 === 0 || i === words.length - 1) {
        onTranscript(interim);
      }

      await delay(40 + Math.random() * 60);
    }

    const finalEntry: TranscriptEntry = {
      role: turn.role,
      text: turn.text,
      timestamp: Date.now(),
      isFinal: true,
    };
    entries.push(finalEntry);
    onTranscript(finalEntry);
  }

  onStatusChange('ended');
  return entries;
}

async function runAIConversation(
  config: VoiceCallConfig,
  onTranscript: (entry: TranscriptEntry) => void,
  signal?: AbortSignal,
): Promise<TranscriptEntry[]> {
  const entries: TranscriptEntry[] = [];
  const systemPrompt = generateVoiceSystemPrompt(config);

  const simulationPrompt = `${systemPrompt}

SIMULATION MODE: You are generating a simulated phone conversation for a demo. Generate a realistic back-and-forth negotiation between yourself (the AI caller) and the seller. Format your output as a conversation with clear speaker labels.

Use this exact format for each line:
AGENT: [what the agent says]
SELLER: [what the seller responds]

Generate exactly 12-14 turns total (6-7 exchanges). Make it realistic — the seller should push back on price, and the agent should use the comparable sales data and negotiation strategy provided. End with a tentative agreement or a scheduled follow-up.

The seller's name is ${config.sellerName || 'the owner'}. The property is at ${config.property.address} listed at $${config.property.askingPrice.toLocaleString()}.

Start the conversation now:`;

  let fullText = '';

  await streamChat(
    [{ role: 'user', content: simulationPrompt }],
    (chunk) => {
      fullText += chunk;
    },
    signal,
  );

  // Parse the conversation
  const lines = fullText.split('\n').filter((l) => l.trim());
  for (const line of lines) {
    const trimmed = line.trim();
    let role: 'assistant' | 'user' | null = null;
    let text = '';

    if (trimmed.startsWith('AGENT:')) {
      role = 'assistant';
      text = trimmed.slice(6).trim();
    } else if (trimmed.startsWith('SELLER:')) {
      role = 'user';
      text = trimmed.slice(7).trim();
    }

    if (role && text) {
      // Simulate delay between turns
      await delay(1000 + Math.random() * 1500);
      if (signal?.aborted) break;

      const entry: TranscriptEntry = {
        role,
        text,
        timestamp: Date.now(),
        isFinal: true,
      };
      entries.push(entry);
      onTranscript(entry);
    }
  }

  return entries;
}
