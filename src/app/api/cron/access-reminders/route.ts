import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

/**
 * Daily access-expiration reminder job (§24/§25). Intended to be invoked by
 * an external scheduler (e.g. Vercel Cron hitting this route once a day) —
 * there is no in-process cron runner in a stateless Next.js deployment, so
 * this is a plain authenticated Route Handler rather than a background
 * worker. Protect it in production by setting CRON_SECRET and requiring it
 * as a bearer token (checked below whenever it's configured).
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const windows: Array<30 | 7 | 1> = [30, 7, 1];
  let sent = 0;

  for (const days of windows) {
    const start = new Date(now.getTime() + (days - 1) * dayMs);
    const end = new Date(now.getTime() + days * dayMs);

    const grants = await prisma.accessGrant.findMany({
      where: { revoked: false, expiresAt: { gte: start, lt: end } },
      include: { user: true },
    });

    for (const grant of grants) {
      await sendEmail(grant.user.email, {
        type: 'ACCESS_EXPIRATION_WARNING',
        firstName: grant.user.firstName,
        daysRemaining: days,
      });
      sent++;
    }
  }

  const expiredToday = await prisma.accessGrant.findMany({
    where: { revoked: false, expiresAt: { gte: new Date(now.getTime() - dayMs), lt: now } },
    include: { user: true },
  });
  for (const grant of expiredToday) {
    await sendEmail(grant.user.email, { type: 'ACCESS_EXPIRED', firstName: grant.user.firstName });
    sent++;
  }

  return NextResponse.json({ sent });
}
