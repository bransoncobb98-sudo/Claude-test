# TX Arts Pathway — Database Schema

Full source of truth: `prisma/schema.prisma`. This document explains the modeling decisions.

## Content graph (immutable hierarchy, admin-authored)

```
Exam 1—* Domain 1—* Objective 1—* Skill 1—* Lesson (0 or 1 per skill, extensible to many)
                                        └─* Question 1—* QuestionOption
PracticeExam *—1 Exam
```

Every content row has `published: Boolean` (and `isDemo: Boolean` for seed data) so nothing
reaches students until an admin explicitly publishes it. Ordering columns (`order`) drive
sequencing so authors can reorder without renaming.

## Identity & profile

- `User` — auth identity + `role` (`STUDENT` | `ADMIN`). We deliberately do **not** create a
  separate `AdminUser` table (as loosely suggested in the product brief) because that would
  duplicate identity data the `User` row already owns; role-based access is enforced from
  `User.role` plus `lib/access.ts` middleware. This is called out explicitly so the deviation
  from the brief's entity list is traceable.
- `Profile` — 1:1 with `User`. Onboarding answers: certification area, target exam, test
  date, experience, prior attempts, confidence, goal enum.

## Assessment & response graph

`Attempt` is the generic "a user answered N questions in a context" entity, reused across
diagnostics, study-session practice, mastery checks, and practice exams (via a 1:1 link from
`PracticeExamAttempt.attemptId`). Each `Attempt` has many `Response` rows (one per question
answered), which is where per-question correctness, timing, and confidence live. This avoids
duplicating a responses table per attempt type while still letting `DiagnosticAssessment` and
`PracticeExamAttempt` carry type-specific metadata (domain breakdowns, timers, status).

- `DiagnosticAssessment` → `DiagnosticResult` (one row with JSON domain/objective/skill
  breakdowns + computed priorities; JSON is appropriate here because the shape is a
  denormalized report snapshot, not something queried relationally).
- `PracticeExam` (admin-defined template: length, time limit, domain balance) →
  `PracticeExamAttempt` (a user's run of it) → underlying `Attempt`/`Response` rows.

## Mastery, spaced repetition, study plan

- `MasteryRecord` (unique on `userId+skillId`) is the single row the recommendation engine
  reads/writes per user/skill: `masteryScore`, `questionsAttempted/Correct`,
  `correctStreak`/`incorrectStreak`, `trend`, `lastReviewedAt`, `reviewCount`, `nextReviewAt`.
  `nextReviewAt` is computed by `lib/spaced-repetition.ts` and is what "due for review" queries
  filter on.
- `StudyPlan` (1 active per user+exam) → many `StudyPlanItem` (one per skill/domain focus,
  `weekNumber`, `priority`, `status`). Regenerating a plan updates items rather than deleting
  history, so plan-progress-over-time stays queryable.

## Missed questions, bookmarks

- `Mistake` (unique on `userId+questionId`): `timesMissed`, `firstMissedAt`, `lastMissedAt`,
  `hidden`, `favorited`. Populated/incremented whenever a `Response.isCorrect = false` is
  written (see `lib/study-actions.ts`).
- `Bookmark` (unique on `userId+questionId`) — simple favorites independent of mistakes.

## Commerce & access

- `Product` — sellable unit: `durationDays`, `priceCents`, optional `examId` (exam-specific
  access) or null (all-access). This is how 30/90/180/365-day and exam-specific products are
  modeled without code branches.
- `Coupon` — percent or fixed-amount discount, redemption caps, expiration.
- `Purchase` — one row per Stripe Checkout session (`stripeSessionId`,
  `stripePaymentIntentId`, `status`: `PENDING`/`PAID`/`REFUNDED`/`FAILED`).
- `AccessGrant` — the actual entitlement: `startDate`, `expiresAt`, `source`
  (`PURCHASE`/`ADMIN_GRANT`/`PROMO`/`SCHOOL_LICENSE`), optional `productId`/`purchaseId`.
  `lib/access.ts` computes "active" as `expiresAt > now()` at query time rather than storing a
  redundant boolean that could drift.
- `AuditLog` — actor, action, entity type/id, JSON metadata, for admin accountability.

## Why JSON columns appear in a few places

`DiagnosticResult` breakdowns and `PracticeExamAttempt.domainBreakdown` are JSON snapshots of
a point-in-time report (already-aggregated numbers a user is shown once and never edits
field-by-field). Everything that is *queried, filtered, or aggregated over time*
(mastery, responses, study plan items) is a normal relational column instead.

## Indexes

Foreign keys are indexed by default under Prisma/Postgres. Additional explicit indexes:
`Question(skillId, published)`, `Response(attemptId)`, `MasteryRecord(userId, nextReviewAt)`,
`AccessGrant(userId, expiresAt)`, `Mistake(userId, hidden)` — these back the hot dashboard,
study-selection, and access-check queries.
