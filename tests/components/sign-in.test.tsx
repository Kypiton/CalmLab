// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SignInPage } from '@/components/shared/SignInPage';

const mocks = vi.hoisted(() => ({ push: vi.fn(), error: vi.fn(), success: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('sonner', () => ({ toast: { error: mocks.error, success: mocks.success } }));
vi.mock('@/components/shared', () => ({ AuthHeader: () => null, AuthFooter: () => null }));
beforeEach(() => { vi.clearAllMocks(); });
afterEach(cleanup);

async function fillCredentials() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email'), 'buyer@example.com');
  await user.type(screen.getByLabelText('Password'), 'secret');
  return user;
}

describe('sign-in form', () => {
  it('shows field errors for an empty submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: 'Missing fields.' }, { status: 400 })));
    const user = userEvent.setup();
    render(<SignInPage />);
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(screen.getByText('Missing email')).toBeInTheDocument();
    expect(screen.getByText('Missing password')).toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalled();
  });
  it('shows the server error and allows another attempt', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: 'Passwords do not match.' }, { status: 401 })));
    render(<SignInPage />);
    const user = await fillCredentials();
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('Passwords do not match.'));
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled();
    expect(mocks.push).not.toHaveBeenCalled();
  });
  it('submits credentials, disables the button while waiting, and navigates after success', async () => {
    let finish!: (response: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>(resolve => { finish = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    render(<SignInPage />);
    const user = await fillCredentials();
    const button = screen.getByRole('button', { name: 'Sign In' });
    await user.click(button);
    expect(button).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST', body: JSON.stringify({ email: 'buyer@example.com', password: 'secret', remember: false }),
    }));
    await act(async () => { finish(Response.json({ message: 'You logged in successfully!' })); });
    expect(mocks.success).toHaveBeenCalledWith('You logged in successfully!');
    expect(mocks.push).toHaveBeenCalledWith('/');
    expect(button).toBeEnabled();
  });
  it('shows network failures without navigating', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')));
    render(<SignInPage />);
    const user = await fillCredentials();
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('Network unavailable'));
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
