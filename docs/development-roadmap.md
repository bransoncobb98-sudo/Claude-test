# TX Arts Pathway — Development Roadmap

## Phase status

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Architecture & product docs | ✅ Complete |
| 2 | Foundation: Next.js/Tailwind/Prisma/Auth/design system/nav | ✅ Complete |
| 3 | Exam content system + admin CMS + CSV import + seed data | ✅ Complete |
| 4 | Diagnostic engine | ✅ Complete |
| 5 | Study engine: lessons, practice, mistakes, mastery, spaced repetition | ✅ Complete |
| 6 | Practice exams | ✅ Complete |
| 7 | Payments & access control (architecture + Stripe integration code) | ✅ Complete (requires live Stripe keys to process real payments) |
| 8-9 | Admin analytics polish, landing page, empty/error states, accessibility | ✅ Complete |
| 10 | Automated tests, final docs | ✅ Complete |

See `progress.md` for the granular, file-level checklist.

## What ships working today

Every item in `product-requirements.md` is backed by real Prisma models and real queries —
there are no hard-coded dashboard numbers, no fake recommendation copy, and no disabled
buttons. Payments are code-complete against the Stripe API (Checkout session creation,
webhook signature verification, `Purchase`/`AccessGrant` writes) but need real Stripe
**test-mode** keys in `.env` to exercise end-to-end; without keys, the checkout route returns
a clear "payments are not configured" error instead of crashing.

## Deliberately deferred (post-v1)

These are called out in the product brief as *future* features and are architected for
(schema flags, service boundaries) but not implemented, to keep this build honest about what
actually works end-to-end:

1. **AI Study Coach / AI Question Generator / AI Tutor (§34)** — `Question.aiGenerated` and
   `reviewStatus` exist so generated content can be added later without a migration; no LLM
   integration code is included.
2. **Real transactional email delivery (§25)** — `lib/email.ts` defines `sendEmail()` and
   the specific templates (welcome, purchase confirmation, expiration warnings, etc.) but
   logs to console in dev; swapping in Resend/Postmark/SES is a one-file change.
3. **Rate limiting / WAF-level protections (§32)** — basic input validation (Zod) and
   auth/role checks are implemented on every mutating route; a production deploy should add
   an edge rate limiter (e.g. Vercel Firewall or Upstash) — noted in `README.md`.
4. **CSV import de-duplication beyond exact-text matching** — flags exact duplicate prompts
   within an exam; fuzzy/near-duplicate detection is a good v1.1 candidate.
5. **District/school license self-serve purchasing UI** — the `AccessGrant.source =
   SCHOOL_LICENSE` and bulk admin-grant flow exist; a self-serve multi-seat purchase flow is
   not built (admin can grant seats manually today).

## Immediate next steps for a real launch

1. Provision a production Postgres instance and run `prisma migrate deploy`.
2. Create real Stripe Products/Prices matching `Product` rows; set `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`.
3. Connect a real email provider in `lib/email.ts`.
4. Replace demo content with reviewed, production question banks per exam (Art, Music,
   Theatre, Dance) via the CMS/CSV import — do not remove the `isDemo` mechanism, just stop
   using it for production rows.
5. Add a CDN/rate-limiting layer in front of `api/*` routes.
6. Commission a professional accessibility audit against WCAG 2.1 AA before public launch.
