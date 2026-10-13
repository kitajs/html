import { runCommand } from '@oclif/test'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { format, stripVTControlCharacters } from 'node:util'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { skipWindowsShellDetection } from '../src/cli/environment.js'
import { TEST_DIR } from './util/project.js'

const ROOT = path.join(TEST_DIR, '..')
const BIN = path.join(ROOT, 'bin/kita-html.js')
// No spaces: runCommand splits arguments on whitespace
const TMP = path.join(TEST_DIR, '.tmp-cli')

if (!fs.existsSync(path.join(ROOT, 'dist/cli/commands/check.js'))) {
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

// Pattern of the tsc problem matcher (VS Code `$tsc` and `actions/setup-node`)
const TSC_MATCHER =
  /^([^\s].*)[(:](\d+)[,:](\d+)(?:\):\s+|\s+-\s+)(error|warning|info)\s+TS(\d+)\s*:\s*(.*)$/

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

/** Environment every run starts from, so the host CI (and its colors) does not leak in. */
function baseEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const base: NodeJS.ProcessEnv = { ...process.env }

  delete base.NO_COLOR
  delete base.FORCE_COLOR
  delete base.GITHUB_ACTIONS
  delete base.GITHUB_WORKSPACE

  // Same as the bin does before oclif loads
  skipWindowsShellDetection(['check'], base)

  // Keeps runs offline and deterministic
  return { ...base, KITA_HTML_SKIP_NEW_VERSION_CHECK: 'true', ...env }
}

/**
 * Runs `kita-html check` in this process through oclif, like the bin does. Spawning a
 * process per case is too slow on Windows runners, where oclif startup takes seconds.
 */
async function check(cwd: string, args: string[], env: NodeJS.ProcessEnv = {}) {
  const originalEnv = process.env
  process.env = baseEnv(env)
  process.exitCode = undefined
  const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)

  // oclif prints warnings with console.error, which Vitest intercepts before stderr
  let warnings = ''
  const errorSpy = vi.spyOn(console, 'error').mockImplementation((...args) => {
    warnings += `${format(...args)}\n`
  })

  try {
    const { error, stdout, stderr } = await runCommand(
      ['check', ...args],
      { root: ROOT },
      { stripAnsi: false, testNodeEnv: 'production' }
    )

    return {
      code: error ? (error.oclif?.exit ?? 1) : Number(process.exitCode ?? 0),
      stdout,
      // `this.error` throws instead of printing when oclif runs in-process
      stderr: warnings + stderr + (error ? `${error.message}\n` : '')
    }
  } finally {
    cwdSpy.mockRestore()
    errorSpy.mockRestore()
    process.env = originalEnv
    process.exitCode = undefined
  }
}

/** Spawns the real bin, for behavior that only a separate process shows. */
function spawn(cwd: string, args: string[]) {
  const result = spawnSync(process.execPath, [BIN, ...args], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    // Production skips oclif's TypeScript source lookup, as in a real install
    env: baseEnv({ NODE_ENV: 'production' })
  })

  return { code: result.status, stdout: result.stdout, stderr: result.stderr }
}

// Each case starts a TypeScript process, which is slow on shared Windows runners
vi.setConfig({ testTimeout: 120_000 })

// Spawned cases also pay for Node and oclif startup
const SPAWN_TIMEOUT = 180_000

const CLEAN = { 'src/a.tsx': 'export const a = <div>{1}</div>\n' }
const ERRORS = {
  'src/a.tsx': 'declare const input: string\nexport const a = <div>{input}</div>\n'
}
const WARNINGS = { 'src/a.tsx': 'export const a = <div safe>{1}</div>\n' }

afterEach(() => {
  vi.restoreAllMocks()
})

afterAll(() => {
  fs.rmSync(TMP, { recursive: true, force: true })
})

describe('exit codes', () => {
  it('exits 0 when no issues are found', async () => {
    const { code, stdout } = await check(project(CLEAN), [])

    expect(code).toBe(0)
    expect(stdout).toBe('No XSS issues found in 1 file.\n')
  })

  it('exits 1 when errors are found', async () => {
    const { code, stdout } = await check(project(ERRORS), [])

    expect(code).toBe(1)
    expect(stdout).toContain('src/a.tsx:2:24 - error TS88601')
    expect(stdout).toContain('Found 1 error in 1 file.')
  })

  it('exits 2 when only warnings are found', async () => {
    const { code, stdout } = await check(project(WARNINGS), [])

    expect(code).toBe(2)
    expect(stdout).toContain('warning TS88604')
  })

  it('exits 1 on invalid flags instead of oclif default 2', async () => {
    const dir = project(CLEAN)

    expect((await check(dir, ['--format', 'nope'])).code).toBe(1)
    expect((await check(dir, ['--nope'])).code).toBe(1)
  })

  it('exits 1 when the tsconfig is missing', async () => {
    const { code, stderr } = await check(project(CLEAN, null), [])

    expect(code).toBe(1)
    expect(stderr).toContain('Could not find a tsconfig.json')
  })

  it('exits 1 with TypeScript diagnostics when the tsconfig is invalid', async () => {
    const { code, stderr } = await check(
      project(CLEAN, { compilerOptions: { target: 'nope' }, include: ['src'] }),
      []
    )

    expect(code).toBe(1)
    expect(stderr).toMatch(/tsconfig\.json\(\d+,\d+\): error TS\d+/)
  })

  it('exits 1 when TypeScript is older than 7.1', async () => {
    const dir = project({
      ...CLEAN,
      'node_modules/typescript/package.json': JSON.stringify({
        name: 'typescript',
        version: '7.0.2'
      })
    })

    const { code, stderr } = await check(dir, [])

    expect(code).toBe(1)
    expect(stderr).toContain('requires typescript >=7.1 (found 7.0.2')
    expect(stderr).toContain('@kitajs/ts-html-plugin')
  })
})

describe('formats', () => {
  it('json keeps stdout parseable on success and on findings', async () => {
    const clean = await check(project(CLEAN), ['--format', 'json'])
    const errors = await check(project(ERRORS), ['-f', 'json'])

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

  it('tsc prints nothing on success and tsc lines on findings', async () => {
    expect((await check(project(CLEAN), ['--format', 'tsc'])).stdout).toBe('')
    expect((await check(project(ERRORS), ['--format', 'tsc'])).stdout).toBe(
      'src/a.tsx(2,24): error TS88601: Content may introduce an XSS vulnerability and must be marked with the `safe` attribute.\n'
    )
  })

  it('github prints annotations relative to GITHUB_WORKSPACE', async () => {
    const dir = project(ERRORS)
    const { stdout } = await check(dir, ['--format', 'github'], {
      GITHUB_WORKSPACE: path.dirname(dir)
    })

    expect(stdout).toContain(
      `::error file=${path.basename(dir)}/src/a.tsx,line=2,col=24,endLine=2,endColumn=29,title=TS88601::`
    )
    expect(stdout).toContain('src/a.tsx:2:24: error TS88601')
  })

  it('pretty is colorless when piped and honors --color and FORCE_COLOR', async () => {
    const dir = project(ERRORS)

    expect((await check(dir, [])).stdout).not.toContain('\x1b[')
    expect((await check(dir, ['--color'])).stdout).toContain('\x1b[')
    expect((await check(dir, [], { FORCE_COLOR: '1' })).stdout).toContain('\x1b[')
    expect((await check(dir, ['--no-color'], { FORCE_COLOR: '1' })).stdout).not.toContain(
      '\x1b['
    )
  })
})

describe('inside GitHub Actions', () => {
  const actions = { GITHUB_ACTIONS: 'true' }

  it('adds annotations to the pretty output when --format is omitted', async () => {
    const dir = project(ERRORS)
    const { code, stdout } = await check(dir, [], {
      ...actions,
      GITHUB_WORKSPACE: path.dirname(dir)
    })
    const plain = stripVTControlCharacters(stdout)

    expect(code).toBe(1)
    expect(plain).toMatch(
      new RegExp(`^::error file=${path.basename(dir)}/src/a\\.tsx,line=2,col=24,`)
    )
    expect(plain).toContain('src/a.tsx:2:24: error TS88601')
    expect(plain).toContain('See https://html.kitajs.org/TS88601')
    expect(plain).toContain('Found 1 error in 1 file.')
  })

  it('prints colors, which GitHub logs render', async () => {
    const { stdout } = await check(project(ERRORS), [], actions)

    expect(stdout).toContain('\x1b[')
  })

  it('does not print lines the setup-node tsc problem matcher would annotate again', async () => {
    const { stdout } = await check(project(ERRORS), [], actions)

    // The runner strips colors before matching
    for (const line of stripVTControlCharacters(stdout).split('\n')) {
      expect(line).not.toMatch(TSC_MATCHER)
    }
  })

  it('respects an explicit --format', async () => {
    const dir = project(ERRORS)

    expect((await check(dir, ['--format', 'pretty'], actions)).stdout).not.toContain(
      '::error'
    )
    expect((await check(dir, ['--format', 'tsc'], actions)).stdout).toBe(
      'src/a.tsx(2,24): error TS88601: Content may introduce an XSS vulnerability and must be marked with the `safe` attribute.\n'
    )
  })

  it('prints nothing extra when there are no findings', async () => {
    const { code, stdout } = await check(project(CLEAN), [], actions)

    expect(code).toBe(0)
    expect(stripVTControlCharacters(stdout)).toBe('No XSS issues found in 1 file.\n')
  })
})

describe('projects and files', () => {
  it('accepts repeated -p flags', async () => {
    const dir = project(
      {
        'a/tsconfig.json': JSON.stringify(TSCONFIG),
        'a/src/a.tsx': ERRORS['src/a.tsx'],
        'b/tsconfig.json': JSON.stringify(TSCONFIG),
        'b/src/b.tsx': WARNINGS['src/a.tsx']
      },
      null
    )

    const { code, stdout } = await check(dir, [
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

  it('expands a solution-style tsconfig', async () => {
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

    const { code, stdout } = await check(dir, ['-f', 'json'])

    expect(code).toBe(1)
    expect(JSON.parse(stdout).projects).toEqual([
      'packages/a/tsconfig.json',
      'packages/b/tsconfig.json'
    ])
    expect(JSON.parse(stdout).summary.errors).toBe(2)
  })

  it('reports only positional files and warns about skipped ones', async () => {
    const dir = project({
      ...ERRORS,
      'src/b.tsx': ERRORS['src/a.tsx'],
      'src/c.ts': 'export {}\n'
    })

    const { code, stdout, stderr } = await check(dir, [
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

  it('exits 0 when every positional file was skipped', async () => {
    const { code, stderr } = await check(project(ERRORS), ['other/x.tsx'])

    expect(code).toBe(0)
    expect(stderr).toContain(`Skipping 'other/x.tsx': not part of any checked project.`)
  })
})

describe('real process', () => {
  it(
    'sets the exit code and keeps stdout to the report',
    () => {
      const errors = spawn(project(ERRORS), ['check', '-f', 'json'])
      const warnings = spawn(project(WARNINGS), ['check'])

      expect(errors.code).toBe(1)
      expect(JSON.parse(errors.stdout).summary.errors).toBe(1)
      expect(warnings.code).toBe(2)
    },
    SPAWN_TIMEOUT
  )

  it(
    'does not truncate large reports written to a pipe before a failing exit',
    () => {
      const count = 3000
      const body = Array.from({ length: count }, () => '    {input}').join('\n')
      const dir = project({
        'src/a.tsx': `declare const input: string\nexport const a = (\n  <div>\n${body}\n  </div>\n)\n`
      })

      const { code, stdout } = spawn(dir, ['check', '--format', 'tsc'])

      expect(code).toBe(1)
      expect(stdout.trimEnd().split('\n')).toHaveLength(count)
    },
    SPAWN_TIMEOUT
  )

  it(
    'prints help and the version, and rejects unknown commands with 127',
    () => {
      const help = spawn(TEST_DIR, ['check', '--help'])
      const version = spawn(TEST_DIR, ['--version'])
      const typo = spawn(TEST_DIR, ['chek'])
      const update = spawn(TEST_DIR, ['update'])

      expect(help.code).toBe(0)
      expect(help.stdout).toContain('$ kita-html check [FILES...]')
      expect(help.stdout).toContain('--format=<option>')
      expect(version.code).toBe(0)
      expect(version.stdout).toMatch(/^@kitajs\/html-cli\/\d+\.\d+\.\d+/)
      expect(typo.code).toBe(127)
      expect(typo.stderr).toContain('is not a kita-html command')
      // @oclif/plugin-update is not shipped
      expect(update.code).toBe(127)
    },
    SPAWN_TIMEOUT
  )
})
