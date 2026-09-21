import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignJWT } from 'jose';
import { createJWT, verifyJWT } from '@/lib/jwt';

const secret = 'unit-test-secret-at-least-32-characters-long';
beforeEach(() => { vi.stubEnv('JWT_SECRET', secret); });

describe('JWT authentication', () => {
  it('issues a signed token for the user with a seven-day expiry', async () => {
    const payload = await verifyJWT(await createJWT(7));
    expect(payload).toMatchObject({ userId: 7, sub: '7', iss: 'CalmLab' });
    expect(payload!.exp! - payload!.iat!).toBe(7 * 24 * 60 * 60);
  });
  it('rejects malformed tokens', async () => {
    expect(await verifyJWT('invalid')).toBeNull();
  });
  it('rejects tokens signed with another secret', async () => {
    const token = await createJWT(7);
    vi.stubEnv('JWT_SECRET', 'different-test-secret-at-least-32-characters');
    expect(await verifyJWT(token)).toBeNull();
  });
  it('rejects expired tokens', async () => {
    const token = await new SignJWT({ userId: 7 }).setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(new TextEncoder().encode(secret));
    expect(await verifyJWT(token)).toBeNull();
  });
});
