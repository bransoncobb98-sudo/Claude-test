import { describe, expect, it, afterAll } from 'vitest';
import { verifyCredentials } from '@/lib/auth';
import { createFixtureUser, deleteFixtureUser } from './helpers';

const cleanup: string[] = [];

afterAll(async () => {
  for (const id of cleanup) await deleteFixtureUser(id).catch(() => {});
});

describe('verifyCredentials', () => {
  it('returns the user for correct credentials', async () => {
    const { user, password } = await createFixtureUser('auth-ok');
    cleanup.push(user.id);

    const result = await verifyCredentials(user.email, password);
    expect(result?.id).toBe(user.id);
    expect(result?.role).toBe('STUDENT');
  });

  it('returns null for the wrong password', async () => {
    const { user } = await createFixtureUser('auth-badpw');
    cleanup.push(user.id);

    const result = await verifyCredentials(user.email, 'not-the-password');
    expect(result).toBeNull();
  });

  it('returns null for an unknown email', async () => {
    const result = await verifyCredentials('nobody-at-all@example.com', 'whatever');
    expect(result).toBeNull();
  });

  it('is case-insensitive on email', async () => {
    const { user, password } = await createFixtureUser('auth-case');
    cleanup.push(user.id);

    const result = await verifyCredentials(user.email.toUpperCase(), password);
    expect(result?.id).toBe(user.id);
  });

  it('rejects a suspended user even with the correct password', async () => {
    const { user, password } = await createFixtureUser('auth-suspended', { suspended: true });
    cleanup.push(user.id);

    const result = await verifyCredentials(user.email, password);
    expect(result).toBeNull();
  });
});
