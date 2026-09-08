# TX Arts Pathway — Content Model & Authoring Guide

## Hierarchy

```
Exam            "TExES Theatre (180)"
 └─ Domain      "Stagecraft"                (weighted % of exam)
     └─ Objective   "The teacher understands lighting and sound design"
         └─ Skill        "Lighting Instruments"
             ├─ Lesson (0/1+)    Learn content: explanation, key concepts, example(s)
             └─ Question (many)  Original, TExES-aligned practice items
```

## Authoring path (no code required)

1. Admin → Exams → **New Exam** (name, slug, description) → Save as unpublished.
2. Open exam → **Add Domain** (name, weight/order).
3. Open domain → **Add Objective** (code, name, description).
4. Open objective → **Add Skill** (name, description).
5. Open skill → **Add Lesson** (title, key concepts, example, optional media links).
6. Open skill → **Add Question** (prompt, type, options, correct answer(s), explanation,
   difficulty, tags, source) — rich text supported on prompt/explanation.
7. Toggle **Publish** at each level once content is reviewed. Unpublished rows never appear
   to students, including in diagnostics, study sessions, or practice exams.

CSV import (Admin → Questions → Import) accepts the column set from §22 of the product brief
and always imports as unpublished for review.

## Question types supported today

`MULTIPLE_CHOICE`, `MULTIPLE_SELECT`, `SCENARIO`, `MATCHING`, `ORDERING`, `IMAGE_BASED`,
`SHORT_ANSWER`. The `QuestionType` enum and generic `QuestionOption` (with optional
`matchKey`/`correctOrder`) are designed so a new type (e.g. audio-based) is a new enum value
plus renderer component — not a schema migration.

## IP compliance rules baked into the content model

- Every `Question` has a required `explanation` field — the UI will not render a question
  without one, enforcing the "never just say Correct" rule (§12).
- Every `Question` has an `isDemo` flag; the seed script sets this `true` for all sample
  content, and the UI surfaces a "DEMO CONTENT" badge on any demo-flagged item, both in admin
  list views and (subtly) on the student-facing question footer.
- `Question.reviewStatus` (`DRAFT`/`APPROVED`) plus `aiGenerated: Boolean` exist so a future
  AI question generator (§34) can write rows that are clearly flagged and excluded from
  diagnostics/practice until an admin approves them.
- Static copy in `lib/constants.ts` (`TEXES_DISCLAIMER`, `READINESS_DISCLAIMER`) is imported
  everywhere a question, score, or readiness figure is displayed, so the disclaimer wording
  can't drift between pages.

## Demo/seed content (§50)

Seeded via `prisma/seed.ts`: one exam ("TExES Theatre EC-12 (180) — Demo"), 3 domains, 2
objectives per domain, 2 skills per objective (12 skills total), 1 lesson per skill, and 5
original practice questions per skill (60 questions total). This is intentionally smaller than
the illustrative 3–5/3/3 shape in the brief so the sample content can be genuinely
hand-authored and reviewed rather than templated filler — the architecture supports scaling
to the full shape (or additional exams: Art, Music, Dance) purely through more seed/admin
data, with no code changes. All seeded rows carry `isDemo: true` and unpublished lessons/
questions are published only where needed to demonstrate the student experience end-to-end.
