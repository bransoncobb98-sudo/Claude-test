'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/session';
import {
  examSchema,
  domainSchema,
  objectiveSchema,
  skillSchema,
  lessonSchema,
  questionSchema,
} from '@/lib/validation';

function fail(message: string): never {
  throw new Error(message);
}

export async function createExam(formData: FormData) {
  await requireAdmin();
  const parsed = examSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || null,
    published: formData.get('published') === 'on',
  });
  if (!parsed.success) fail(parsed.error.issues[0].message);

  const exam = await prisma.exam.create({ data: { ...parsed.data, isDemo: false } });
  revalidatePath('/admin/exams');
  redirect(`/admin/exams/${exam.id}`);
}

export async function updateExam(examId: string, formData: FormData) {
  await requireAdmin();
  const parsed = examSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || null,
    published: formData.get('published') === 'on',
  });
  if (!parsed.success) fail(parsed.error.issues[0].message);
  await prisma.exam.update({ where: { id: examId }, data: parsed.data });
  revalidatePath(`/admin/exams/${examId}`);
}

export async function createDomain(formData: FormData) {
  await requireAdmin();
  const examId = formData.get('examId')?.toString() ?? fail('examId required');
  const parsed = domainSchema.safeParse({
    examId,
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || null,
    weight: formData.get('weight') || 1,
    order: formData.get('order') || 0,
    published: formData.get('published') === 'on',
  });
  if (!parsed.success) fail(parsed.error.issues[0].message);
  await prisma.domain.create({ data: parsed.data });
  revalidatePath(`/admin/exams/${examId}`);
}

export async function updateDomain(domainId: string, examId: string, formData: FormData) {
  await requireAdmin();
  const parsed = domainSchema.safeParse({
    examId,
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || null,
    weight: formData.get('weight') || 1,
    order: formData.get('order') || 0,
    published: formData.get('published') === 'on',
  });
  if (!parsed.success) fail(parsed.error.issues[0].message);
  await prisma.domain.update({ where: { id: domainId }, data: parsed.data });
  revalidatePath(`/admin/domains/${domainId}`);
}

export async function createObjective(formData: FormData) {
  await requireAdmin();
  const domainId = formData.get('domainId')?.toString() ?? fail('domainId required');
  const parsed = objectiveSchema.safeParse({
    domainId,
    code: formData.get('code') || null,
    name: formData.get('name'),
    description: formData.get('description') || null,
    order: formData.get('order') || 0,
    published: formData.get('published') === 'on',
  });
  if (!parsed.success) fail(parsed.error.issues[0].message);
  await prisma.objective.create({ data: parsed.data });
  revalidatePath(`/admin/domains/${domainId}`);
}

export async function updateObjective(objectiveId: string, domainId: string, formData: FormData) {
  await requireAdmin();
  const parsed = objectiveSchema.safeParse({
    domainId,
    code: formData.get('code') || null,
    name: formData.get('name'),
    description: formData.get('description') || null,
    order: formData.get('order') || 0,
    published: formData.get('published') === 'on',
  });
  if (!parsed.success) fail(parsed.error.issues[0].message);
  await prisma.objective.update({ where: { id: objectiveId }, data: parsed.data });
  revalidatePath(`/admin/objectives/${objectiveId}`);
}

export async function createSkill(formData: FormData) {
  await requireAdmin();
  const objectiveId = formData.get('objectiveId')?.toString() ?? fail('objectiveId required');
  const parsed = skillSchema.safeParse({
    objectiveId,
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || null,
    order: formData.get('order') || 0,
    published: formData.get('published') === 'on',
  });
  if (!parsed.success) fail(parsed.error.issues[0].message);
  await prisma.skill.create({ data: parsed.data });
  revalidatePath(`/admin/objectives/${objectiveId}`);
}

export async function updateSkill(skillId: string, objectiveId: string, formData: FormData) {
  await requireAdmin();
  const parsed = skillSchema.safeParse({
    objectiveId,
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || null,
    order: formData.get('order') || 0,
    published: formData.get('published') === 'on',
  });
  if (!parsed.success) fail(parsed.error.issues[0].message);
  await prisma.skill.update({ where: { id: skillId }, data: parsed.data });
  revalidatePath(`/admin/skills/${skillId}`);
}

export async function createLesson(formData: FormData) {
  await requireAdmin();
  const skillId = formData.get('skillId')?.toString() ?? fail('skillId required');
  const parsed = lessonSchema.safeParse({
    skillId,
    title: formData.get('title'),
    content: formData.get('content'),
    keyConcepts: (formData.get('keyConcepts')?.toString() ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    example: formData.get('example') || null,
    videoUrl: formData.get('videoUrl') || null,
    published: formData.get('published') === 'on',
  });
  if (!parsed.success) fail(parsed.error.issues[0].message);
  await prisma.lesson.create({ data: { ...parsed.data, videoUrl: parsed.data.videoUrl || null, isDemo: false } });
  revalidatePath(`/admin/skills/${skillId}`);
}

export async function createQuestion(formData: FormData) {
  const admin = await requireAdmin();
  const skillId = formData.get('skillId')?.toString() ?? fail('skillId required');

  const optionLabels = ['A', 'B', 'C', 'D', 'E'];
  const options = optionLabels
    .map((label, i) => ({
      label,
      text: formData.get(`option_${label}`)?.toString() ?? '',
      isCorrect: formData.get('correctOption') === label,
      order: i,
    }))
    .filter((o) => o.text.trim().length > 0);

  const parsed = questionSchema.safeParse({
    skillId,
    topic: formData.get('topic') || null,
    type: formData.get('type') ?? 'MULTIPLE_CHOICE',
    difficulty: formData.get('difficulty') || 3,
    prompt: formData.get('prompt'),
    explanation: formData.get('explanation'),
    source: formData.get('source') || null,
    tags: (formData.get('tags')?.toString() ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    imageUrl: formData.get('imageUrl') || null,
    options,
    published: formData.get('published') === 'on',
  });
  if (!parsed.success) fail(parsed.error.issues[0].message);

  await prisma.question.create({
    data: {
      skillId: parsed.data.skillId,
      topic: parsed.data.topic,
      type: parsed.data.type,
      difficulty: parsed.data.difficulty,
      prompt: parsed.data.prompt,
      explanation: parsed.data.explanation,
      source: parsed.data.source,
      tags: parsed.data.tags,
      imageUrl: parsed.data.imageUrl || null,
      published: parsed.data.published ?? false,
      isDemo: false,
      reviewStatus: 'APPROVED',
      createdById: admin.id,
      options: { create: parsed.data.options },
    },
  });
  revalidatePath(`/admin/skills/${skillId}`);
  redirect(`/admin/skills/${skillId}`);
}

export async function togglePublish(entity: 'exam' | 'domain' | 'objective' | 'skill' | 'lesson' | 'question', id: string, path: string) {
  await requireAdmin();
  const model = (prisma as any)[entity];
  const current = await model.findUniqueOrThrow({ where: { id } });
  await model.update({ where: { id }, data: { published: !current.published } });
  revalidatePath(path);
}
