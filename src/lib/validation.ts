import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(80),
  lastName: z.string().min(1, 'Last name is required').max(80),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const onboardingSchema = z.object({
  certificationArea: z.string().min(1, 'Select a certification area'),
  targetExamId: z.string().min(1, 'Select the exam you are preparing for'),
  testDate: z.string().optional().nullable(),
  teachingExperience: z.string().optional().nullable(),
  priorAttempts: z.coerce.number().int().min(0).max(10).optional().nullable(),
  confidenceRating: z.coerce.number().int().min(1).max(5),
  goal: z.enum([
    'NEED_TO_PASS',
    'HAVE_NOT_TAKEN_YET',
    'FAILED_PREVIOUSLY',
    'ASSESS_READINESS',
    'STUDYING_WHILE_WORKING',
  ]),
  goalDetails: z.string().max(500).optional().nullable(),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const examSchema = z.object({
  name: z.string().min(1).max(160),
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().max(2000).optional().nullable(),
  published: z.boolean().optional(),
});
export type ExamInput = z.infer<typeof examSchema>;

export const domainSchema = z.object({
  examId: z.string().min(1),
  name: z.string().min(1).max(160),
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional().nullable(),
  weight: z.coerce.number().int().min(1).max(100).default(1),
  order: z.coerce.number().int().min(0).default(0),
  published: z.boolean().optional(),
});
export type DomainInput = z.infer<typeof domainSchema>;

export const objectiveSchema = z.object({
  domainId: z.string().min(1),
  code: z.string().max(40).optional().nullable(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
  published: z.boolean().optional(),
});
export type ObjectiveInput = z.infer<typeof objectiveSchema>;

export const skillSchema = z.object({
  objectiveId: z.string().min(1),
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
  published: z.boolean().optional(),
});
export type SkillInput = z.infer<typeof skillSchema>;

export const lessonSchema = z.object({
  skillId: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  keyConcepts: z.array(z.string()).default([]),
  example: z.string().optional().nullable(),
  videoUrl: z.string().url().optional().nullable().or(z.literal('')),
  published: z.boolean().optional(),
});
export type LessonInput = z.infer<typeof lessonSchema>;

export const questionOptionSchema = z.object({
  label: z.string().min(1).max(4),
  text: z.string().min(1),
  isCorrect: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  matchKey: z.string().optional().nullable(),
  correctOrder: z.number().int().optional().nullable(),
});

export const questionSchema = z
  .object({
    skillId: z.string().min(1),
    topic: z.string().max(200).optional().nullable(),
    type: z.enum([
      'MULTIPLE_CHOICE',
      'MULTIPLE_SELECT',
      'SCENARIO',
      'MATCHING',
      'ORDERING',
      'IMAGE_BASED',
      'SHORT_ANSWER',
    ]),
    difficulty: z.coerce.number().int().min(1).max(5).default(3),
    prompt: z.string().min(1),
    explanation: z.string().min(1, 'An explanation is required for every question'),
    source: z.string().max(300).optional().nullable(),
    tags: z.array(z.string()).default([]),
    imageUrl: z.string().url().optional().nullable().or(z.literal('')),
    audioUrl: z.string().url().optional().nullable().or(z.literal('')),
    shortAnswer: z.string().optional().nullable(),
    options: z.array(questionOptionSchema).default([]),
    published: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'SHORT_ANSWER') return !!data.shortAnswer;
      return data.options.length >= 2 && data.options.some((o) => o.isCorrect);
    },
    { message: 'Provide at least 2 options with at least one correct answer, or a short answer key.' }
  );
export type QuestionInput = z.infer<typeof questionSchema>;

export const csvImportRowSchema = z.object({
  exam: z.string().min(1),
  domain: z.string().min(1),
  objective: z.string().min(1),
  skill: z.string().min(1),
  topic: z.string().optional(),
  difficulty: z.string().optional(),
  question: z.string().min(1),
  option_a: z.string().min(1),
  option_b: z.string().min(1),
  option_c: z.string().optional(),
  option_d: z.string().optional(),
  correct_answer: z.string().min(1),
  explanation: z.string().min(1),
  source: z.string().optional(),
  tags: z.string().optional(),
});
export type CsvImportRow = z.infer<typeof csvImportRowSchema>;
