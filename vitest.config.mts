import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'lib/{auth,jwt,checkout,stripe-order,order-email}.ts',
        'store/cart.ts', 'hooks/useTotal.ts',
        'app/api/{auth,checkout_sessions,orders,webhook,uploadthing}/**/*.ts',
        'components/shared/{Products,AllProductsClient,PaginationPage,SignInPage}.tsx',
      ],
      exclude: ['app/api/uploadthing/route.ts'],
    },
  },
});
