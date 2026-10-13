import { describe, expect, it } from 'vitest'
import { resolveColor } from '../src/cli/color.js'
import {
  exitCodeFor,
  normalizeDiagnostics,
  type KitaDiagnostic
} from '../src/diagnostic.js'
import { caseInsensitiveFileSystem, comparablePath, normalizePath } from '../src/paths.js'
import { supportsSyncApi } from '../src/typescript.js'

function diagnostic(
  fileName: string,
  start: number,
  severity: KitaDiagnostic['severity'] = 'error',
  code = 88601
): KitaDiagnostic {
  return {
    fileName,
    start,
    end: start + 1,
    startPosition: { line: 0, character: start },
    endPosition: { line: 0, character: start + 1 },
    code,
    severity,
    message: '',
    url: ''
  }
}

describe('supportsSyncApi', () => {
  it.each([
    ['7.1.0', true],
    ['7.1.0-dev.20261012.1', true],
    ['7.2.3', true],
    ['8.0.0', true],
    ['7.0.2', false],
    ['7.0.1-rc', false],
    ['6.0.3', false],
    ['5.9.2', false],
    ['nope', false]
  ])('%s -> %s', (version, expected) => {
    expect(supportsSyncApi(version)).toBe(expected)
  })
})

describe('exitCodeFor', () => {
  it('follows the xss-scan contract', () => {
    expect(exitCodeFor([])).toBe(0)
    expect(exitCodeFor([diagnostic('a', 0, 'warning')])).toBe(2)
    expect(exitCodeFor([diagnostic('a', 0, 'warning'), diagnostic('a', 1)])).toBe(1)
  })
})

describe('normalizeDiagnostics', () => {
  it('sorts by file and position and drops duplicates', () => {
    const result = normalizeDiagnostics([
      diagnostic('b', 0),
      diagnostic('a', 5),
      diagnostic('a', 1),
      diagnostic('a', 5),
      diagnostic('a', 5, 'warning', 88604)
    ])

    expect(result.map((d) => `${d.fileName}:${d.start}:${d.code}`)).toEqual([
      'a:1:88601',
      'a:5:88601',
      'a:5:88604',
      'b:0:88601'
    ])
  })
})

describe('resolveColor', () => {
  it('prefers the flag, then NO_COLOR and FORCE_COLOR, then the TTY', () => {
    expect(resolveColor(true, { NO_COLOR: '1' }, false)).toBe(true)
    expect(resolveColor(false, { FORCE_COLOR: '1' }, true)).toBe(false)
    expect(resolveColor(undefined, { NO_COLOR: '1', FORCE_COLOR: '1' }, true)).toBe(false)
    expect(resolveColor(undefined, { FORCE_COLOR: '1' }, false)).toBe(true)
    expect(resolveColor(undefined, { FORCE_COLOR: '0' }, false)).toBe(false)
    expect(resolveColor(undefined, {}, true)).toBe(true)
    expect(resolveColor(undefined, {}, false)).toBe(false)
  })
})

describe('normalizePath', () => {
  it('uses forward slashes and a lowercase drive letter', () => {
    expect(normalizePath('C:\\repo\\src\\a.tsx')).toBe('c:/repo/src/a.tsx')
    expect(normalizePath('/repo/src/a.tsx')).toBe('/repo/src/a.tsx')
  })

  it('compares case-insensitively where the file system does', () => {
    expect(comparablePath('C:\\Repo\\A.tsx')).toBe(
      caseInsensitiveFileSystem ? 'c:/repo/a.tsx' : 'c:/Repo/A.tsx'
    )
  })
})
