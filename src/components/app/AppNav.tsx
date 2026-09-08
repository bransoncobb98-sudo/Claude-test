import Link from 'next/link';
import { SignOutButton } from './SignOutButton';
import { BRAND_NAME } from '@/lib/constants';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/study-plan', label: 'Study Plan' },
  { href: '/practice-exams', label: 'Practice Exams' },
  { href: '/mistakes', label: 'Your Mistakes' },
  { href: '/account', label: 'Account' },
];

export function AppNav({ firstName, role }: { firstName: string; role: 'STUDENT' | 'ADMIN' }) {
  return (
    <header className="border-b border-brand-navy-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-serif text-base font-semibold text-brand-navy-900">
          <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy-800 text-xs font-bold text-brand-gold-300">
            TX
          </span>
          {BRAND_NAME}
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-5 text-sm font-medium text-brand-navy-700 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand-navy-900">
              {l.label}
            </Link>
          ))}
          {role === 'ADMIN' && (
            <Link href="/admin" className="text-brand-terracotta-600 hover:text-brand-terracotta-700">
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline">Hi, {firstName}</span>
          <SignOutButton />
        </div>
      </div>
      <nav aria-label="Primary (mobile)" className="flex gap-4 overflow-x-auto border-t border-brand-navy-50 px-4 py-2 text-xs font-medium text-brand-navy-700 md:hidden">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-brand-navy-900">
            {l.label}
          </Link>
        ))}
        {role === 'ADMIN' && (
          <Link href="/admin" className="whitespace-nowrap text-brand-terracotta-600">
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
}
