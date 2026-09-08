import { Card, CardContent } from '@/components/ui/Card';
import { ImportForm } from './ImportForm';

export default function ImportQuestionsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">Import Questions from CSV</h1>
      <p className="mt-2 text-sm text-slate-600">
        Columns: <code>exam, domain, objective, skill, topic, difficulty, question, option_a,
        option_b, option_c, option_d, correct_answer, explanation, source, tags</code>. The
        Exam/Domain/Objective/Skill path must already exist in the CMS. Tags are semicolon-separated.
        Every imported question is saved as an unpublished draft for admin review.
      </p>
      <Card className="mt-6">
        <CardContent className="p-6">
          <ImportForm />
        </CardContent>
      </Card>
    </div>
  );
}
