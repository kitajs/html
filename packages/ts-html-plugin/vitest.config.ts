import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Larger timeout because tsserver is slow
    testTimeout: 60000,
    coverage: {
      exclude: ['test/**']
    }
  }
})
