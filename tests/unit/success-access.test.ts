import { beforeEach, expect, it, vi } from 'vitest';
import Success from '@/app/(main)/success/page';
import { buyer } from '../helpers';

const mocks = vi.hoisted(() => ({ user: vi.fn(), retrieve: vi.fn(), items: vi.fn() }));
vi.mock('@/lib/auth', () => ({ getCurrentUser: mocks.user }));
vi.mock('@/lib/stripe', () => ({ stripe: { checkout: { sessions: { retrieve: mocks.retrieve } } } }));
vi.mock('@/lib/stripe-order', () => ({ getPurchasedItems: mocks.items }));
vi.mock('@/components/shared/ClearCart', () => ({ ClearCart: () => null }));
vi.mock('@/components/shared/SuccessPage', () => ({ SuccessPage: () => null }));
vi.mock('next/navigation', () => ({
  notFound: () => { throw new Error('NOT_FOUND'); },
  redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); },
}));
beforeEach(() => { vi.resetAllMocks(); mocks.user.mockResolvedValue(buyer); });

// Test only access-control branches as an async function, not rendering a Server Component.
it('rejects another user’s Stripe session before loading its items', async () => {
  mocks.retrieve.mockResolvedValue({ metadata: { userId: '8' } });
  await expect(Success({ searchParams: Promise.resolve({ session_id: 'cs_other' }) })).rejects.toThrow('NOT_FOUND');
  expect(mocks.items).not.toHaveBeenCalled();
});
it('redirects guests before accessing Stripe', async () => {
  mocks.user.mockResolvedValue(null);
  await expect(Success({ searchParams: Promise.resolve({ session_id: 'cs_other' }) })).rejects.toThrow('REDIRECT:/sign-in');
  expect(mocks.retrieve).not.toHaveBeenCalled();
});
