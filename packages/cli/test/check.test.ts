import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { CheckError } from '../src/check.js'
import { checkFiles, VIRTUAL_DIR } from './util/project.js'

const options = {
  jsx: 'react-jsx',
  jsxImportSource: '@kitajs/html',
  strict: true,
  module: 'nodenext',
  target: 'esnext',
  noEmit: true,
  types: []
}

const config = (extra: object = {}) =>
  JSON.stringify({ compilerOptions: options, include: ['src'], ...extra })

const composite = (extra: object = {}) =>
  JSON.stringify({
    compilerOptions: {
      ...options,
      composite: true,
      noEmit: false,
      outDir: 'dist',
      rootDir: 'src'
    },
    include: ['src'],
    ...extra
  })

const UNSAFE = `declare const input: string\nexport const a = <div>{input}</div>\n`
const SAFE = `export const a = <div>{1}</div>\n`

const codes = (result: Awaited<ReturnType<typeof checkFiles>>) =>
  result.diagnostics.map(
    (d) => `${path.relative(VIRTUAL_DIR, d.fileName).replace(/\\/g, '/')}:${d.code}`
  )

describe('projects', () => {
  it('checks the tsconfig in the working directory by default', async () => {
    const result = await checkFiles({ 'tsconfig.json': config(), 'src/a.tsx': UNSAFE })

    expect(codes(result)).toEqual(['src/a.tsx:88601'])
    expect(result.filesChecked).toBe(1)
    expect(result.projects).toEqual([path.join(VIRTUAL_DIR, 'tsconfig.json')])
  })

  it('accepts a directory or a file for -p', async () => {
    const files = {
      'app/tsconfig.custom.json': config(),
      'app/tsconfig.json': config(),
      'app/src/a.tsx': UNSAFE
    }

    const fromDirectory = await checkFiles(files, { projects: ['app'] })
    const fromFile = await checkFiles(files, { projects: ['app/tsconfig.custom.json'] })

    expect(codes(fromDirectory)).toEqual(['app/src/a.tsx:88601'])
    expect(codes(fromFile)).toEqual(['app/src/a.tsx:88601'])
    expect(fromFile.projects).toEqual([
      path.join(VIRTUAL_DIR, 'app/tsconfig.custom.json')
    ])
  })

  it('reports findings at the same position in different files', async () => {
    const result = await checkFiles({
      'tsconfig.json': config(),
      'src/a.tsx': UNSAFE,
      'src/b.tsx': UNSAFE
    })

    expect(codes(result)).toEqual(['src/a.tsx:88601', 'src/b.tsx:88601'])
  })

  it('ignores non TSX/JSX files', async () => {
    const result = await checkFiles({
      'tsconfig.json': config(),
      'src/a.tsx': SAFE,
      'src/b.ts': 'export const b: string = "<b>"\n'
    })

    expect(result.filesChecked).toBe(1)
    expect(result.diagnostics).toEqual([])
  })

  it('fails when the tsconfig is missing', async () => {
    await expect(
      checkFiles({ 'src/a.tsx': SAFE }, { projects: ['nope'] })
    ).rejects.toThrow(CheckError)
  })

  it('fails with TypeScript diagnostics when the tsconfig is invalid', async () => {
    const promise = checkFiles({
      'tsconfig.json': JSON.stringify({ compilerOptions: { target: 'nope' } }),
      'src/a.tsx': SAFE
    })

    await expect(promise).rejects.toThrow(CheckError)
    await expect(promise).rejects.toThrow(/TS\d+/)
  })

  it('fails when the project has no TSX/JSX files', async () => {
    await expect(
      checkFiles({ 'tsconfig.json': config(), 'src/a.ts': 'export {}\n' })
    ).rejects.toThrow(/No TSX\/JSX files found/)
  })

  it('reports a file shared by repeated -p projects once', async () => {
    const result = await checkFiles(
      {
        'a/tsconfig.json': JSON.stringify({
          compilerOptions: options,
          files: ['../shared/a.tsx']
        }),
        'b/tsconfig.json': JSON.stringify({
          compilerOptions: options,
          files: ['../shared/a.tsx']
        }),
        'shared/a.tsx': UNSAFE
      },
      { projects: ['a', 'b'] }
    )

    expect(codes(result)).toEqual(['shared/a.tsx:88601'])
    expect(result.filesChecked).toBe(1)
  })

  it('checks the same project only once when passed twice', async () => {
    const result = await checkFiles(
      { 'tsconfig.json': config(), 'src/a.tsx': UNSAFE },
      { projects: ['.', 'tsconfig.json'] }
    )

    expect(result.projects).toHaveLength(1)
    expect(codes(result)).toEqual(['src/a.tsx:88601'])
  })
})

describe('solution-style tsconfig', () => {
  const solution = {
    'tsconfig.json': JSON.stringify({
      files: [],
      references: [{ path: './packages/lib' }, { path: './packages/app/tsconfig.json' }]
    }),
    'packages/lib/tsconfig.json': composite(),
    'packages/lib/src/index.tsx': `export const name: string = 'x'\nexport const lib = <b>{name}</b>\n`,
    'packages/app/tsconfig.json': composite({ references: [{ path: '../lib' }] }),
    // Imports the unbuilt output of the referenced project
    'packages/app/src/a.tsx': `import { name } from '../../lib/dist/index.js'\nexport const a = <div>{name}</div>\n`
  }

  it('expands references and checks every referenced project', async () => {
    const result = await checkFiles(solution)

    expect(codes(result)).toEqual([
      'packages/app/src/a.tsx:88601',
      'packages/lib/src/index.tsx:88601'
    ])
    expect(
      result.projects.map((p) => path.relative(VIRTUAL_DIR, p).replace(/\\/g, '/'))
    ).toEqual(['packages/lib/tsconfig.json', 'packages/app/tsconfig.json'])
  })

  it('resolves types from unbuilt referenced projects', async () => {
    const result = await checkFiles(solution)

    // `name` would be `any` (still an error, but for the wrong reason) if the reference
    // did not resolve, so also check a safe import
    const safe = await checkFiles({
      ...solution,
      'packages/lib/src/index.tsx': `export const count: number = 1\n export const lib = <b>{count}</b>\n`,
      'packages/app/src/a.tsx': `import { count } from '../../lib/dist/index.js'\nexport const a = <div>{count}</div>\n`
    })

    expect(result.diagnostics).toHaveLength(2)
    expect(safe.diagnostics).toEqual([])
  })

  it('follows nested references transitively and stops on cycles', async () => {
    const result = await checkFiles({
      'tsconfig.json': JSON.stringify({ files: [], references: [{ path: './nested' }] }),
      'nested/tsconfig.json': JSON.stringify({
        files: [],
        references: [{ path: '../a' }]
      }),
      'a/tsconfig.json': composite({ references: [{ path: '../b' }] }),
      'a/src/a.tsx': UNSAFE,
      'b/tsconfig.json': composite({ references: [{ path: '../a' }] }),
      'b/src/b.tsx': UNSAFE
    })

    expect(codes(result)).toEqual(['a/src/a.tsx:88601', 'b/src/b.tsx:88601'])
  })

  it('does not follow references of a project that has files', async () => {
    const result = await checkFiles(solution, { projects: ['packages/app'] })

    expect(codes(result)).toEqual(['packages/app/src/a.tsx:88601'])
  })

  it('fails when references lead to no files', async () => {
    await expect(
      checkFiles({
        'tsconfig.json': JSON.stringify({ files: [], references: [{ path: './other' }] }),
        'other/tsconfig.json': JSON.stringify({ files: [], references: [{ path: '..' }] })
      })
    ).rejects.toThrow(/references no projects with files/)
  })

  it('reports TypeScript errors of referenced configs', async () => {
    await expect(
      checkFiles({
        'tsconfig.json': JSON.stringify({ files: [], references: [{ path: './empty' }] }),
        'empty/tsconfig.json': JSON.stringify({ files: [] })
      })
    ).rejects.toThrow(/TS18002/)
  })

  it('fails when a referenced project does not exist', async () => {
    await expect(
      checkFiles({
        'tsconfig.json': JSON.stringify({
          files: [],
          references: [{ path: './missing' }]
        })
      })
    ).rejects.toThrow(CheckError)
  })
})

describe('positional files', () => {
  const files = {
    'tsconfig.json': config(),
    'src/a.tsx': UNSAFE,
    'src/b.tsx': UNSAFE,
    'test/c.tsx': UNSAFE
  }

  it('only reports the given files', async () => {
    const result = await checkFiles(files, { files: ['src/b.tsx'] })

    expect(codes(result)).toEqual(['src/b.tsx:88601'])
    expect(result.filesChecked).toBe(1)
  })

  it('skips files that are not TSX/JSX with a notice', async () => {
    const notices: string[] = []
    const result = await checkFiles(files, { files: ['src/a.ts', 'src/a.tsx'], notices })

    expect(codes(result)).toEqual(['src/a.tsx:88601'])
    expect(notices).toEqual([`Skipping 'src/a.ts': not a TSX/JSX file.`])
  })

  it('skips files outside the projects with a notice instead of failing', async () => {
    const notices: string[] = []
    const result = await checkFiles(files, { files: ['test/c.tsx'], notices })

    expect(result.diagnostics).toEqual([])
    expect(result.filesChecked).toBe(0)
    expect(notices).toEqual([`Skipping 'test/c.tsx': not part of any checked project.`])
  })

  it('accepts absolute paths', async () => {
    const result = await checkFiles(files, {
      files: [path.join(VIRTUAL_DIR, 'src/a.tsx')]
    })

    expect(codes(result)).toEqual(['src/a.tsx:88601'])
  })
})

describe('kita types', () => {
  it('trusts Html.Children through every import style', async () => {
    const result = await checkFiles({
      'tsconfig.json': config(),
      'src/a.tsx': `
        import Html, { type Children, type PropsWithChildren } from '@kitajs/html'
        declare const a: Html.Children
        declare const b: Children
        export function C({ children }: PropsWithChildren) {
          return <div>{a}{b}{children}</div>
        }
      `
    })

    expect(result.diagnostics).toEqual([])
  })

  it('does not trust a user type named Children', async () => {
    const result = await checkFiles({
      'tsconfig.json': config(),
      'src/a.tsx': `
        type Children = string
        declare const a: Children
        export const x = <div>{a}</div>
      `
    })

    expect(codes(result)).toEqual(['src/a.tsx:88601'])
  })

  it('returns diagnostics sorted with code frame sources', async () => {
    const result = await checkFiles({
      'tsconfig.json': config(),
      'src/b.tsx': UNSAFE,
      'src/a.tsx': `declare const x: string\nexport const a = <div>{x}<span safe>{1}</span></div>\n`
    })

    expect(codes(result)).toEqual([
      'src/a.tsx:88601',
      'src/a.tsx:88604',
      'src/b.tsx:88601'
    ])
    expect([...result.sources.keys()].map((f) => path.basename(f))).toEqual(
      expect.arrayContaining(['a.tsx', 'b.tsx'])
    )
  })
})
