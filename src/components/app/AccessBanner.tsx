import Link from 'next/link';
import type { AccessStatus } from '@/lib/access';

export function AccessBanner({ status }: { status: AccessStatus }) {
  if (!status.active) {
    return (
      <div className="bg-red-600 px-4 py-2.5 text-center text-sm text-white">
        Your TX Arts Pathway access has expired.{' '}
        <Link href="/account" className="font-semibold underline">
          Renew Access
        </Link>
      </div>
    );
  }

  if (!status.expiringSoon) return null;

  const message =
    status.expiringSoon === 1
      ? 'Your access expires tomorrow.'
      : `Your access expires in ${status.daysRemaining} days.`;

  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
      {message}{' '}
      <Link href="/account" className="font-semibold underline">
        Renew now
      </Link>
    </div>
  );
}
