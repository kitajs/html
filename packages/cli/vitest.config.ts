import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Each test file spawns a TypeScript API process
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      exclude: ['test/**', 'bin/**']
    }
  }
})
