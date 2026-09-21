import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Bundle the real handlers and replace only external services; no live payments or DB writes.
async function load(entry, mocks = {}) {
  const result = await build({
    entryPoints: [path.resolve(entry)], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external',
    plugins: [{ name: 'service-mocks', setup(builder) {
      builder.onResolve({ filter: /.*/ }, args => {
        if (Object.hasOwn(mocks, args.path)) return { path: args.path, namespace: 'mock' };
      });
      builder.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({
        contents: `module.exports = __mocks[${JSON.stringify(args.path)}];`, loader: 'js',
      }));
    }}],
  });
  const compiled = { exports: {} };
  new Function('require', 'module', 'exports', '__mocks', result.outputFiles[0].text)(require, compiled, compiled.exports, mocks);
  return compiled.exports;
}
const user = { id: 7, email: 'buyer@example.com' };
const request = body => ({ json: async () => body, nextUrl: { origin: 'https://shop.example' } });

test('checkout rejects guests before touching products or Stripe', async () => {
  const { POST } = await load('app/api/checkout_sessions/route.ts', {
    '@/lib/auth': { getCurrentUser: async () => null }, '@/lib/prisma': {}, '@/lib/stripe': {},
  });
  assert.equal((await POST(request([{ id: 1, quantity: 1 }]))).status, 401);
});

test('checkout rejects invalid quantities and duplicate products', async () => {
  const { POST } = await load('app/api/checkout_sessions/route.ts', {
    '@/lib/auth': { getCurrentUser: async () => user }, '@/lib/prisma': {}, '@/lib/stripe': {},
  });
  for (const cart of [null, [], [{ id: 1, quantity: 0 }], [{ id: 1, quantity: -1 }],
    [{ id: 1, quantity: 1.5 }], [{ id: '1', quantity: 1 }],
    [{ id: 1, quantity: 1 }, { id: 1, quantity: 2 }]]) {
    assert.equal((await POST(request(cart))).status, 400);
  }
});

test('checkout uses DB prices and snapshots, ignores client price', async () => {
  let sent;
  const { POST } = await load('app/api/checkout_sessions/route.ts', {
    '@/lib/auth': { getCurrentUser: async () => user },
    '@/lib/prisma': { product: { findMany: async () => [{ id: 1, price: 12.34, title: 'Vitamin', image: '/vitamin.png' }] } },
    '@/lib/stripe': { stripe: { checkout: { sessions: { create: async data => { sent = data; return { url: 'https://checkout.stripe.com/example' }; } } } } },
  });
  assert.equal((await POST(request([{ id: 1, quantity: 2, price: 0.01 }]))).status, 200);
  assert.equal(sent.line_items[0].price_data.unit_amount, 1234);
  assert.equal(sent.line_items[0].price_data.product_data.metadata.image, '/vitamin.png');
  assert.equal(sent.metadata.userId, '7');
  assert.equal(sent.line_items[1].price_data.unit_amount, 499);
});

test('orders API denies guests and scopes results to current user', async () => {
  let currentUser = null, query;
  const { GET } = await load('app/api/orders/route.ts', {
    '@/lib/auth': { getCurrentUser: async () => currentUser },
    '@/lib/prisma': { order: { findMany: async args => { query = args; return []; } } },
  });
  assert.equal((await GET()).status, 401);
  assert.equal(query, undefined);
  currentUser = user;
  const response = await GET();
  assert.equal(response.status, 200);
  assert.deepEqual(query.where, { userId: 7 });
  assert.match(response.headers.get('cache-control'), /no-store/);
});

test('purchased items survive catalog deletion and keep charged price', async () => {
  const { getPurchasedItems } = await load('lib/stripe-order.ts', {
    './stripe': { stripe: { checkout: { sessions: { listLineItems: async function* () {
      yield { id: 'li_1', description: 'Original name', quantity: 2, amount_total: 2468,
        price: { unit_amount: 1234, product: { metadata: { productId: '1', image: '/old.png' }, images: [] } } };
      yield { id: 'li_2', description: 'Delivery', quantity: 1, amount_total: 499,
        price: { unit_amount: 499, product: { metadata: { kind: 'shipping' }, images: [] } } };
    } } } } },
  });
  assert.deepEqual(await getPurchasedItems('cs_test'), {
    items: [{ id: 'li_1', title: 'Original name', image: '/old.png', price: 12.34, quantity: 2 }], shipping: 4.99,
  });
});

async function webhook(overrides = {}) {
  process.env.STRIPE_WEBHOOK_SECRET = 'test-secret';
  const session = { id: 'cs_test', payment_status: 'paid', metadata: { userId: '7' }, amount_total: 1733, ...overrides.session };
  const mocks = {
    '@/lib/stripe': { stripe: { webhooks: { constructEvent: () => ({ type: overrides.type || 'checkout.session.completed', data: { object: session } }) },
      checkout: { sessions: { retrieve: async () => session } } } },
    '@/lib/prisma': { order: { findUnique: async () => null, upsert: async () => ({ customerEmail: '' }), ...overrides.order } },
    '@/lib/stripe-order': { getPurchasedItems: async () => ({ items: [{ title: 'Snapshot', image: '/old.png', price: 12.34, quantity: 1 }] }) },
    '@/lib/order-email': {},
  };
  const { POST } = await load('app/api/webhook/route.ts', mocks);
  return POST({ headers: new Headers(overrides.noSignature ? {} : { 'stripe-signature': 'test' }), text: async () => '{}' });
}

test('webhook rejects missing signature', async () => {
  assert.equal((await webhook({ noSignature: true })).status, 400);
});

test('webhook returns 500 on DB failure so delivery can be retried', async () => {
  const response = await webhook({ order: { upsert: async () => { throw new Error('Simulated database outage'); } } });
  assert.equal(response.status, 500);
});

test('duplicate paid webhook does not recreate the order', async () => {
  let writes = 0;
  const response = await webhook({ order: {
    findUnique: async () => ({ status: 'paid' }), upsert: async () => { writes++; },
  } });
  assert.equal(response.status, 200);
  assert.equal(writes, 0);
});

test('unpaid checkout is not fulfilled; async success is fulfilled', async () => {
  let writes = 0;
  const order = { upsert: async () => { writes++; return { customerEmail: '' }; } };
  assert.equal((await webhook({ session: { payment_status: 'unpaid' }, order })).status, 200);
  assert.equal(writes, 0);
  assert.equal((await webhook({ type: 'checkout.session.async_payment_succeeded', order })).status, 200);
  assert.equal(writes, 1);
});

test('success page rejects another user’s session before reading purchased items', async () => {
  const { default: Success } = await load('app/(main)/success/page.tsx', {
    '@/lib/auth': { getCurrentUser: async () => user },
    '@/lib/stripe': { stripe: { checkout: { sessions: { retrieve: async () => ({ metadata: { userId: '8' } }) } } } },
    '@/lib/stripe-order': {}, '@/components/shared/ClearCart': {}, '@/components/shared/SuccessPage': {},
    'next/navigation': { notFound: () => { throw new Error('NOT_FOUND'); } },
  });
  await assert.rejects(Success({ searchParams: Promise.resolve({ session_id: 'cs_other' }) }), /NOT_FOUND/);
});

test('registration normalizes email before uniqueness lookup and insert', async () => {
  let lookup, inserted;
  const { POST } = await load('app/api/auth/register/route.ts', {
    '@/lib/prisma': { user: {
      findUnique: async args => { lookup = args; return null; },
      create: async args => { inserted = args; },
    } }, bcryptjs: { hash: async () => 'hash' },
  });
  const response = await POST(request({ firstName: 'Test', lastName: 'Buyer', email: ' BUYER@Example.COM ', password: 'secret', confirmPassword: 'secret', agreement: true }));
  assert.equal(response.status, 200);
  assert.equal(lookup.where.email, 'buyer@example.com');
  assert.equal(inserted.data.email, 'buyer@example.com');
});

test('catalog searches and sorts the entire list before pagination', async () => {
  const React = require('react');
  const ProductCard = () => null;
  const PaginationPage = () => null;
  let search = '', page = 1;
  const { Products } = await load('components/shared/Products.tsx', {
    react: { ...React, useState: initial => [typeof initial === 'string' ? search : { ...initial, number: page }, () => {}] },
    './': { ProductCard, Category: () => null },
    './PaginationPage': { PaginationPage },
    'next/navigation': { useRouter: () => ({ push() {} }), useSearchParams: () => new URLSearchParams('sort=price-desc') },
  });
  const products = Array.from({ length: 25 }, (_, index) => ({ id: index + 1, title: index === 24 ? 'Unique Vitamin' : 'Vitamin', price: index + 1, category: 'focus', rating: 1 }));
  const descendants = node => {
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(descendants);
    return [node, ...descendants(node.props?.children)];
  };
  let nodes = descendants(Products({ products, paginated: true }));
  let cards = nodes.filter(node => node.type === ProductCard);
  assert.equal(cards.length, 12);
  assert.equal(cards[0].props.id, 25);
  assert.equal(nodes.find(node => node.type === PaginationPage).props.totalPages, 3);
  page = 2;
  nodes = descendants(Products({ products, paginated: true }));
  cards = nodes.filter(node => node.type === ProductCard);
  assert.equal(cards[0].props.id, 13);
  search = 'Unique'; page = 1;
  nodes = descendants(Products({ products, paginated: true }));
  cards = nodes.filter(node => node.type === ProductCard);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].props.id, 25);
});

test('upload middleware rejects guests and identifies authenticated uploads', async () => {
  let guard, current = null;
  const builder = { middleware(fn) { guard = fn; return this; }, onUploadComplete() { return this; } };
  await load('app/api/uploadthing/core.ts', {
    'uploadthing/next': { createUploadthing: () => () => builder },
    'uploadthing/server': { UploadThingError: Error },
    '@/lib/auth': { getCurrentUser: async () => current },
  });
  await assert.rejects(guard(), /Unauthorized/);
  current = user;
  assert.deepEqual(await guard(), { userId: 7 });
});
