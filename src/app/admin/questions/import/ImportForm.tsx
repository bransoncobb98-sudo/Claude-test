'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { runCsvImport } from './actions';
import type { ImportSummary } from '@/lib/csv-import';

const initialState: ImportSummary = { validCount: 0, invalidCount: 0, duplicateCount: 0, results: [] };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Importing…' : 'Import Questions'}
    </Button>
  );
}

export function ImportForm() {
  const [state, formAction] = useFormState(runCsvImport, initialState);

  return (
    <div>
      <form action={formAction} className="space-y-4">
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-navy-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
        />
        <SubmitButton />
      </form>

      {state.results.length > 0 && (
        <div className="mt-6">
          <div className="flex gap-3">
            <Badge variant="success">{state.validCount} imported</Badge>
            <Badge variant="danger">{state.invalidCount} invalid</Badge>
            <Badge variant="warning">{state.duplicateCount} duplicates skipped</Badge>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Imported questions are saved as unpublished drafts for review — none are visible to students yet.
          </p>
          <ul className="mt-4 max-h-96 space-y-1 overflow-y-auto text-sm">
            {state.results.map((r, i) => (
              <li
                key={i}
                className={
                  r.status === 'imported' ? 'text-emerald-700' : r.status === 'duplicate' ? 'text-amber-700' : 'text-red-600'
                }
              >
                Row {r.rowNumber}: {r.status}
                {r.message ? ` — ${r.message}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
