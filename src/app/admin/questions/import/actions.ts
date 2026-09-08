'use server';

import { requireAdmin } from '@/lib/session';
import { importQuestionsFromCsv, ImportSummary } from '@/lib/csv-import';

export async function runCsvImport(_prevState: ImportSummary | null, formData: FormData): Promise<ImportSummary> {
  const admin = await requireAdmin();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { validCount: 0, invalidCount: 0, duplicateCount: 0, results: [{ rowNumber: 0, status: 'invalid', message: 'No file uploaded.' }] };
  }
  const text = await file.text();
  return importQuestionsFromCsv(text, admin.id);
}
