import { prisma } from '@/lib/prisma';
import { csvImportRowSchema } from '@/lib/validation';

/** Minimal RFC4180-ish CSV parser: handles quoted fields, escaped quotes, and commas within quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((f) => f.length > 0)) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export interface ImportRowResult {
  rowNumber: number;
  status: 'imported' | 'invalid' | 'duplicate';
  message?: string;
}

export interface ImportSummary {
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  results: ImportRowResult[];
}

export async function importQuestionsFromCsv(csvText: string, adminUserId: string): Promise<ImportSummary> {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return { validCount: 0, invalidCount: 0, duplicateCount: 0, results: [] };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const dataRows = rows.slice(1);

  const results: ImportRowResult[] = [];
  let validCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const rowNumber = i + 2; // account for header row, 1-indexed
    const raw: Record<string, string> = {};
    header.forEach((key, idx) => {
      raw[key] = dataRows[i][idx] ?? '';
    });

    const parsed = csvImportRowSchema.safeParse(raw);
    if (!parsed.success) {
      results.push({ rowNumber, status: 'invalid', message: parsed.error.issues[0].message });
      invalidCount++;
      continue;
    }
    const data = parsed.data;

    const skill = await prisma.skill.findFirst({
      where: {
        name: { equals: data.skill, mode: 'insensitive' },
        objective: {
          name: { equals: data.objective, mode: 'insensitive' },
          domain: {
            name: { equals: data.domain, mode: 'insensitive' },
            exam: { name: { equals: data.exam, mode: 'insensitive' } },
          },
        },
      },
    });

    if (!skill) {
      results.push({
        rowNumber,
        status: 'invalid',
        message: `Could not find Exam/Domain/Objective/Skill path: "${data.exam} > ${data.domain} > ${data.objective} > ${data.skill}". Create this hierarchy in the CMS first.`,
      });
      invalidCount++;
      continue;
    }

    const existing = await prisma.question.findFirst({
      where: { skillId: skill.id, prompt: { equals: data.question.trim() } },
    });
    if (existing) {
      results.push({ rowNumber, status: 'duplicate', message: 'An identical question already exists for this skill.' });
      duplicateCount++;
      continue;
    }

    const optionEntries: { label: string; text: string }[] = [
      { label: 'A', text: data.option_a },
      { label: 'B', text: data.option_b },
      ...(data.option_c ? [{ label: 'C', text: data.option_c }] : []),
      ...(data.option_d ? [{ label: 'D', text: data.option_d }] : []),
    ];
    const correctLabel = data.correct_answer.trim().toUpperCase();
    if (!optionEntries.some((o) => o.label === correctLabel)) {
      results.push({ rowNumber, status: 'invalid', message: `correct_answer "${data.correct_answer}" does not match any option label (A-D).` });
      invalidCount++;
      continue;
    }

    await prisma.question.create({
      data: {
        skillId: skill.id,
        topic: data.topic || null,
        type: 'MULTIPLE_CHOICE',
        difficulty: data.difficulty ? Math.min(5, Math.max(1, parseInt(data.difficulty, 10) || 3)) : 3,
        prompt: data.question.trim(),
        explanation: data.explanation.trim(),
        source: data.source || null,
        tags: data.tags ? data.tags.split(';').map((t) => t.trim()).filter(Boolean) : [],
        published: false, // imported questions always require manual admin review before publishing
        isDemo: false,
        reviewStatus: 'DRAFT',
        createdById: adminUserId,
        options: {
          create: optionEntries.map((o, idx) => ({
            label: o.label,
            text: o.text,
            isCorrect: o.label === correctLabel,
            order: idx,
          })),
        },
      },
    });

    results.push({ rowNumber, status: 'imported' });
    validCount++;
  }

  return { validCount, invalidCount, duplicateCount, results };
}
