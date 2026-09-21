import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as login } from '@/app/api/auth/login/route';
import { POST as register } from '@/app/api/auth/register/route';
import { POST as logout } from '@/app/api/auth/logout/route';
import { buyer, jsonRequest } from '../helpers';

const mocks = vi.hoisted(() => ({ findUser: vi.fn(), createUser: vi.fn(), hash: vi.fn(), compare: vi.fn(), sign: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ default: { user: { findUnique: mocks.findUser, create: mocks.createUser } } }));
vi.mock('bcryptjs', () => ({ default: { hash: mocks.hash, compare: mocks.compare } }));
vi.mock('@/lib/jwt', () => ({ createJWT: mocks.sign }));
beforeEach(() => {
  vi.resetAllMocks();
  mocks.hash.mockResolvedValue('hashed-password');
  mocks.sign.mockResolvedValue('signed-token');
});

describe('login', () => {
  it.each([null, {}, { email: 123, password: 'x' }, { email: '', password: '' }])('rejects missing/invalid fields %j', async body => {
    expect((await login(jsonRequest(body))).status).toBe(400);
    expect(mocks.findUser).not.toHaveBeenCalled();
  });
  it('rejects an unknown user', async () => {
    mocks.findUser.mockResolvedValue(null);
    const response = await login(jsonRequest({ email: buyer.email, password: 'wrong' }));
    expect(response.status).toBe(401);
    expect(response.cookies.get('Auth-token')).toBeUndefined();
  });
  it('rejects a wrong password without issuing a token', async () => {
    mocks.findUser.mockResolvedValue(buyer);
    mocks.compare.mockResolvedValue(false);
    const response = await login(jsonRequest({ email: buyer.email, password: 'wrong' }));
    expect(response.status).toBe(401);
    expect(mocks.sign).not.toHaveBeenCalled();
  });
  it('normalizes email and issues an HttpOnly secure cookie in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    mocks.findUser.mockResolvedValue(buyer);
    mocks.compare.mockResolvedValue(true);
    const response = await login(jsonRequest({ email: ' BUYER@Example.COM ', password: 'secret' }));
    expect(response.status).toBe(200);
    expect(mocks.findUser).toHaveBeenCalledWith({ where: { email: buyer.email } });
    expect(mocks.compare).toHaveBeenCalledWith('secret', buyer.password);
    expect(response.cookies.get('Auth-token')).toMatchObject({ value: 'signed-token', httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
  });
});

const registration = { firstName: 'Test', lastName: 'Buyer', email: ' BUYER@Example.COM ', password: 'secret', confirmPassword: 'secret', agreement: true };
describe('registration', () => {
  it.each([
    null, {}, { ...registration, firstName: '' }, { ...registration, email: 42 },
    { ...registration, confirmPassword: 'different' },
    { ...registration, agreement: false }, { ...registration, agreement: 'true' },
  ])('rejects invalid registration %j', async body => {
    expect((await register(jsonRequest(body))).status).toBe(400);
    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(mocks.hash).not.toHaveBeenCalled();
  });
  it('rejects an existing account', async () => {
    mocks.findUser.mockResolvedValue(buyer);
    expect((await register(jsonRequest(registration))).status).toBe(400);
    expect(mocks.createUser).not.toHaveBeenCalled();
  });
  it('normalizes the email and stores a hash instead of the password', async () => {
    mocks.findUser.mockResolvedValue(null);
    expect((await register(jsonRequest(registration))).status).toBe(200);
    expect(mocks.findUser).toHaveBeenCalledWith({ where: { email: buyer.email } });
    expect(mocks.hash).toHaveBeenCalledWith('secret', 10);
    expect(mocks.createUser).toHaveBeenCalledWith({ data: {
      firstName: 'Test', lastName: 'Buyer', email: buyer.email, password: 'hashed-password',
    } });
  });
});

it('logout expires the authentication cookie', async () => {
  const response = await logout();
  expect(response.cookies.get('Auth-token')).toMatchObject({ value: '', maxAge: 0, path: '/' });
});
