import { describe, expect, test } from 'vitest'
import { pagePathToRoute } from '../src/routes.js'

describe('pagePathToRoute', () => {
  test.each([
    ['index.tsx', '/', false],
    ['about.tsx', '/about', false],
    ['blog/index.tsx', '/blog', false],
    ['blog/[slug].tsx', '/blog/:slug', false],
    ['files/[...path].tsx', '/files/**:path', false],
    ['(admin)/users.tsx', '/users', false],
    ['[...].tsx', '/**', true],
    ['[...path].tsx', '/**:path', true]
  ])('maps %s to %s', (file, route, renderer) => {
    expect(pagePathToRoute(file)).toMatchObject({ route, renderer })
  })

  test('normalizes dynamic parameter names for collisions', () => {
    expect(pagePathToRoute('users/[id].tsx').canonicalRoute).toBe('/users/:')
    expect(pagePathToRoute('users/[slug].tsx').canonicalRoute).toBe('/users/:')
  })
})
