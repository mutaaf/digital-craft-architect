import { useState, useCallback } from 'react';
import DemoNavbar from '@/components/construction/DemoNavbar';
import PhoneMockup from '@/components/construction/reviews/PhoneMockup';
import SMSBubble from '@/components/construction/reviews/SMSBubble';
import TimelineBar from '@/components/construction/reviews/TimelineBar';
import ReviewDashboard from '@/components/construction/reviews/ReviewDashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';

const RECENT_REVIEWS = [
  { name: 'Mike R.', rating: 5, text: 'Amazing kitchen remodel. On time, on budget. Highly recommend!', date: '2 days ago' },
  { name: 'Lisa T.', rating: 5, text: 'Ro and his team transformed our bathroom. Professional from start to finish.', date: '4 days ago' },
  { name: 'James K.', rating: 4, text: 'Great work on the patio. Minor delay but end result was perfect.', date: '1 week ago' },
  { name: 'Anna M.', rating: 5, text: 'Best contractor experience we\'ve ever had. Already recommending to friends.', date: '1 week ago' },
  { name: 'David P.', rating: 5, text: 'Full home renovation done right. Communication was excellent throughout.', date: '2 weeks ago' },
];

type Phase = 'initial' | 'rating' | 'positive' | 'negative' | 'feedback_sent' | 'day3' | 'day7';

const ReviewSystem = () => {
  const [phase, setPhase] = useState<Phase>('initial');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [currentDay, setCurrentDay] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [dashStats, setDashStats] = useState({ sent: 47, responseRate: 72, avgRating: 4.8, newReviews: 12 });

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
        setPhase(rating >= 4 ? 'positive' : rating > 0 ? (phase === 'feedback_sent' ? 'feedback_sent' : 'negative') : 'rating');
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

  // Auto-advance from initial to rating after mount
  const startFlow = () => setPhase('rating');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DemoNavbar />

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3">
            <Sparkles size={14} className="mr-1" /> POC Demo
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Automated Review Request System</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            See how 448 turns completed projects into 5-star Google reviews — automatically.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Left: Phone + Timeline */}
          <div className="flex flex-col items-center">
            <PhoneMockup>
              {/* Day 0 initial message */}
              <SMSBubble from="business" time="Just now">
                <p className="font-medium mb-1">448 Developments</p>
                <p>
                  Hi Sarah! 👋 Your kitchen remodel is complete. We'd love to know how we did!
                </p>
                <p className="mt-2">How would you rate your experience? Tap a star below:</p>
              </SMSBubble>

              {/* Rating selector */}
              {phase === 'initial' && (
                <div className="flex justify-center py-3">
                  <Button size="sm" onClick={startFlow} className="gap-2">
                    <Star size={14} /> Tap to Rate
                  </Button>
                </div>
              )}

              {phase === 'rating' && (
                <div className="flex justify-center gap-2 py-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleRate(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        size={28}
                        className={
                          s <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
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
                      Wow, thank you Sarah! 🎉 We're thrilled you love your new kitchen!
                    </p>
                    <p className="mt-2">
                      Would you mind sharing your experience on Google? It really helps other
                      homeowners find us.
                    </p>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="inline-flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400 underline text-xs"
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
                      Could you share what we could have done better? We'll have Ro reach out
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
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle size={14} />
                      <span className="text-xs font-medium">Ro has been notified</span>
                    </div>
                    <p className="mt-1">
                      Thank you for sharing, Sarah. Ro will reach out to you directly within 24
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
                    <p className="font-medium mb-1">448 Developments</p>
                    <p>
                      Hi Sarah! Just checking in — how's everything holding up with the new
                      kitchen? Any questions or concerns?
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
                    <p className="font-medium mb-1">448 Developments</p>
                    <p>
                      Hi Sarah! Quick reminder — if you enjoyed your remodel, a Google review
                      would mean the world to us and help other DFW homeowners find quality
                      contractors. 🙏
                    </p>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="inline-flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400 underline text-xs"
                    >
                      <ExternalLink size={10} /> Leave a Google Review
                    </a>
                  </SMSBubble>
                </>
              )}
            </PhoneMockup>

            <TimelineBar currentDay={currentDay} onJump={handleDayJump} />
          </div>

          {/* Right: Dashboard */}
          <div>
            <ReviewDashboard
              sent={dashStats.sent}
              responseRate={dashStats.responseRate}
              avgRating={dashStats.avgRating}
              newReviews={dashStats.newReviews}
              recentReviews={RECENT_REVIEWS}
            />
          </div>
        </div>
      </div>

      {/* Negative feedback dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Your feedback stays private — it goes directly to Ro, not to a public review.
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
            <Button onClick={handleFeedbackSubmit}>Send Feedback</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewSystem;
