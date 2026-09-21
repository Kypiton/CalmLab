import { beforeEach, expect, it, vi } from 'vitest';
import '@/app/api/uploadthing/core';
import { buyer } from '../helpers';

const mocks = vi.hoisted(() => ({ user: vi.fn(), guard: undefined as undefined | (() => Promise<{ userId: number }>) }));
vi.mock('@/lib/auth', () => ({ getCurrentUser: mocks.user }));
vi.mock('uploadthing/server', () => ({ UploadThingError: Error }));
vi.mock('uploadthing/next', () => ({ createUploadthing: () => () => ({
  middleware(guard: () => Promise<{ userId: number }>) {
    mocks.guard = guard;
    return { onUploadComplete: vi.fn() };
  },
}) }));
beforeEach(() => { mocks.user.mockReset(); });
it('denies anonymous uploads', async () => {
  mocks.user.mockResolvedValue(null);
  await expect(mocks.guard!()).rejects.toThrow('Unauthorized');
});
it('attaches the authenticated user ID to the upload', async () => {
  mocks.user.mockResolvedValue(buyer);
  await expect(mocks.guard!()).resolves.toEqual({ userId: 7 });
});
