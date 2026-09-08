import { describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { getAccessStatus, hasActiveAccess } from '@/lib/access';
import { createFixtureUser, deleteFixtureUser } from './helpers';

const DAY = 24 * 60 * 60 * 1000;

describe('getAccessStatus', () => {
  it('reports no access for a user with no grants', async () => {
    const { user } = await createFixtureUser('access-none');
    const status = await getAccessStatus(user.id);
    expect(status.active).toBe(false);
    expect(status.grant).toBeNull();
    await deleteFixtureUser(user.id);
  });

  it('reports active access with days remaining for a live grant', async () => {
    const { user } = await createFixtureUser('access-active');
    await prisma.accessGrant.create({
      data: { userId: user.id, source: 'ADMIN_GRANT', startDate: new Date(), expiresAt: new Date(Date.now() + 10 * DAY) },
    });

    const status = await getAccessStatus(user.id);
    expect(status.active).toBe(true);
    expect(status.daysRemaining).toBeGreaterThanOrEqual(9);
    expect(status.daysRemaining).toBeLessThanOrEqual(10);
    expect(await hasActiveAccess(user.id)).toBe(true);

    await deleteFixtureUser(user.id);
  });

  it('reports inactive access for an expired grant, but still surfaces it', async () => {
    const { user } = await createFixtureUser('access-expired');
    await prisma.accessGrant.create({
      data: { userId: user.id, source: 'ADMIN_GRANT', startDate: new Date(Date.now() - 400 * DAY), expiresAt: new Date(Date.now() - 30 * DAY) },
    });

    const status = await getAccessStatus(user.id);
    expect(status.active).toBe(false);
    expect(status.grant).not.toBeNull();
    expect(await hasActiveAccess(user.id)).toBe(false);

    await deleteFixtureUser(user.id);
  });

  it('flags 30/7/1-day expiration warnings correctly', async () => {
    const { user } = await createFixtureUser('access-warn');
    await prisma.accessGrant.create({
      data: { userId: user.id, source: 'ADMIN_GRANT', startDate: new Date(), expiresAt: new Date(Date.now() + 5 * DAY) },
    });

    const status = await getAccessStatus(user.id);
    expect(status.active).toBe(true);
    expect(status.expiringSoon).toBe(7);

    await deleteFixtureUser(user.id);
  });

  it('ignores a revoked grant even if unexpired', async () => {
    const { user } = await createFixtureUser('access-revoked');
    await prisma.accessGrant.create({
      data: {
        userId: user.id,
        source: 'ADMIN_GRANT',
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 30 * DAY),
        revoked: true,
      },
    });

    const status = await getAccessStatus(user.id);
    expect(status.active).toBe(false);

    await deleteFixtureUser(user.id);
  });

  it('prefers an exam-specific grant match but also accepts all-exam grants', async () => {
    const { user } = await createFixtureUser('access-examscope');
    await prisma.accessGrant.create({
      data: { userId: user.id, source: 'ADMIN_GRANT', examId: null, startDate: new Date(), expiresAt: new Date(Date.now() + 30 * DAY) },
    });

    const status = await getAccessStatus(user.id, 'some-exam-id-that-does-not-exist');
    expect(status.active).toBe(true); // all-exam grant covers any examId

    await deleteFixtureUser(user.id);
  });
});
