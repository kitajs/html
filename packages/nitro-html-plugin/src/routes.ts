import type { ScannedPage } from './types.js'

const DYNAMIC_SEGMENT = /^\[([^./\]]+)]$/
const CATCH_ALL_SEGMENT = /^\[\.\.\.([^./\]]*)]$/
const ROUTE_GROUP = /^\([^/]+\)$/

function sanitizeParameter(value: string) {
  const sanitized = value.replace(/[^\w-]/g, '_')
  if (!sanitized) {
    throw new Error(`Invalid empty page parameter: ${value}`)
  }
  return sanitized
}

/**
 * Converts a page path relative to `server/pages` into a Nitro route.
 *
 * Route groups are removed, final `index` segments collapse to their parent, dynamic
 * segments become Nitro parameters, and catch-all segments become rou3 wildcards. A
 * canonical route is also produced without parameter names so equivalent dynamic routes
 * can be rejected deterministically.
 *
 * @param relativePath Normalized or platform-native path relative to the pages directory.
 * @returns Route metadata used by the Nitro module.
 */
export function pagePathToRoute(relativePath: string): Omit<ScannedPage, 'file'> {
  relativePath = relativePath.replaceAll('\\', '/').replace(/\.(?:tsx|jsx)$/, '')
  const sourceSegments = relativePath.split('/')
  const renderer =
    sourceSegments.length === 1 && CATCH_ALL_SEGMENT.test(sourceSegments[0]!)
  const segments: string[] = []
  const canonical: string[] = []

  for (const [index, segment] of sourceSegments.entries()) {
    if (ROUTE_GROUP.test(segment)) {
      continue
    }

    if (segment === 'index' && index === sourceSegments.length - 1) {
      continue
    }

    const catchAll = segment.match(CATCH_ALL_SEGMENT)
    if (catchAll) {
      const name = catchAll[1]
      segments.push(name ? `**:${sanitizeParameter(name)}` : '**')
      canonical.push('**')
      continue
    }

    const dynamic = segment.match(DYNAMIC_SEGMENT)
    if (dynamic) {
      segments.push(`:${sanitizeParameter(dynamic[1]!)}`)
      canonical.push(':')
      continue
    }

    if (segment.includes('[') || segment.includes(']')) {
      throw new Error(`Invalid page segment: ${segment}`)
    }

    segments.push(segment)
    canonical.push(segment)
  }

  return {
    relativePath,
    route: `/${segments.join('/')}`.replace(/\/$/, '') || '/',
    canonicalRoute: `/${canonical.join('/')}`.replace(/\/$/, '') || '/',
    renderer
  }
}
