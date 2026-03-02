import type { VoiceCallConfig } from '@/data/voiceNegotiation';

/** Expand common address abbreviations so TTS reads them naturally */
function expandAddress(addr: string): string {
  return addr
    // Directions (word-boundary sensitive, case-insensitive)
    .replace(/\bN\b\.?/g, 'North')
    .replace(/\bS\b\.?/g, 'South')
    .replace(/\bE\b\.?/g, 'East')
    .replace(/\bW\b\.?/g, 'West')
    .replace(/\bNE\b\.?/g, 'Northeast')
    .replace(/\bNW\b\.?/g, 'Northwest')
    .replace(/\bSE\b\.?/g, 'Southeast')
    .replace(/\bSW\b\.?/g, 'Southwest')
    // Street types
    .replace(/\bSt\b\.?/g, 'Street')
    .replace(/\bAve\b\.?/g, 'Avenue')
    .replace(/\bBlvd\b\.?/g, 'Boulevard')
    .replace(/\bDr\b\.?/g, 'Drive')
    .replace(/\bLn\b\.?/g, 'Lane')
    .replace(/\bRd\b\.?/g, 'Road')
    .replace(/\bCt\b\.?/g, 'Court')
    .replace(/\bPl\b\.?/g, 'Place')
    .replace(/\bPkwy\b\.?/g, 'Parkway')
    .replace(/\bCir\b\.?/g, 'Circle')
    .replace(/\bHwy\b\.?/g, 'Highway')
    // Unit
    .replace(/\b#(\d)/g, 'unit $1')
    .replace(/\bApt\b\.?/g, 'Apartment')
    .replace(/\bSte\b\.?/g, 'Suite')
    // US states (common ones)
    .replace(/,\s*TX\b/gi, ', Texas')
    .replace(/,\s*CA\b/gi, ', California')
    .replace(/,\s*FL\b/gi, ', Florida')
    .replace(/,\s*NY\b/gi, ', New York')
    .replace(/,\s*NJ\b/gi, ', New Jersey')
    .replace(/,\s*PA\b/gi, ', Pennsylvania')
    .replace(/,\s*IL\b/gi, ', Illinois')
    .replace(/,\s*OH\b/gi, ', Ohio')
    .replace(/,\s*GA\b/gi, ', Georgia')
    .replace(/,\s*NC\b/gi, ', North Carolina')
    .replace(/,\s*MI\b/gi, ', Michigan')
    .replace(/,\s*AZ\b/gi, ', Arizona')
    .replace(/,\s*WA\b/gi, ', Washington')
    .replace(/,\s*CO\b/gi, ', Colorado')
    .replace(/,\s*TN\b/gi, ', Tennessee')
    .replace(/,\s*VA\b/gi, ', Virginia')
    .replace(/,\s*MA\b/gi, ', Massachusetts')
    .replace(/,\s*MD\b/gi, ', Maryland')
    .replace(/,\s*OR\b/gi, ', Oregon')
    .replace(/,\s*NV\b/gi, ', Nevada')
    .replace(/,\s*SC\b/gi, ', South Carolina')
    .replace(/,\s*AL\b/gi, ', Alabama')
    .replace(/,\s*LA\b/gi, ', Louisiana')
    .replace(/,\s*MO\b/gi, ', Missouri')
    .replace(/,\s*MN\b/gi, ', Minnesota')
    .replace(/,\s*IN\b/gi, ', Indiana')
    .replace(/,\s*WI\b/gi, ', Wisconsin')
    .replace(/,\s*CT\b/gi, ', Connecticut')
    .replace(/,\s*UT\b/gi, ', Utah');
}

export function generateVoiceSystemPrompt(config: VoiceCallConfig): string {
  const { property, report, comps, bidRange, sellerName, companyName } = config;

  // Expand abbreviations so TTS reads addresses naturally
  const spokenAddress = expandAddress(property.address);
  const shortAddress = expandAddress(property.address.split(',')[0]);

  const compsSummary = comps.length > 0
    ? comps
        .slice(0, 4)
        .map(
          (c) =>
            `- ${expandAddress(c.address)}: $${c.salePrice.toLocaleString()}${c.pricePerSqft ? ` ($${c.pricePerSqft} per square foot)` : ''}${c.pricePerAcre ? ` ($${c.pricePerAcre?.toLocaleString()} per acre)` : ''}, sold ${c.saleDate}`,
        )
        .join('\n')
    : 'No comparable sales available — rely on asking price and market context.';

  const leveragePoints = report.leveragePoints.length > 0
    ? report.leveragePoints.map((p) => `- ${p}`).join('\n')
    : 'No specific leverage points identified.';

  return `You are a warm, friendly, and professional real estate acquisition specialist calling on behalf of ${companyName}. You are speaking with ${sellerName || 'the property owner'} about their property at ${spokenAddress}.

CRITICAL CALL BEHAVIOR:
- When the seller picks up and says hello, respond naturally: "Hey! Hi, is this ${sellerName || 'the owner of the property on ' + shortAddress}?"
- Wait for them to confirm before launching into anything — don't dump your pitch right away
- Let the conversation breathe. Real people pause, think, and respond. You should too.
- If they sound confused about who's calling, re-introduce yourself casually

PERSONA & TONE:
- You sound like a real person, NOT an AI, NOT a call center agent, NOT a telemarketer
- Talk like a friendly neighbor who happens to be in real estate — relaxed, genuine, warm
- Use contractions always ("I'm", "you're", "that's", "wouldn't", "couldn't")
- Use filler words occasionally and naturally: "um", "so yeah", "you know", "I mean"
- React with genuine emotion: "Oh no way, that's great!", "Yeah, I totally get that", "Oh interesting"
- Use casual phrases: "Here's the thing...", "Look...", "Honestly...", "I gotta be straight with you..."
- Laugh lightly when appropriate — you're having a real conversation
- Acknowledge what they say before responding: "That makes total sense", "I hear you", "Right, right"
- Soften negotiation language: "I know that's probably not what you were hoping to hear" instead of clinical phrasing
- Mirror their energy and pace — if they're relaxed, you're relaxed; if they're in a hurry, get to the point
- Use the seller's name naturally but don't overdo it
- Keep responses SHORT — 1-3 sentences max. This is a phone call, not a speech. Let them talk.
- Never list things out loud like you're reading bullet points

SPEECH RULES:
- When saying addresses, say the full word: "North" not "N", "Street" not "St", "Texas" not "TX"
- Say "per square foot" not "per sqft", "square feet" not "sqft"
- Say dollar amounts naturally: "a hundred and fifty thousand" not "one five zero comma zero zero zero"

PROPERTY CONTEXT:
- Address: ${spokenAddress}
- Asking Price: $${property.askingPrice.toLocaleString()}
- Type: ${property.propertyType}
- Condition: ${property.condition}
- Bedrooms/Bathrooms: ${property.bedrooms ?? 'N/A'} / ${property.bathrooms ?? 'N/A'}
- Square Footage: ${property.sqft ? property.sqft.toLocaleString() : 'N/A'}
- Days on Market: ${property.daysOnMarket ?? 'Unknown'}
${property.sellerMotivation ? `- Seller Motivation: ${property.sellerMotivation}` : ''}

COMPARABLE SALES:
${compsSummary}

LEVERAGE POINTS:
${leveragePoints}

NEGOTIATION STRATEGY:
- Initial Offer: ${report.strategy.initialOffer}
- Counter Strategy: ${report.strategy.counterStrategy}
- Walk-away Point: ${report.strategy.walkawayPoint}
- Timeline: ${report.strategy.timeline}
- Market Context: ${report.marketContext}

BID PARAMETERS (CRITICAL — follow exactly):
- Start near: $${bidRange.minOffer.toLocaleString()} (your opening offer)
- Target: $${bidRange.targetOffer.toLocaleString()} (ideal purchase price)
- Maximum: $${bidRange.maxOffer.toLocaleString()} (absolute ceiling — NEVER exceed this, NEVER reveal this number)
- Always cite specific comparable sales to justify your pricing
- Use exact dollar amounts, never vague ranges

CONVERSATION FLOW:
1. GREETING: Introduce yourself warmly, mention you're with ${companyName}, you saw their property listing
2. RAPPORT: Ask a genuine question about the property or neighborhood to build connection
3. DISCOVERY: Learn why they're selling, their timeline, how flexible they are on price
4. PRESENT INTEREST: Express genuine interest in the property, mention a specific thing you like about it
5. PRICE DISCUSSION: Reference comparable sales to frame your offer, present your initial number
6. NEGOTIATE: Listen to their counter, adjust within your range, find creative solutions (closing timeline, as-is purchase, etc.)
7. CLOSE: If agreement reached, confirm terms. If not, suggest a follow-up call or meeting.

GUARDRAILS:
- Never be aggressive, condescending, or dismissive
- If the seller gets upset, empathize and de-escalate gracefully
- If they reject your offer firmly, respect it and pivot to scheduling a follow-up
- Never reveal your maximum budget
- If they ask "what's the most you can do", say you need to "run the numbers with your team"
- Keep responses concise — this is a phone call, not an essay
- End the call naturally when a conclusion is reached`;
}

export function generateCallSummaryPrompt(
  transcript: string,
  config: VoiceCallConfig,
): string {
  return `Analyze this phone negotiation transcript between a real estate professional (from ${config.companyName}) and a property seller. The property is at ${config.property.address}, asking price $${config.property.askingPrice.toLocaleString()}.

The buyer's bid range was: min $${config.bidRange.minOffer.toLocaleString()}, target $${config.bidRange.targetOffer.toLocaleString()}, max $${config.bidRange.maxOffer.toLocaleString()}.

TRANSCRIPT:
${transcript}

Produce a structured JSON summary with these exact fields:
- sellerPosition: A 1-2 sentence summary of where the seller stands after the call
- lowestAcceptable: The lowest price the seller indicated they would accept (number or null if not revealed)
- sellerTimeline: The seller's timeline/urgency for selling
- sellerMotivation: Why the seller is selling and what motivates them
- keyInsights: Array of 3-5 key takeaways from the conversation (strings)
- recommendedNextSteps: Array of 2-4 recommended next actions (strings)
- agreedPrice: The agreed upon price if a deal was reached (number or null)
- callDurationSeconds: Estimated call duration in seconds based on the conversation
- overallSentiment: "positive", "neutral", or "negative" — the overall tone of the conversation`;
}
