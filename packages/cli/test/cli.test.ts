import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { TEST_DIR } from './util/project.js'

const BIN = path.join(TEST_DIR, '../bin/kita-html.js')
const TMP = path.join(TEST_DIR, '.tmp-cli')

if (!fs.existsSync(path.join(TEST_DIR, '../dist/cli/commands/check.js'))) {
  throw new Error('You must run pnpm build before running the CLI tests')
}

const TSCONFIG = {
  compilerOptions: {
    jsx: 'react-jsx',
    jsxImportSource: '@kitajs/html',
    strict: true,
    module: 'nodenext',
    target: 'esnext',
    noEmit: true,
    types: []
  },
  include: ['src']
}

let counter = 0

/** Writes a project under the package so `@kitajs/html` and `typescript` resolve. */
function project(files: Record<string, string>, tsconfig: object | null = TSCONFIG) {
  const dir = path.join(TMP, String(counter++))

  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true })
    fs.writeFileSync(path.join(dir, file), content)
  }

  if (tsconfig) {
    fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify(tsconfig))
  }

  return dir
}

function run(cwd: string, args: string[], env: NodeJS.ProcessEnv = {}) {
  const base: NodeJS.ProcessEnv = { ...process.env }

  // Color variables count as set even when empty, so they are removed
  delete base.NO_COLOR
  delete base.FORCE_COLOR
  delete base.GITHUB_WORKSPACE

  const result = spawnSync(process.execPath, [BIN, ...args], {
    cwd,
    encoding: 'utf8',
    env: {
      ...base,
      // Keeps tests offline and deterministic
      KITA_HTML_SKIP_NEW_VERSION_CHECK: 'true',
      ...env
    }
  })

  return { code: result.status, stdout: result.stdout, stderr: result.stderr }
}

const CLEAN = { 'src/a.tsx': 'export const a = <div>{1}</div>\n' }
const ERRORS = {
  'src/a.tsx': 'declare const input: string\nexport const a = <div>{input}</div>\n'
}
const WARNINGS = { 'src/a.tsx': 'export const a = <div safe>{1}</div>\n' }

afterAll(() => {
  fs.rmSync(TMP, { recursive: true, force: true })
})

describe('exit codes', () => {
  it('exits 0 when no issues are found', () => {
    const { code, stdout } = run(project(CLEAN), ['check'])

    expect(code).toBe(0)
    expect(stdout).toBe('No XSS issues found in 1 file.\n')
  })

  it('exits 1 when errors are found', () => {
    const { code, stdout } = run(project(ERRORS), ['check'])

    expect(code).toBe(1)
    expect(stdout).toContain('src/a.tsx:2:24 - error TS88601')
    expect(stdout).toContain('Found 1 error in 1 file.')
  })

  it('exits 2 when only warnings are found', () => {
    const { code, stdout } = run(project(WARNINGS), ['check'])

    expect(code).toBe(2)
    expect(stdout).toContain('warning TS88604')
  })

  it('exits 1 on invalid flags instead of oclif default 2', () => {
    const dir = project(CLEAN)

    expect(run(dir, ['check', '--format', 'nope']).code).toBe(1)
    expect(run(dir, ['check', '--nope']).code).toBe(1)
  })

  it('exits 1 when the tsconfig is missing', () => {
    const { code, stderr } = run(project(CLEAN, null), ['check'])

    expect(code).toBe(1)
    expect(stderr).toContain('Could not find a tsconfig.json')
  })

  it('exits 1 with TypeScript diagnostics when the tsconfig is invalid', () => {
    const { code, stderr } = run(
      project(CLEAN, { compilerOptions: { target: 'nope' }, include: ['src'] }),
      ['check']
    )

    expect(code).toBe(1)
    expect(stderr).toMatch(/tsconfig\.json\(\d+,\d+\): error TS\d+/)
  })

  it('exits 1 when TypeScript is older than 7.1', () => {
    const dir = project({
      ...CLEAN,
      'node_modules/typescript/package.json': JSON.stringify({
        name: 'typescript',
        version: '7.0.2'
      })
    })

    const { code, stderr } = run(dir, ['check'])

    expect(code).toBe(1)
    expect(stderr).toContain('requires typescript >=7.1 (found 7.0.2')
    expect(stderr).toContain('@kitajs/ts-html-plugin')
  })
})

describe('formats', () => {
  it('json keeps stdout parseable on success and on findings', () => {
    const clean = run(project(CLEAN), ['check', '--format', 'json'])
    const errors = run(project(ERRORS), ['check', '-f', 'json'])

    expect(JSON.parse(clean.stdout).summary).toEqual({
      filesChecked: 1,
      errors: 0,
      warnings: 0
    })
    expect(JSON.parse(errors.stdout).diagnostics[0]).toMatchObject({
      file: 'src/a.tsx',
      id: 'TS88601',
      start: { line: 2, column: 24 }
    })
    expect(errors.code).toBe(1)
  })

  it('does not truncate large reports written to a pipe before a failing exit', () => {
    const count = 3000
    const body = Array.from({ length: count }, () => '    {input}').join('\n')
    const dir = project({
      'src/a.tsx': `declare const input: string\nexport const a = (\n  <div>\n${body}\n  </div>\n)\n`
    })

    const { code, stdout } = run(dir, ['check', '--format', 'tsc'])

    expect(code).toBe(1)
    expect(stdout.trimEnd().split('\n')).toHaveLength(count)
  })

  it('tsc prints nothing on success and tsc lines on findings', () => {
    expect(run(project(CLEAN), ['check', '--format', 'tsc']).stdout).toBe('')
    expect(run(project(ERRORS), ['check', '--format', 'tsc']).stdout).toBe(
      'src/a.tsx(2,24): error TS88601: Content may introduce an XSS vulnerability and must be marked with the `safe` attribute.\n'
    )
  })

  it('github prints annotations relative to GITHUB_WORKSPACE', () => {
    const dir = project(ERRORS)
    const { stdout } = run(dir, ['check', '--format', 'github'], {
      GITHUB_WORKSPACE: path.dirname(dir)
    })

    expect(stdout).toContain(
      `::error file=${path.basename(dir)}/src/a.tsx,line=2,col=24,endLine=2,endColumn=29,title=TS88601::`
    )
    expect(stdout).toContain('src/a.tsx(2,24): error TS88601')
  })

  it('pretty is colorless when piped and honors --color and FORCE_COLOR', () => {
    const dir = project(ERRORS)

    expect(run(dir, ['check']).stdout).not.toContain('\x1b[')
    expect(run(dir, ['check', '--color']).stdout).toContain('\x1b[')
    expect(run(dir, ['check'], { FORCE_COLOR: '1' }).stdout).toContain('\x1b[')
    expect(run(dir, ['check', '--no-color'], { FORCE_COLOR: '1' }).stdout).not.toContain(
      '\x1b['
    )
  })
})

describe('projects and files', () => {
  it('accepts repeated -p flags', () => {
    const dir = project(
      {
        'a/tsconfig.json': JSON.stringify(TSCONFIG),
        'a/src/a.tsx': ERRORS['src/a.tsx'],
        'b/tsconfig.json': JSON.stringify(TSCONFIG),
        'b/src/b.tsx': WARNINGS['src/a.tsx']
      },
      null
    )

    const { code, stdout } = run(dir, [
      'check',
      '-p',
      'a',
      '-p',
      'b/tsconfig.json',
      '-f',
      'tsc'
    ])

    expect(code).toBe(1)
    expect(stdout.trimEnd().split('\n')).toEqual([
      expect.stringContaining('a/src/a.tsx(2,24): error TS88601'),
      expect.stringContaining('b/src/b.tsx(1,23): warning TS88604')
    ])
  })

  it('expands a solution-style tsconfig', () => {
    const composite = {
      ...TSCONFIG,
      compilerOptions: {
        ...TSCONFIG.compilerOptions,
        composite: true,
        noEmit: false,
        outDir: 'dist',
        rootDir: 'src'
      }
    }

    const dir = project(
      {
        'packages/a/tsconfig.json': JSON.stringify(composite),
        'packages/a/src/a.tsx': ERRORS['src/a.tsx'],
        'packages/b/tsconfig.json': JSON.stringify(composite),
        'packages/b/src/b.tsx': ERRORS['src/a.tsx']
      },
      { files: [], references: [{ path: './packages/a' }, { path: './packages/b' }] }
    )

    const { code, stdout } = run(dir, ['check', '-f', 'json'])

    expect(code).toBe(1)
    expect(JSON.parse(stdout).projects).toEqual([
      'packages/a/tsconfig.json',
      'packages/b/tsconfig.json'
    ])
    expect(JSON.parse(stdout).summary.errors).toBe(2)
  })

  it('reports only positional files and warns about skipped ones', () => {
    const dir = project({
      ...ERRORS,
      'src/b.tsx': ERRORS['src/a.tsx'],
      'src/c.ts': 'export {}\n'
    })

    const { code, stdout, stderr } = run(dir, [
      'check',
      '-f',
      'tsc',
      'src/b.tsx',
      'src/c.ts'
    ])

    expect(code).toBe(1)
    expect(stdout).toContain('src/b.tsx(2,24)')
    expect(stdout).not.toContain('src/a.tsx')
    expect(stderr).toContain(`Skipping 'src/c.ts': not a TSX/JSX file.`)
  })

  it('exits 0 when every positional file was skipped', () => {
    const { code, stderr } = run(project(ERRORS), ['check', 'other/x.tsx'])

    expect(code).toBe(0)
    expect(stderr).toContain(`Skipping 'other/x.tsx': not part of any checked project.`)
  })
})

describe('oclif', () => {
  it('prints help for check', () => {
    const { code, stdout } = run(TMP, ['check', '--help'])

    expect(code).toBe(0)
    expect(stdout).toContain('$ kita-html check [FILES...]')
    expect(stdout).toContain('--format=<option>')
  })

  it('prints the version', () => {
    const { code, stdout } = run(TMP, ['--version'])

    expect(code).toBe(0)
    expect(stdout).toMatch(/^@kitajs\/html-cli\/\d+\.\d+\.\d+/)
  })

  it('suggests commands for typos', () => {
    const { code, stderr } = run(TMP, ['chek'])

    expect(code).toBe(127)
    expect(stderr).toContain('is not a kita-html command')
  })

  it('does not ship the update command', () => {
    const { code, stderr } = run(TMP, ['update'])

    expect(code).toBe(127)
    expect(stderr).toContain('is not a kita-html command')
  })
})
