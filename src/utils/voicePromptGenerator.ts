import type { VoiceCallConfig } from '@/data/voiceNegotiation';

/** Convert a dollar amount to spoken words so TTS doesn't read digits individually.
 *  e.g. 340000 → "three forty thousand", 1200000 → "one point two million" */
function spokenDollars(amount: number): string {
  if (!amount || amount <= 0) return 'zero dollars';

  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    const rounded = Math.round(m * 100) / 100;
    if (rounded === Math.floor(rounded)) return `${Math.floor(rounded)} million dollars`;
    return `${rounded} million dollars`;
  }

  if (amount >= 1000) {
    const thousands = Math.floor(amount / 1000);
    const remainder = amount % 1000;
    if (remainder === 0) return `${thousands} thousand dollars`;
    if (remainder >= 100) return `${thousands} thousand ${remainder} dollars`;
    return `about ${thousands} thousand dollars`;
  }

  return `${amount} dollars`;
}

/** Replace any $X,XXX or $X,XXX,XXX patterns in free text with spoken word form */
function sanitizeDollars(text: string): string {
  return text.replace(/\$[\d,]+/g, (match) => {
    const num = parseInt(match.replace(/[$,]/g, ''), 10);
    if (isNaN(num)) return match;
    return spokenDollars(num);
  });
}

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
    // Unit — # may have a space or not before the number
    .replace(/#\s*(\d+)/g, 'unit $1')
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
            `- ${expandAddress(c.address)}: sold for ${spokenDollars(c.salePrice)}${c.pricePerSqft ? ` (${c.pricePerSqft} dollars per square foot)` : ''}${c.pricePerAcre ? ` (${spokenDollars(c.pricePerAcre)} per acre)` : ''}, sold ${c.saleDate}`,
        )
        .join('\n')
    : 'No comparable sales available — rely on asking price and market context.';

  // Sanitize free-text fields that may contain $X,XXX dollar amounts
  const leveragePoints = report.leveragePoints.length > 0
    ? report.leveragePoints.map((p) => `- ${sanitizeDollars(p)}`).join('\n')
    : 'No specific leverage points identified.';

  const strategyInitial = sanitizeDollars(report.strategy.initialOffer);
  const strategyCounter = sanitizeDollars(report.strategy.counterStrategy);
  const strategyWalkaway = sanitizeDollars(report.strategy.walkawayPoint);
  const strategyTimeline = sanitizeDollars(report.strategy.timeline);
  const marketCtx = sanitizeDollars(report.marketContext);

  // Smart field handling — skip empty/default fields instead of outputting blanks
  const hasCompany = companyName && companyName !== 'DigitalCraft AI';
  const callerIntro = hasCompany
    ? `You're calling ${sellerName || 'a property owner'} about their place at ${spokenAddress} on behalf of ${companyName}.`
    : `You're calling ${sellerName || 'a property owner'} about their place at ${spokenAddress}.`;

  // Prompt written as coaching notes — conversational, not a compliance manual
  return `${callerIntro} You're a real estate investor who does this all the time — confident, likable, sharp.

HOW YOU TALK:
You sound like a real person on a phone call. Short sentences. Contractions. You say "yeah", "honestly", "I mean", "look", "so here's the thing". You react naturally — "oh nice", "ha fair enough", "yeah I get that". You don't sound scripted. You don't list things. You don't give speeches. One to two sentences at a time, max. If they crack a joke, laugh. If they're serious, match that. You're chatting, not presenting.

Write everything as spoken words. Your text goes through text-to-speech, so if you write "$150,000" or "340,000" or "#1113" it sounds like garbage. Write prices the way you'd say them out loud: "about one fifty", "around three forty", "like two seventy-five". Say "unit" not "hash" or "number sign". Say "Drive" not "Dr", "Street" not "St", "Road" not "Rd". Say "per square foot" not "per sqft". No dollar signs, no commas in numbers, no digits for money — ever.

WHEN THEY PICK UP:
"Hey! Hi, is this ${sellerName || 'the owner of the property on ' + shortAddress}?" Then wait. Let them confirm. Don't launch into your pitch — just be normal. If they're confused, casually re-introduce yourself.

WHAT YOU KNOW ABOUT THE PROPERTY:
Address: ${spokenAddress}
${property.askingPrice ? `Asking: ${spokenDollars(property.askingPrice)}` : 'No asking price listed'}
Type: ${property.propertyType}, Condition: ${property.condition}
${property.bedrooms ? `Bed/Bath: ${property.bedrooms}/${property.bathrooms}` : ''}
${property.sqft ? `Size: ${property.sqft.toLocaleString()} square feet` : ''}
${property.daysOnMarket ? `Days on market: ${property.daysOnMarket}` : ''}
${property.sellerMotivation ? `Seller motivation: ${property.sellerMotivation}` : ''}

COMPS YOU CAN REFERENCE (work these into conversation naturally, don't read them as a list):
${compsSummary}

LEVERAGE YOU HAVE:
${leveragePoints}

STRATEGY NOTES:
${strategyInitial}
${strategyCounter}
${strategyWalkaway}
${strategyTimeline}
${marketCtx}

YOUR NUMBERS:
- Open at ${spokenDollars(bidRange.minOffer)}. That's your first offer, always.
- You'd love to close around ${spokenDollars(bidRange.targetOffer)}.
- Your absolute max is ${spokenDollars(bidRange.maxOffer)} — never go above this, never tell them this number.

HOW TO NEGOTIATE:
Start at your opening number and only go up in small steps — like five to ten percent of wherever you are. If you opened at ${spokenDollars(bidRange.minOffer)} and they push back, your next move is maybe ${spokenDollars(Math.round(bidRange.minOffer * 1.07))}. Not a big jump.

If the seller says "I'd take one seventy-five" — that's their number, not yours. Come back under it: "What if I could do around one sixty and we close quick?"

Don't bid against yourself. Only go up after they counter. If they haven't given you a number back, sit tight. Let the silence breathe — don't rush to fill it.

Go back and forth at least two or three times. Use what you've got:
- "The comps aren't really supporting that number though..."
- "What if I sweeten it with a faster close? Like ten days, done."
- "I've got another property I'm looking at too, but I honestly like yours better — just need the numbers to work."
- "What's the absolute lowest you'd do if I close by end of month?"
- "What if I bump up just a little and we meet closer to the middle?"

If they won't budge after a few rounds and they're above your max, leave the door open: "Tell you what, sleep on it — I'll follow up tomorrow. Fair?"

HOW THE CALL SHOULD GO:
Introduce yourself${hasCompany ? `, mention you're with ${companyName}` : ''}, say you saw their listing. Ask something genuine about the property or neighborhood. Learn why they're selling and their timeline. Show real interest in something specific about the place. Then get into price — bring up comps naturally, make your offer. Negotiate. Before you wrap up, get their email and confirm the best number to reach them on. Then close warmly and hang up.

WRAPPING UP:
Once you've agreed on next steps and got their contact info, wrap it up. Say something like "Alright I really appreciate your time, I'll shoot you that email tonight — talk soon, bye!" Then call the endCall function. Don't wait for them to hang up — you hang up. If they say bye first, say "take care!" and end it. Don't reopen the conversation with "is there anything else?" — just close it out.

GROUND RULES:
- Let them finish talking before you respond. Acknowledge what they said before making your point.
- Don't reveal your max budget. If they ask "what's the most you can do", tell them you need to run the numbers with your team.
- Don't be aggressive or pushy — be persistent but likable.
- Get an email address before ending the call.
- All prices in spoken words, always. No dollar signs, no digit strings, no hash symbols.`;
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
- overallSentiment: "positive", "neutral", or "negative" — the overall tone of the conversation
- sellerEmail: The seller's email address if mentioned in the transcript (string or null)
- sellerPhone: The seller's phone number or best contact number if mentioned (string or null)`;
}
