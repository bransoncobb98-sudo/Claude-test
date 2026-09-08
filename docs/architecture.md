# TX Arts Pathway — Architecture

## 1. Repository state at project start

The repository was empty (no commits, no source files) when this build began. Everything
described below is a greenfield implementation on branch `claude/tx-arts-pathway-build-y7peq2`.

## 2. Technology stack

| Layer          | Choice                                             | Rationale |
|----------------|-----------------------------------------------------|-----------|
| Frontend       | Next.js 14 (App Router), React 18, TypeScript       | Server components for data-heavy dashboards, file-system routing, easy Vercel deploy |
| Styling        | Tailwind CSS + a small design-token layer           | Fast, consistent, themeable; matches "modern LMS" brief |
| Backend        | Next.js Route Handlers + Server Actions             | Keeps one deployable unit; no separate API service needed at this scale |
| Database       | PostgreSQL 16                                        | Relational integrity for the Exam→Domain→Objective→Skill→Question graph |
| ORM            | Prisma                                               | Type-safe schema, migrations, good DX for a CMS-heavy app |
| Auth           | Auth.js (NextAuth) — Credentials provider, JWT sessions, bcrypt hashing | No external IdP dependency required; role claims (`STUDENT`/`ADMIN`) embedded in session |
| Payments       | Stripe Checkout + Webhooks                           | PCI scope stays with Stripe; no card data ever touches our servers |
| Testing        | Vitest                                               | Fast, native ESM/TS support, works well with Next.js |
| Hosting target | Vercel + managed Postgres (Neon/RDS/Supabase)         | Zero-config deploys for Next.js; Postgres is portable to any provider |

No existing code or framework choices were overridden — this is the initial stack decision.

## 3. High-level module map

```
src/
  app/                          # Next.js App Router
    (marketing)/                # Public landing site
    (auth)/                     # Sign in / register / onboarding
    (app)/                      # Authenticated student experience
      dashboard/
      diagnostic/
      study/[skillId]/
      exams/[examSlug]/practice-exams/[attemptId]
      mistakes/
      study-plan/
      account/access
    admin/                      # Admin CMS + analytics
    api/
      auth/[...nextauth]/
      diagnostic/
      study/
      practice-exams/
      admin/*
      stripe/checkout, stripe/webhook
  components/                    # Design system + feature components
  lib/
    auth.ts                      # NextAuth config
    prisma.ts                    # Prisma client singleton
    access.ts                    # Access-window / entitlement checks
    recommendation-engine.ts      # Mastery + "what to study next" logic
    diagnostic-engine.ts          # Diagnostic question selection + scoring
    readiness.ts                  # TX Arts Readiness Score calculation
    spaced-repetition.ts          # SM-2-inspired scheduling
    stripe.ts                     # Stripe client + product/price helpers
    validation/                   # Zod schemas for all forms/APIs
  prisma/
    schema.prisma
    seed.ts
tests/
docs/
```

## 4. Core architectural principle: content is data, not code

Every exam concept (Exam, Domain, Objective, Skill, Lesson, Question, QuestionOption) is a
database row, editable through the Admin CMS or CSV import. The frontend never hard-codes
exam names, domain lists, or question content — pages resolve everything through Prisma
queries keyed by slugs/ids. Adding "TExES Art EC-12" as a new exam track requires only new
rows, not a redeploy.

## 5. Recommendation system as a service

`lib/recommendation-engine.ts` and `lib/readiness.ts` are the *only* places allowed to decide
"what should this user study next" or "how ready is this user." UI components call these
services and render their output — they never compute mastery, priority, or readiness
inline. This keeps every on-screen claim ("Focus next: Stagecraft") traceable to a query
over `Responses`, `MasteryRecord`, and `DiagnosticResult` rows (see `database-schema.md`).

## 6. Access control model

`lib/access.ts` centralizes the question "does this user currently have paid access?" by
comparing `AccessGrant.expiresAt` to `now()`. Route Handlers and Server Components for
paid content call `requireActiveAccess()`; the same function powers the expiration-warning
banners (30/7/1 day) and the post-expiration "Renew Access" gate. Business rules
(30/90/180/365-day products, promo codes, school licenses, free admin access) are modeled as
data (`Product`, `Coupon`, `AccessGrant`) rather than branching in code, so new access
durations or license types are configuration, not deployment.

## 7. What is fully wired vs. architected-for-later

- **Fully wired end-to-end (real DB reads/writes, no mocked data):** auth + onboarding,
  exam/domain/objective/skill/lesson/question CMS, CSV import, diagnostic assessment and
  scoring, recommendation engine, dashboard, study sessions, mastery + spaced repetition,
  missed-question review, practice exams, readiness score, admin analytics, Stripe checkout
  session creation + webhook handling + access grants.
- **Architected but requires operator configuration to go live:** actual Stripe account/keys,
  a transactional email provider (Resend/Postmark/SES — `lib/email.ts` defines the interface
  and logs to console in dev), and AI features (section 34) — the schema includes an
  `aiGenerated`/`reviewStatus` flag on `Question` so AI-authored questions can be added later
  without a schema change, but no AI generation code is included in this build.

See `development-roadmap.md` for what is deferred and why, and `progress.md` for a live
checklist.
