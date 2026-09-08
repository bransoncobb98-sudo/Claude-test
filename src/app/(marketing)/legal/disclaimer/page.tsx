import { AFFILIATION_DISCLAIMER, READINESS_DISCLAIMER, TEXES_QUESTION_DISCLAIMER } from '@/lib/constants';

export const metadata = { title: 'Disclaimer' };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-brand-navy-900">Disclaimer</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>{AFFILIATION_DISCLAIMER}</p>
        <p>
          TExES® is a registered trademark of the Texas Education Agency (TEA) and Pearson
          Education, Inc. (administered by ETS on behalf of TEA). References to TExES on this
          site are for identification purposes only.
        </p>
        <p>{TEXES_QUESTION_DISCLAIMER}</p>
        <p>{READINESS_DISCLAIMER}</p>
        <p>
          No content on this platform should be understood as a guarantee of passing any
          official certification examination.
        </p>
      </div>
    </div>
  );
}
