// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AllProductsClient } from '@/components/shared/AllProductsClient';
import type { ProductItem } from '@/types/product-item';

const navigation = vi.hoisted(() => ({ params: new URLSearchParams(), push: vi.fn() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => navigation.params, useRouter: () => ({ push: navigation.push }) }));
// Keep catalogue filtering, input state and pagination real. Isolate unrelated card styling.
vi.mock('@/components/shared/index', () => ({
  ProductCard: ({ title }: ProductItem) => <article>{title}</article>,
  Category: () => null,
}));
const products: ProductItem[] = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1, title: `Vitamin ${index + 1}`, price: index + 1, rating: index % 5,
  category: index % 2 === 0 ? 'focus' : 'sleep', description: 'Test product', image: '/image.png', brand: 'Test',
}));
beforeEach(() => { navigation.params = new URLSearchParams(); });
afterEach(cleanup);

describe('catalog search, sort and pagination', () => {
  it('shows 12 products per page and navigates forward/back', async () => {
    const user = userEvent.setup();
    render(<AllProductsClient products={products} />);
    expect(screen.getAllByRole('article')).toHaveLength(12);
    expect(screen.getByText('Vitamin 1')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Go to next page' }));
    expect(screen.queryByText('Vitamin 1')).not.toBeInTheDocument();
    expect(screen.getByText('Vitamin 13')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Go to previous page' }));
    expect(screen.getByText('Vitamin 1')).toBeInTheDocument();
  });
  it('searches beyond the first page and resets pagination when the query changes', async () => {
    const user = userEvent.setup();
    render(<AllProductsClient products={products} />);
    await user.click(screen.getByRole('link', { name: 'Go to next page' }));
    await user.type(screen.getByPlaceholderText('Search products...'), 'vItAmIn 25');
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText('Vitamin 25')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
  it('sorts the whole catalog before selecting the first page', () => {
    navigation.params = new URLSearchParams('sort=price-desc');
    render(<AllProductsClient products={products} />);
    const cards = screen.getAllByRole('article');
    expect(cards[0]).toHaveTextContent('Vitamin 25');
    expect(cards[11]).toHaveTextContent('Vitamin 14');
    expect(products[0].id).toBe(1);
  });
  it('applies category filters and shows a matching empty state', async () => {
    const user = userEvent.setup();
    navigation.params = new URLSearchParams('category=sleep');
    render(<AllProductsClient products={products} />);
    expect(screen.queryByText('Vitamin 1')).not.toBeInTheDocument();
    expect(screen.getByText('Vitamin 2')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('Search products...'), 'does not exist');
    expect(screen.getByText('Products not found...')).toBeInTheDocument();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });
});
