import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Larger timeout because tsserver is slow
    testTimeout: 15000,
    coverage: {
      exclude: ['test/**']
    }
  }
});
