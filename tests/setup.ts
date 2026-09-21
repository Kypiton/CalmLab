import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

// No real API requests from unit tests. Individual tests can explicitly mock fetch.
beforeEach(() => {
  // jsdom has no layout engine. Radix uses this API for measuring controls.
  if (typeof window !== 'undefined') {
    vi.stubGlobal('ResizeObserver', class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    });
  }
  vi.stubGlobal('fetch', () => {
    throw new Error('Unexpected network request: mock fetch explicitly in this test.');
  });
});
