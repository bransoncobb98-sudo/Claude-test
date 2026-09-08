import Link from 'next/link';
import { AFFILIATION_DISCLAIMER, BRAND_NAME } from '@/lib/constants';

export function MarketingFooter() {
  return (
    <footer className="border-t border-brand-navy-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-serif text-base font-semibold text-brand-navy-900">{BRAND_NAME}</p>
            <p className="mt-2 text-sm text-slate-600">
              Diagnostic-driven TExES fine arts exam preparation for Texas educators.
            </p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-brand-navy-900">Product</p>
            <ul className="mt-2 space-y-1 text-slate-600">
              <li><Link href="/#how-it-works" className="hover:text-brand-navy-800">How It Works</Link></li>
              <li><Link href="/#pricing" className="hover:text-brand-navy-800">Pricing</Link></li>
              <li><Link href="/register" className="hover:text-brand-navy-800">Get Started</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-medium text-brand-navy-900">Legal</p>
            <ul className="mt-2 space-y-1 text-slate-600">
              <li><Link href="/legal/disclaimer" className="hover:text-brand-navy-800">Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-brand-navy-50 pt-6 text-xs leading-relaxed text-slate-500">
          {AFFILIATION_DISCLAIMER} TExES® is a registered trademark of the Texas Education Agency and
          Pearson Education, Inc., neither of which sponsors or endorses this product. &copy;{' '}
          {new Date().getFullYear()} {BRAND_NAME}.
        </p>
      </div>
    </footer>
  );
}
