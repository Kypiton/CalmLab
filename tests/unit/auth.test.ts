import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurrentUser } from '@/lib/auth';
import { buyer } from '../helpers';

const mocks = vi.hoisted(() => ({ cookie: vi.fn(), verify: vi.fn(), findUser: vi.fn() }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: mocks.cookie }) }));
vi.mock('@/lib/jwt', () => ({ verifyJWT: mocks.verify }));
vi.mock('@/lib/prisma', () => ({ default: { user: { findUnique: mocks.findUser } } }));
beforeEach(() => { vi.resetAllMocks(); });

describe('getCurrentUser', () => {
  it('does not query the database without an auth cookie', async () => {
    expect(await getCurrentUser()).toBeNull();
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.findUser).not.toHaveBeenCalled();
  });
  it.each([null, { userId: '7' }, {}])('rejects invalid identity %j', async payload => {
    mocks.cookie.mockReturnValue({ value: 'token' });
    mocks.verify.mockResolvedValue(payload);
    expect(await getCurrentUser()).toBeNull();
    expect(mocks.findUser).not.toHaveBeenCalled();
  });
  it('looks up the identity from a valid token', async () => {
    mocks.cookie.mockReturnValue({ value: 'token' });
    mocks.verify.mockResolvedValue({ userId: 7 });
    mocks.findUser.mockResolvedValue(buyer);
    expect(await getCurrentUser()).toEqual(buyer);
    expect(mocks.cookie).toHaveBeenCalledWith('Auth-token');
    expect(mocks.findUser).toHaveBeenCalledWith({ where: { id: 7 } });
  });
  it('returns null if the account no longer exists', async () => {
    mocks.cookie.mockReturnValue({ value: 'token' });
    mocks.verify.mockResolvedValue({ userId: 7 });
    mocks.findUser.mockResolvedValue(null);
    expect(await getCurrentUser()).toBeNull();
  });
});
