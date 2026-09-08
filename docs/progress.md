# TX Arts Pathway — Progress Checklist

_Last updated: initial build session._

## Phase 1 — Architecture & docs
- [x] architecture.md
- [x] product-requirements.md
- [x] database-schema.md
- [x] content-model.md
- [x] development-roadmap.md
- [x] progress.md (this file)

## Phase 2 — Foundation
- [ ] Next.js 14 + TS + Tailwind scaffold
- [ ] Prisma schema (full data model) + migration
- [ ] Auth.js credentials auth, bcrypt hashing, role sessions
- [ ] Design system primitives (Button, Card, Badge, ProgressBar, Input, Nav)
- [ ] App shell + responsive nav (public / student / admin)
- [ ] App builds and runs locally

## Phase 3 — Exam content system
- [ ] Exam/Domain/Objective/Skill/Lesson/Question CRUD (admin)
- [ ] CSV question import with validation
- [ ] Seed script: demo Theatre exam content

## Phase 4 — Diagnostic engine
- [ ] Diagnostic start/question selection
- [ ] Scoring + domain/objective/skill breakdown
- [ ] Priority ranking + study plan generation

## Phase 5 — Study engine
- [ ] Study session flow (learn/example/check/practice/review/mastery check)
- [ ] Mastery scoring + spaced repetition scheduling
- [ ] Missed-question ("Your Mistakes") system
- [ ] Dashboard wired to real data

## Phase 6 — Practice exams
- [ ] Practice exam simulator (timed/untimed, flagging, nav)
- [ ] Results + recommendation update

## Phase 7 — Payments
- [ ] Stripe checkout session route
- [ ] Stripe webhook (purchase + access grant)
- [ ] Access expiration banners + renew gate
- [ ] Admin manual access grants + coupons

## Phase 8-9 — Polish
- [ ] Landing page (all sections)
- [ ] Admin analytics dashboard
- [ ] Empty/error states
- [ ] Accessibility pass

## Phase 10 — Tests & finalize
- [ ] Vitest suite (auth, scoring, mastery, selection, access, permissions)
- [ ] Final docs pass
- [ ] Commit, push, open draft PR

_(This file is updated as each phase completes; see commit history for detail.)_
