# TX Arts Pathway — Progress Checklist

_Last updated: end of initial build session._

## Phase 1 — Architecture & docs
- [x] architecture.md
- [x] product-requirements.md
- [x] database-schema.md
- [x] content-model.md
- [x] development-roadmap.md
- [x] progress.md (this file)
- [x] README.md (setup, env vars, deployment)

## Phase 2 — Foundation
- [x] Next.js 14 + TS + Tailwind scaffold
- [x] Prisma schema (full data model) + migrations
- [x] Auth.js credentials auth, bcrypt hashing, role sessions, suspended-user lockout
- [x] Design system primitives (Button, Card, Badge, ProgressBar, Input, Nav)
- [x] App shell + responsive nav (public / student / admin)
- [x] App builds and runs locally (verified: `npm run build`, `npm run dev`, manual browser QA)

## Phase 3 — Exam content system
- [x] Exam/Domain/Objective/Skill/Lesson/Question CRUD (admin)
- [x] CSV question import with validation, duplicate detection, unpublished-by-default
- [x] Seed script: demo Theatre exam (3 domains, 6 objectives, 12 skills, 12 lessons, 60 questions)

## Phase 4 — Diagnostic engine
- [x] Diagnostic start/resume + domain/skill-balanced question selection (seeded, stable)
- [x] Scoring + domain/objective/skill breakdown (idempotent on retry)
- [x] Priority ranking + study plan generation

## Phase 5 — Study engine
- [x] Study session flow (learn/example/check/practice/review/mastery check)
- [x] Mastery scoring (EMA, difficulty- and recency-aware) + spaced repetition scheduling
- [x] Missed-question ("Your Mistakes") system with retry/favorite/hide
- [x] Dashboard wired to real data (readiness, mastery, streak, priorities, next activity)

## Phase 6 — Practice exams
- [x] Practice exam simulator (timed/untimed, flagging, domain-balanced selection)
- [x] Results + recommendation/study-plan update

## Phase 7 — Payments
- [x] Stripe checkout session route (+ dev-mode fallback when unconfigured)
- [x] Stripe webhook (purchase, refund, expiry handling)
- [x] Access expiration banners + renew gate
- [x] Admin manual access grants + coupons
- [x] Purchase confirmation / welcome emails wired to `lib/email.ts` (console-logged in dev)
- [x] Scheduled access-expiration reminder job (`/api/cron/access-reminders`, `vercel.json`)

## Phase 8-9 — Polish
- [x] Landing page (all sections: hero, how-it-works, why-us, exam areas, dashboard preview,
      pricing, testimonials, FAQ, disclaimer)
- [x] Admin analytics dashboard (active users, diagnostic completion, mastery, most-missed
      questions, most-difficult skills, practice exam performance, revenue, expiring access)
- [x] Empty states (no diagnostic, no mistakes, no study plan, no practice exams published)
- [x] Error states (client-side retry UI on attempt-completion failure; friendly copy)
- [x] Accessibility pass (skip link, semantic landmarks, aria-live-free but labeled
      radiogroup/checkbox roles on question options, focus-visible ring, reduced-motion
      support, alt text on question images, labeled form fields)
- [x] Favicon / app icon

## Phase 10 — Tests & finalize
- [x] Vitest suite: 56 tests across 11 files — auth/credential verification (incl. suspended
      users), mastery EMA calculations, spaced repetition scheduling, study streak
      calculation, recommendation engine (domain summary, priority ranking, next-activity
      selection), readiness/commerce math, CSV parsing, diagnostic question selection +
      scoring (incl. idempotency), practice exam question selection (domain balance,
      stability, cap), response evaluation + mistake tracking, access-expiration status
      (active/expired/revoked/warning windows)
- [x] Manual end-to-end browser QA (Playwright) of the full core loop: register →
      onboarding → access-gated diagnostic redirect → dev-mode purchase → diagnostic →
      results → dashboard → study plan → full study session (learn/check/practice/review/
      mastery check) → practice exam attempt → results → mistakes; plus admin CMS
      (analytics → exam → domain → objective → skill → users → CSV import)
- [x] `npm run build` passes with no type errors
- [x] Final docs pass
- [ ] Commit, push, open draft PR — in progress

## Known limitations (see development-roadmap.md for full list)

- The question-taking UI fully supports `MULTIPLE_CHOICE`/`MULTIPLE_SELECT`/`SCENARIO`/
  `IMAGE_BASED` rendering. `ORDERING`, `MATCHING`, and `SHORT_ANSWER` are fully modeled in
  the schema, validation, and scoring engine, but their dedicated input UIs (drag-to-order,
  match-the-pairs, free-text) are not yet built — the demo question bank uses
  `MULTIPLE_CHOICE` exclusively, so this doesn't block the working demo.
- No real AI, email delivery, or rate-limiting integration (architected for, not implemented).
