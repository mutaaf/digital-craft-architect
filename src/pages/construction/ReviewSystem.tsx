import { useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import PhoneMockup from '@/components/construction/reviews/PhoneMockup';
import SMSBubble from '@/components/construction/reviews/SMSBubble';
import TimelineBar from '@/components/construction/reviews/TimelineBar';
import ReviewDashboard from '@/components/construction/reviews/ReviewDashboard';
import { useDemoContext } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Star,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight,
  MessageSquareText,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';

type ReplyTone = 'professional' | 'warm' | 'apologetic';
interface SmartReply {
  tone: ReplyTone;
  content: string;
}

const TONE_META: Record<ReplyTone, { label: string; hint: string }> = {
  professional: { label: 'Professional', hint: 'Polished, brand-safe, neutral' },
  warm: { label: 'Warm', hint: 'Friendly and personal' },
  apologetic: { label: 'Apologetic', hint: 'Owns the issue, offers recovery' },
};

const SMART_REPLY_SYSTEM_PROMPT = `You are a small-business owner replying to a public Google review. The user will paste a review (positive or negative). Generate exactly THREE possible reply drafts in three distinct tones: "professional", "warm", and "apologetic". Each reply must:
- Be 2 to 4 sentences.
- Sound like a real human owner, not corporate boilerplate.
- Address something specific the reviewer said.
- For negative reviews, take responsibility without admitting legal fault. Offer a way to talk offline.
- Never use em dashes. Never invent facts the reviewer did not state.
- Never apologize in the "professional" or "warm" replies if the review is positive.
Return ONLY a valid JSON object of the form: {"replies":[{"tone":"professional","content":"..."},{"tone":"warm","content":"..."},{"tone":"apologetic","content":"..."}]}. No prose, no code fences.`;

function buildReviews(ownerName: string) {
  return [
    { name: 'Mike R.', rating: 5, text: 'Amazing kitchen remodel. On time, on budget. Highly recommend!', date: '2 days ago' },
    { name: 'Lisa T.', rating: 5, text: `${ownerName} and the team transformed our bathroom. Professional from start to finish.`, date: '4 days ago' },
    { name: 'James K.', rating: 4, text: 'Great work on the patio. Minor delay but end result was perfect.', date: '1 week ago' },
    { name: 'Anna M.', rating: 5, text: "Best contractor experience we've ever had. Already recommending to friends.", date: '1 week ago' },
    { name: 'David P.', rating: 5, text: 'Full home renovation done right. Communication was excellent throughout.', date: '2 weeks ago' },
  ];
}

type Phase = 'initial' | 'rating' | 'positive' | 'negative' | 'feedback_sent' | 'day3' | 'day7';

const ReviewSystem = () => {
  const { company } = useDemoContext();
  const companyName = company?.companyName || 'DigitalCraft AI';
  const ownerName = company?.ownerName || 'Ro';
  const location = company?.location || 'DFW';
  const firstService = company?.services?.[0]?.toLowerCase() || 'kitchen remodel';
  const avgJobValue = company?.avgJobValue || 35000;

  const recentReviews = useMemo(() => buildReviews(ownerName), [ownerName]);

  const [phase, setPhase] = useState<Phase>('initial');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [currentDay, setCurrentDay] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [dashStats, setDashStats] = useState({ sent: 47, responseRate: 72, avgRating: 4.8, newReviews: 12 });

  // Smart Reply Generator state
  const [reviewInput, setReviewInput] = useState('');
  const [replies, setReplies] = useState<SmartReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [copiedTone, setCopiedTone] = useState<ReplyTone | null>(null);

  const generateSmartReplies = useCallback(async () => {
    const trimmed = reviewInput.trim();
    if (!trimmed) return;
    setLoadingReplies(true);
    setReplyError(null);
    setReplies([]);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SMART_REPLY_SYSTEM_PROMPT },
            { role: 'user', content: `Business: ${companyName}\nOwner: ${ownerName}\n\nReview to reply to:\n${trimmed}` },
          ],
          temperature: 0.6,
          max_tokens: 600,
          response_format: { type: 'json_object' },
        }),
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from model');
      const parsed = JSON.parse(content);
      const out: SmartReply[] = (parsed?.replies ?? []).filter(
        (r: SmartReply) => r && typeof r.content === 'string' && r.tone in TONE_META,
      );
      if (out.length === 0) throw new Error('Model returned no usable replies');
      setReplies(out);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not generate replies';
      setReplyError(message);
    } finally {
      setLoadingReplies(false);
    }
  }, [reviewInput, companyName, ownerName]);

  const copyReply = useCallback(async (reply: SmartReply) => {
    try {
      await navigator.clipboard.writeText(reply.content);
      setCopiedTone(reply.tone);
      setTimeout(() => setCopiedTone((t) => (t === reply.tone ? null : t)), 1800);
    } catch {
      // clipboard unavailable; non-fatal
    }
  }, []);

  const handleRate = useCallback((stars: number) => {
    setRating(stars);
    if (stars >= 4) {
      setPhase('positive');
      setDashStats((s) => ({ ...s, sent: s.sent + 1, newReviews: s.newReviews + 1, responseRate: 73 }));
    } else {
      setPhase('negative');
      setFeedbackOpen(true);
    }
  }, []);

  const handleFeedbackSubmit = () => {
    setFeedbackOpen(false);
    setPhase('feedback_sent');
    setDashStats((s) => ({ ...s, sent: s.sent + 1, responseRate: 73 }));
  };

  const handleDayJump = (day: number) => {
    setCurrentDay(day);
    if (day === 0) {
      if (rating > 0) {
        setPhase(rating >= 4 ? 'positive' : (phase === 'feedback_sent' ? 'feedback_sent' : 'negative'));
      } else {
        setPhase('initial');
      }
    } else if (day === 3) {
      setPhase('day3');
    } else if (day === 7) {
      setPhase('day7');
      setDashStats((s) => ({ ...s, sent: s.sent + 2, newReviews: s.newReviews + 1 }));
    }
  };

  const resetDemo = () => {
    setPhase('initial');
    setRating(0);
    setHoverRating(0);
    setCurrentDay(0);
    setFeedback('');
    setDashStats({ sent: 47, responseRate: 72, avgRating: 4.8, newReviews: 12 });
  };

  const startFlow = () => setPhase('rating');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>Review Request System Demo | DigitalCraft AI</title>
        <meta name="description" content="Experience automated SMS review requests that turn completed projects into 5-star Google reviews with smart follow-ups." />
        <meta property="og:title" content="Review Request System Demo | DigitalCraft AI" />
        <meta property="og:description" content="Automated SMS review requests that turn completed projects into 5-star Google reviews." />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="text-center mb-6">
          <Badge variant="secondary" className="mb-3">
            <Sparkles size={14} className="mr-1" /> POC Demo
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            AI Review Management for Contractors
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Automated SMS sequences turn every completed project into a 5-star Google review —
            without {ownerName} or the team lifting a finger.
          </p>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto text-center mb-6">
          This AI review management demo shows how contractors and construction companies can automate their online reputation. Most contractors finish great work but never ask for reviews — and the few who do ask too late, when the excitement has faded. Our automated review request system sends personalized SMS messages at the perfect time after project completion, making it effortless for happy clients to leave 5-star Google reviews. The dashboard tracks review velocity, sentiment, and response rates in real time. See below how the SMS flow works from initial follow-up through gentle reminders, and watch the review dashboard update as positive reviews come in. For construction businesses, more Google reviews mean higher local search rankings, more trust from prospects, and more booked jobs.
        </p>

        {/* How it works — 3-step pipeline */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <Card className="p-4 text-center animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Zap size={18} className="text-primary" />
            </div>
            <p className="text-sm font-semibold mb-1">Auto-Triggers</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Project marked complete → SMS sent within 1 hour. No manual work.
            </p>
          </Card>
          <Card className="p-4 text-center animate-fade-in" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck size={18} className="text-primary" />
            </div>
            <p className="text-sm font-semibold mb-1">Smart Routing</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Happy customers → Google. Unhappy → private feedback to {ownerName}. Protects your rating.
            </p>
          </Card>
          <Card className="p-4 text-center animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Clock size={18} className="text-primary" />
            </div>
            <p className="text-sm font-semibold mb-1">Persistent Follow-Up</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Day 3 check-in + Day 7 reminder. 72% response rate vs 15% industry average.
            </p>
          </Card>
        </div>

        <Separator className="mb-8" />

        {/* Demo label */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <ArrowRight size={14} className="text-primary" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            Try the flow yourself — tap through Sarah's experience below
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Left: Phone + Timeline */}
          <div className="flex flex-col items-center">
            <PhoneMockup>
              {/* Day 0 initial message */}
              <SMSBubble from="business" time="Just now">
                <p className="font-medium mb-1">{companyName}</p>
                <p>
                  Hi Sarah! 👋 Your {firstService} is complete. We'd love to know how we did!
                </p>
                <p className="mt-2">How would you rate your experience? Tap a star below:</p>
              </SMSBubble>

              {/* Rating selector */}
              {phase === 'initial' && (
                <div className="flex justify-center py-3 animate-fade-in">
                  <Button size="sm" onClick={startFlow} className="gap-2 shadow-sm">
                    <Star size={14} /> Tap to Rate
                  </Button>
                </div>
              )}

              {phase === 'rating' && (
                <div className="flex justify-center gap-2 py-3 animate-fade-in">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleRate(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-125 active:scale-95"
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${
                          s <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Positive flow */}
              {(phase === 'positive' || (currentDay > 0 && rating >= 4)) && (
                <>
                  <SMSBubble from="customer" time="Just now">
                    {'⭐'.repeat(rating)}
                  </SMSBubble>
                  <SMSBubble from="business" time="Just now">
                    <p>
                      Wow, thank you Sarah! 🎉 We're thrilled you love your new {firstService.includes('remodel') || firstService.includes('renovation') ? firstService : 'project'}!
                    </p>
                    <p className="mt-2">
                      Would you mind sharing your experience on Google? It really helps other
                      homeowners find us.
                    </p>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="inline-flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400 underline text-xs font-medium"
                    >
                      <ExternalLink size={10} /> Leave a Google Review
                    </a>
                  </SMSBubble>
                </>
              )}

              {/* Negative flow */}
              {phase === 'negative' && (
                <>
                  <SMSBubble from="customer" time="Just now">
                    {'⭐'.repeat(rating)}
                  </SMSBubble>
                  <SMSBubble from="business" time="Just now">
                    <p>
                      We're sorry to hear that, Sarah. Your feedback is important to us.
                    </p>
                    <p className="mt-2">
                      Could you share what we could have done better? We'll have {ownerName} reach out
                      personally.
                    </p>
                  </SMSBubble>
                </>
              )}

              {phase === 'feedback_sent' && currentDay === 0 && (
                <>
                  <SMSBubble from="customer" time="Just now">
                    {'⭐'.repeat(rating)}
                  </SMSBubble>
                  <SMSBubble from="business" time="Just now">
                    <p>We're sorry to hear that, Sarah.</p>
                  </SMSBubble>
                  <SMSBubble from="customer" time="Just now">
                    <p>{feedback || 'The timeline was longer than expected.'}</p>
                  </SMSBubble>
                  <SMSBubble from="business" time="Just now">
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                      <AlertTriangle size={14} />
                      <span className="text-xs font-medium">{ownerName} has been notified</span>
                    </div>
                    <p className="mt-1">
                      Thank you for sharing, Sarah. {ownerName} will reach out to you directly within 24
                      hours to make this right.
                    </p>
                  </SMSBubble>
                </>
              )}

              {/* Day 3 follow-up */}
              {phase === 'day3' && (
                <>
                  {rating > 0 && (
                    <SMSBubble from="customer" time="Day 0">
                      {'⭐'.repeat(rating)}
                    </SMSBubble>
                  )}
                  <div className="text-center text-[10px] text-gray-400 py-2">
                    — 3 days later —
                  </div>
                  <SMSBubble from="business" time="Day 3">
                    <p className="font-medium mb-1">{companyName}</p>
                    <p>
                      Hi Sarah! Just checking in — how's everything holding up with the new
                      {firstService.includes('remodel') || firstService.includes('renovation') ? ` ${firstService}` : ' project'}? Any questions or concerns?
                    </p>
                  </SMSBubble>
                </>
              )}

              {/* Day 7 final */}
              {phase === 'day7' && (
                <>
                  {rating > 0 && (
                    <SMSBubble from="customer" time="Day 0">
                      {'⭐'.repeat(rating)}
                    </SMSBubble>
                  )}
                  <div className="text-center text-[10px] text-gray-400 py-2">
                    — 7 days later —
                  </div>
                  <SMSBubble from="business" time="Day 7">
                    <p className="font-medium mb-1">{companyName}</p>
                    <p>
                      Hi Sarah! Quick reminder — if you enjoyed your remodel, a Google review
                      would mean the world to us and help other {location} homeowners find quality
                      contractors. 🙏
                    </p>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="inline-flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400 underline text-xs font-medium"
                    >
                      <ExternalLink size={10} /> Leave a Google Review
                    </a>
                  </SMSBubble>
                </>
              )}
            </PhoneMockup>

            <TimelineBar currentDay={currentDay} onJump={handleDayJump} />

            {/* Reset */}
            {rating > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetDemo}
                className="mt-3 text-gray-400 hover:text-gray-600 gap-1.5"
              >
                <RotateCcw size={12} /> Reset Demo
              </Button>
            )}
          </div>

          {/* Right: Dashboard */}
          <div>
            <ReviewDashboard
              sent={dashStats.sent}
              responseRate={dashStats.responseRate}
              avgRating={dashStats.avgRating}
              newReviews={dashStats.newReviews}
              recentReviews={recentReviews}
              companyName={companyName}
              location={location}
              avgJobValue={avgJobValue}
            />
          </div>
        </div>

        {/* Smart Reply Generator */}
        <div className="mt-12 pt-10 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center mb-6">
            <Badge variant="secondary" className="mb-3">
              <MessageSquareText size={14} className="mr-1" /> Smart Reply Generator
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Paste a review, get three reply drafts
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
              Three tones — professional, warm, apologetic — generated by GPT-4o, ready to copy
              into Google, Yelp, or your CRM. Useful for both 5-star reviews and the occasional
              1-star surprise.
            </p>
          </div>

          <Card className="p-5 sm:p-6 max-w-3xl mx-auto bg-white dark:bg-gray-900">
            <label
              htmlFor="smart-reply-input"
              className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200"
            >
              Customer review
            </label>
            <Textarea
              id="smart-reply-input"
              placeholder="Paste a Google or Yelp review here — try a positive one, or a complaint about a missed appointment."
              value={reviewInput}
              onChange={(e) => setReviewInput(e.target.value)}
              rows={5}
              className="mb-3"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {reviewInput.trim().length} characters
              </p>
              <Button
                onClick={generateSmartReplies}
                disabled={loadingReplies || reviewInput.trim().length < 10}
                className="gap-2"
              >
                {loadingReplies ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Generate 3 replies
                  </>
                )}
              </Button>
            </div>

            {replyError && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-200">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>Could not generate replies: {replyError}</span>
              </div>
            )}

            {replies.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {replies.map((reply) => (
                  <div
                    key={reply.tone}
                    className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4 flex flex-col"
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {TONE_META[reply.tone].label}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        {TONE_META[reply.tone].hint}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed flex-1">
                      {reply.content}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyReply(reply)}
                      className="mt-3 self-start gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label={`Copy ${TONE_META[reply.tone].label} reply`}
                    >
                      {copiedTone === reply.tone ? (
                        <>
                          <Check size={12} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Negative feedback dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your feedback stays private — it goes directly to {ownerName}, not to a public review.
          </p>
          <Textarea
            placeholder="What could we have done better?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFeedbackSubmit} disabled={!feedback.trim()}>
              Send Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewSystem;
