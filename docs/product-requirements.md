# TX Arts Pathway — Product Requirements

## Vision

"Stop studying everything. Start studying what you need." TX Arts Pathway is an
assessment-prep platform for Texas fine-arts educators preparing for TExES certification
exams. The product's defining loop is:

**Diagnose → Understand → Practice → Master → Retest → Improve**

## Non-negotiable product principles

1. Never present a flat, undifferentiated question bank. Every question a user sees should
   be selectable/explainable by the recommendation engine.
2. Every personalized claim on screen ("Focus next: Stagecraft") must be backed by rows in
   the database (mastery records, diagnostic results, response history) — never hard-coded.
3. Questions are original, TExES-*aligned* practice content. No copied/scraped ETS or TEA
   questions. Every question card and the footer carry a disclaimer (§ below).
4. Business model is one-time, time-boxed access (`AccessGrant`), not a forced subscription.
   Duration is configurable per `Product`.

## IP & disclaimer requirements (enforced in UI, not just docs)

- Question detail views render: *"Original TX Arts Pathway practice question — aligned to
  publicly available TExES competencies. Not an actual TExES exam item."*
- Global footer and a dedicated `/legal/disclaimer` page state: *"TX Arts Pathway is an
  independent exam-preparation resource and is not affiliated with, endorsed by, or
  sponsored by the Texas Education Agency, Pearson, or ETS."*
- Readiness score pages state it does not guarantee an official passing score.
- Seed/demo content is labeled "DEMO CONTENT — Replace with production content" in the
  admin UI and in a small on-page badge for unpublished/demo lessons.

## User roles

- **Guest** — marketing site, exam catalog, pricing, FAQ.
- **Student** — onboarding, diagnostic, dashboard, study sessions, practice exams, mistakes,
  study plan, account/billing.
- **Admin** — everything a student can see, plus `/admin` CMS, analytics, user management,
  access grants, content publishing, CSV import.

## Onboarding data collected (§5)

First/last name, email, password, certification area, target exam, testing date (optional),
teaching experience, prior attempts (optional), self-rated confidence (1–5), and a goal enum:
`NEED_TO_PASS`, `HAVE_NOT_TAKEN_YET`, `FAILED_PREVIOUSLY`, `ASSESS_READINESS`,
`STUDYING_WHILE_WORKING`. Stored on `Profile`, one-to-one with `User`.

## Diagnostic (§6) — definition of done

- Presents questions spanning every `Domain` under the user's selected `Exam`.
- Produces per-domain, per-objective, and per-skill accuracy — not a single score.
- Ranks domains into `PRIORITY 1/2/3...` by lowest performance (ties broken by lower
  confidence, then more attempts to control for noise).
- Persists a `DiagnosticResult` row and seeds one `MasteryRecord` per skill touched.
- Immediately generates a `StudyPlan` (see Study Plan below).

## Recommendation engine inputs (§7)

Accuracy, attempts count, question difficulty, recency (last response timestamp), repeated
misses (incorrect streak), time spent, self-reported confidence, and rolled-up
domain/objective performance. Output per skill: `masteryScore (0-100)`, `trend`
(`IMPROVING`/`DECLINING`/`STABLE`/`NEW`), `priority` (`HIGH`/`MEDIUM`/`LOW`), and a
`recommendedAction` (lesson, targeted practice, mini-quiz, review-missed, or retest).

## Dashboard (§8) — required fields, all DB-backed

Overall readiness score, diagnostic score, questions completed/remaining, streak, strongest
domains (mastery ≥ 80), weakest domains (mastery < 60 sorted ascending), one recommended
next activity (highest-priority `StudyPlanItem` not yet completed), recent performance
(last 5 attempts), exam countdown (from `Profile.testDate`), study-plan progress (% items
complete).

## Study session shape (§10)

Learn → Example → Check Your Understanding (1–3 items) → Practice (5–10 targeted items) →
Review (explanations for every miss) → Mastery Check → before/after mastery delta shown at
the end.

## Question engine (§11–12)

Metadata: exam, domain, objective, skill, topic, difficulty (1–5), type, correct answer,
distractors, explanation (must explain *why* every option is right/wrong), source/reference,
tags. `QuestionType` enum starts with `MULTIPLE_CHOICE`, `MULTIPLE_SELECT`, `SCENARIO`,
`MATCHING`, `ORDERING`, `IMAGE_BASED`, `SHORT_ANSWER` — enum values can be extended without a
migration to the core tables because options are stored generically (`QuestionOption` +
`correctOrder`/`matchKey` columns support ordering/matching types).

## Missed-question system (§13) & adaptive difficulty (§14) & spaced repetition (§15)

`Mistake` rows track question, user's answer, correct answer, domain/skill, first/last
missed date, and times-missed count, with retry/favorite/hide actions. Adaptive selection
raises/lowers served difficulty based on rolling accuracy per skill (see
`diagnostic-engine.ts` / `recommendation-engine.ts`). `MasteryRecord` carries
`lastReviewedAt`, `reviewCount`, `correctStreak`, `incorrectStreak`, `masteryScore`, and
`nextReviewAt`, computed by `lib/spaced-repetition.ts` on an SM-2-inspired curve
(low mastery → next-day review, high mastery → 30-day review).

## Study plan (§16)

Generated as an ordered list of `StudyPlanItem`s (one per priority skill/domain), defaulting
to an 8-week cadence but re-ordered/re-weighted whenever mastery crosses thresholds (mastered
early → pulled forward to the next priority item; regressed → an extra review item is
inserted). This recomputation runs after every diagnostic, practice exam, and mastery check.

## Practice exams (§17) & readiness score (§18)

Full-length, domain-balanced, randomized, timed or untimed, with flagging and a detailed
report (overall %, strong/weak areas) that feeds back into the recommendation engine. The
**TX Arts Readiness Score** (0–100) is a weighted blend of diagnostic performance, recent
practice accuracy, domain mastery spread, practice-exam performance, consistency (login/
practice frequency), and recency decay — documented in `lib/readiness.ts` with an explicit
"does not guarantee a passing score" disclaimer wherever it is displayed.

## Gamification (§19)

Streak counter, daily goal progress, lessons completed, skills mastered, a small set of
professional-toned badges (e.g., "Diagnostic Complete", "7-Day Streak", "Domain Mastered").
No avatars, characters, or childish mechanics.

## Admin (§20–22) & CMS authoring path (§49)

Exam → Domain → Objective → Skill → Lesson → Question, each created through validated forms;
publish/unpublish gates whether a student ever sees a row. CSV import validates rows,
reports valid/invalid counts with row-level errors, flags likely duplicates by
(exam, question text similarity), and always imports as **unpublished** for admin review.

## Payments & access (§23–24)

One-time Stripe Checkout purchase → webhook creates `Purchase` + `AccessGrant` with
`startDate`/`expiresAt` = `startDate + Product.durationDays`. Expiration banners at 30/7/1
day remaining; after expiration, login still works but paid routes redirect to a renew page.
Coupons apply a percentage/fixed discount at Checkout.

## Explicit non-goals for this build

- No real AI model calls (architecture only, per §34 and `architecture.md` §7).
- No real transactional email delivery (interface + console-log stub only).
- No native mobile app — responsive web only.
