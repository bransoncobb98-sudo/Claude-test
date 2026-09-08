import Link from 'next/link';
import { SignOutButton } from '@/components/app/SignOutButton';
import { BRAND_NAME } from '@/lib/constants';

const LINKS = [
  { href: '/admin', label: 'Analytics' },
  { href: '/admin/exams', label: 'Exams' },
  { href: '/admin/questions', label: 'Questions' },
  { href: '/admin/questions/import', label: 'Import CSV' },
  { href: '/admin/users', label: 'Users' },
];

export function AdminNav() {
  return (
    <header className="border-b border-brand-navy-100 bg-brand-navy-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/admin" className="flex items-center gap-2 font-serif text-base font-semibold">
          <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gold-300 text-xs font-bold text-brand-navy-900">
            TX
          </span>
          {BRAND_NAME} Admin
        </Link>
        <nav aria-label="Admin" className="hidden items-center gap-5 text-sm font-medium text-brand-navy-100 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          ))}
          <Link href="/dashboard" className="hover:text-white">
            Student View
          </Link>
        </nav>
        <SignOutButton />
      </div>
      <nav aria-label="Admin (mobile)" className="flex gap-4 overflow-x-auto border-t border-white/10 px-4 py-2 text-xs font-medium text-brand-navy-100 md:hidden">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-white">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
