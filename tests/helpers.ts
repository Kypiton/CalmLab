import { NextRequest } from 'next/server';

export function jsonRequest(body: unknown, path = '/api/test') {
  return new NextRequest(`https://shop.example${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export const buyer = { id: 7, email: 'buyer@example.com', password: 'password-hash' };
export const purchasedItem = {
  id: 'li_1', title: 'Vitamin', image: '/products/vitamin-C.png', price: 12.34, quantity: 2,
};
