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
    text: "Hey! Hope I'm not interrupting dinner or anything — I'm calling from DigitalCraft AI. I came across your listing and honestly, I got a little excited about it. Do you have a sec?",
  },
  {
    role: 'user',
    text: "Oh hey, no you're good! Which listing are you calling about?",
  },
  {
    role: 'assistant',
    text: "The one on Elm Street! I've been looking in that neighborhood for a while and — okay don't judge me — but I actually drove by it last weekend and was like, yep, I need to call about this one. How long's it been on the market?",
  },
  {
    role: 'user',
    text: "Ha, well glad you liked it. It's been about two months now. We've had some interest but nothing's stuck.",
  },
  {
    role: 'assistant',
    text: "Yeah, I totally hear you on that. The market's been weird lately — everyone's looking but nobody wants to commit. So if you don't mind me asking, what's the story? Are you guys looking to move on to something else or...?",
  },
  {
    role: 'user',
    text: "We're actually relocating. My wife just got a new position out in Texas, so we kinda need to get this done in the next couple months.",
  },
  {
    role: 'assistant',
    text: "Oh no way, congrats to her! Texas is great — I've got family down in Austin. But yeah, I get it, that timeline adds some pressure. Look, I'm gonna be straight with you — I did my homework on comps in the area, and similar places have been closing between about $285K and $310K lately. I know that's probably not what you were hoping to hear, but I wanted to be upfront rather than waste your time.",
  },
  {
    role: 'user',
    text: "I appreciate the honesty, but we listed at $340K for a reason. We put a lot of work into this place.",
  },
  {
    role: 'assistant',
    text: "Oh I can tell, honestly. The place shows really well — my team actually just closed on a property a few blocks from you so I know the area. Here's the thing though — what I can offer that most buyers can't is speed and certainty. No inspection contingency, no financing drama. I could start around $295K and close in three weeks flat. I know that number stings a little, but hear me out on the whole package.",
  },
  {
    role: 'user',
    text: "That's a pretty big gap from what we're asking. I don't think we could go below $320K.",
  },
  {
    role: 'assistant',
    text: "I get it, I really do — and look, I'm not trying to lowball you here. Let me see what I can do... What if I come up to $310K, close in three weeks guaranteed, AND I cover all closing costs? So that $310K is truly what you walk away with. No nickels and dimes at the end. Does that start to feel like something we could work with?",
  },
  {
    role: 'user',
    text: "Hmm... I mean if you're covering closing costs and can actually close that fast... I'd need to talk it over with my wife but $310K might work.",
  },
  {
    role: 'assistant',
    text: "Hey, that's all I can ask! Talk it over tonight, no rush — well, okay a little rush since you've got Texas calling. But seriously, take your time. I'll have our team prep the paperwork on our end so if you're in, we can move right away. Sound good?",
  },
  {
    role: 'user',
    text: "Yeah that works. I'll call you back tomorrow afternoon.",
  },
  {
    role: 'assistant',
    text: "Awesome, I'll be here! And hey — genuinely, thanks for taking the time. I think we can make this a win for everybody. Talk tomorrow!",
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
  const systemPrompt = config.promptOverride || generateVoiceSystemPrompt(config);

  const isBookingCall = !!config.promptOverride;

  const simulationPrompt = isBookingCall
    ? `${systemPrompt}

SIMULATION MODE: You are generating a simulated phone conversation for a demo. Generate a realistic back-and-forth phone call between yourself (the AI booking agent, labeled AGENT) and the client (labeled CLIENT).

Use this exact format for each line:
AGENT: [what the agent says]
CLIENT: [what the client responds]

Generate exactly 12-14 turns total (6-7 exchanges). Make it realistic — the client is interested but has questions about packages, pricing, and availability. End with a consultation being scheduled or the client agreeing to receive more info.

The client's name is ${config.sellerName || 'the client'}.

Start the conversation now:`
    : `${systemPrompt}

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
    } else if (trimmed.startsWith('CLIENT:')) {
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
