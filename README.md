# TX Arts Pathway

Your Pathway to Passing the Texas Fine Arts TExES Exams.

TX Arts Pathway is a diagnostic-driven exam-prep platform for Texas fine arts educators
preparing for TExES certification exams (Art, Music, Theatre, Dance, and future tracks).
See `docs/` for full architecture, product requirements, database schema, content model,
and roadmap documentation.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL · Prisma · Auth.js
(Credentials/JWT) · Stripe · Vitest

## Local development setup

### 1. Prerequisites

- Node.js 20+
- A running PostgreSQL 16 instance

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env` (see the table below). At minimum, set `DATABASE_URL` and `NEXTAUTH_SECRET`
to get the app running; Stripe and email are optional in development (see "Payments in
dev mode" below).

### 4. Set up the database

```bash
npx prisma migrate dev   # creates tables
npm run db:seed          # loads demo Theatre exam content + demo accounts
```

### 5. Run the app

```bash
npm run dev
```

Visit http://localhost:3000. Demo accounts created by the seed script:

- **Admin:** `admin@txartspathway.com` / `DemoAdmin!2026`
- **Student:** `demo.teacher@txartspathway.com` / `DemoStudent!2026`

### 6. Run tests

```bash
npm run test
```

The test suite talks to the same PostgreSQL database configured in `.env` — it creates
and tears down its own isolated fixture data (unique exam/user rows per test), so it's
safe to run against your dev database.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | Base URL of the app (`http://localhost:3000` in dev) |
| `NEXTAUTH_SECRET` | Yes | Random secret used to sign session JWTs |
| `STRIPE_SECRET_KEY` | No | Enables real Stripe Checkout; omit for dev-mode fallback (see below) |
| `STRIPE_PUBLISHABLE_KEY` | No | Not currently used server-side; reserved for a future client Stripe.js integration |
| `STRIPE_WEBHOOK_SECRET` | No | Required only if `STRIPE_SECRET_KEY` is set, to verify webhook signatures |
| `EMAIL_PROVIDER_API_KEY` | No | Reserved for a future transactional email provider (see `lib/email.ts`) |
| `EMAIL_FROM` | No | From-address for transactional email once a provider is wired up |
| `NEXT_PUBLIC_APP_URL` | Yes | Absolute base URL used in Stripe redirect URLs |

## Payments in dev mode

Without `STRIPE_SECRET_KEY` set, `/api/checkout` records the purchase as paid and grants
access immediately (no real charge — no card data ever passes through this app either
way). The Account page shows a "Demo mode" notice whenever this fallback is active. Set
real Stripe **test-mode** keys and `STRIPE_WEBHOOK_SECRET` (from `stripe listen` or your
Stripe dashboard) to exercise the real Checkout + webhook flow.

## Deployment

1. Provision a production PostgreSQL database (Neon, RDS, Supabase, etc.).
2. Set all environment variables above in your hosting provider (Vercel is the reference
   target; any Node.js host that supports Next.js works).
3. Run `npx prisma migrate deploy` against the production database.
4. Optionally run `npm run db:seed` once to load the demo Theatre content, or skip it and
   build production content from scratch via the Admin CMS.
5. Configure a Stripe webhook endpoint pointing at `/api/stripe/webhook` for the
   `checkout.session.completed`, `charge.refunded`, and `checkout.session.expired` events.
6. Deploy (`npm run build && npm run start`, or push to your Vercel-connected repo).

See `docs/development-roadmap.md` for what's deliberately deferred (real email delivery,
AI features, rate limiting) and what to do before a public launch.

## Documentation index

- `docs/architecture.md` — stack decisions and module map
- `docs/product-requirements.md` — feature-by-feature requirements and definitions of done
- `docs/database-schema.md` — data model rationale
- `docs/content-model.md` — exam content hierarchy and authoring path
- `docs/development-roadmap.md` — phase status and what's deferred
- `docs/progress.md` — granular build checklist
