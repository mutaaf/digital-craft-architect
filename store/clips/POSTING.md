# LinkedIn demo clips

Three 15 to 18 second clips of the construction demos, cut by `npm run clips` (scripts/clips.mjs) from
store/clips/clips.json into `dist-clips/` (not committed). Each is 1080x1350 (4:5, LinkedIn's tallest feed
format), H.264 with a silent audio track, and ends on a 2 second card: "Try the live demo" at
digitalcraftai.com/demos. Re-cut a variant with `npm run clips -- --skip-capture` after editing captions or cuts.

What is real and what is scripted:

- **dc-estimate** is the live page end to end. No AI call; the price comes from the page's own pricing table.
- **dc-lead-qualified** and **dc-review-replies** run the real pages, but the model's answers are fixtures
  (scripts/clips-fixtures.mjs) so recording never calls OpenAI. They follow the pages' own system prompts and
  carry an on-screen "Sample conversation" / "Sample output" tag. Keep the word "sample" in the post copy too.

Post the lead clip first: the finished lead card is the clearest payoff, and lead response is the problem
contractors feel most.

## 1. dc-lead-qualified (post first)

Hook: the finished lead card, seven fields at 100%, then the chat that filled it.

> A homeowner asks about a kitchen remodel at 9pm. Who answers?
>
> This is the lead responder from our construction demos: it chats on your website, gives a ballpark from your
> pricing, and fills in name, project, size, budget, timeline, area and phone as it goes. (Sample conversation
> below; the live demo lets you play the homeowner yourself.)
>
> Try it: digitalcraftai.com/demos

Hashtags: #Contractors #ConstructionBusiness #LeadGeneration #AIForSmallBusiness

## 2. dc-review-replies

Hook: three reply drafts on screen, then the review being pasted in.

> Two hours late on day one and nobody called. Every contractor has had this review.
>
> Paste it into the reply generator and get three drafts, professional, warm and apologetic, that own the miss
> without admitting legal fault and invite the customer to talk offline. You pick one and post it. (Sample
> output shown.)
>
> Try it on one of your own reviews: digitalcraftai.com/demos

Hashtags: #ReputationManagement #GoogleReviews #Contractors #SmallBusiness

## 3. dc-estimate

Hook: the price range and timeline, then the four steps that produced it.

> "Can you give me a rough number?" is the first question on every job.
>
> Project, square footage, finish level, add-ons: four steps and the homeowner sees a line-by-line ballpark
> range with a timeline, before you ever drive out.
>
> Try it: digitalcraftai.com/demos

Hashtags: #Remodeling #Contractors #ConstructionEstimating #SmallBusinessGrowth

## Notes

- Upload the MP4 natively (not a link) so it autoplays in the feed. LinkedIn plays muted; the captions carry it.
- Captions sit in the top third, clear of LinkedIn's bottom control bar.
- The end card URL is the hub of all demos. For a deeper link in the post text, the routes are
  /construction/demo/lead-responder, /construction/demo/reviews and /construction/demo/estimate.
