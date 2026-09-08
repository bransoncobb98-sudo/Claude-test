import Link from 'next/link';
import { getCurrentSession } from '@/lib/session';
import { ButtonLink } from '@/components/ui/Button';
import { BRAND_NAME } from '@/lib/constants';

export async function MarketingHeader() {
  const session = await getCurrentSession();

  return (
    <header className="border-b border-brand-navy-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg font-semibold text-brand-navy-900">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy-800 text-sm font-bold text-brand-gold-300"
          >
            TX
          </span>
          {BRAND_NAME}
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm font-medium text-brand-navy-700 md:flex">
          <Link href="/#how-it-works" className="hover:text-brand-navy-900">How It Works</Link>
          <Link href="/#exams" className="hover:text-brand-navy-900">Exam Areas</Link>
          <Link href="/#pricing" className="hover:text-brand-navy-900">Pricing</Link>
          <Link href="/#faq" className="hover:text-brand-navy-900">FAQ</Link>
        </nav>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <ButtonLink href={session.user.role === 'ADMIN' ? '/admin' : '/dashboard'} size="sm">
              Go to Dashboard
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/sign-in" variant="ghost" size="sm">
                Sign In
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                Find My Study Path
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
