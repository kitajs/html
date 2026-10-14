import fs from 'node:fs'
import path from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  normalizeDiagnostics,
  type CheckResult,
  type KitaDiagnostic
} from '../src/diagnostic.js'
import { docsUrl, DoubleEscape, UnusedSafe, Xss } from '../src/errors.js'
import { normalizePath } from '../src/paths.js'
import { escapeData, escapeProperty, github } from '../src/reporters/github.js'
import { json, type JsonReport } from '../src/reporters/json.js'
import { pretty } from '../src/reporters/pretty.js'
import type { ReportContext } from '../src/reporters/shared.js'
import { tsc } from '../src/reporters/tsc.js'
import type { TypeScript } from '../src/typescript.js'
import { getTypeScript, TEST_DIR } from './util/project.js'
import { validate } from './util/schema.js'

// Native separators for the working directory, forward slashes for API file names, like
// the real CLI on Windows
const ROOT = path.resolve('/repo')
const file = (relative: string) => normalizePath(path.join(ROOT, relative))

const A = file('src/pages/login.tsx')
const B = file('src/my pages/home.tsx')

const SOURCE_A = [
  'export const a = (',
  '  <div>',
  '    {user.name}',
  '    <span safe>{1}</span>',
  '    <p safe>',
  '      <b />',
  '      <i />',
  '      <u />',
  '      <s />',
  '    </p>',
  '  </div>',
  ')'
].join('\n')

function diagnostic(
  fileName: string,
  error: { code: number; message: string },
  severity: KitaDiagnostic['severity'],
  start: [line: number, character: number, offset: number],
  end: [line: number, character: number, offset: number]
): KitaDiagnostic {
  return {
    fileName,
    start: start[2],
    end: end[2],
    startPosition: { line: start[0], character: start[1] },
    endPosition: { line: end[0], character: end[1] },
    code: error.code,
    severity,
    message: error.message,
    url: docsUrl(error.code)
  }
}

const RESULT: CheckResult = {
  typescriptVersion: '7.1.0',
  projects: [file('tsconfig.json')],
  filesChecked: 3,
  // check() always sorts before reporting
  diagnostics: normalizeDiagnostics([
    diagnostic(A, Xss, 'error', [2, 5, 32], [2, 14, 41]),
    diagnostic(A, UnusedSafe, 'warning', [3, 10, 53], [3, 14, 57]),
    // Spans more than five lines
    diagnostic(A, DoubleEscape, 'error', [4, 4, 70], [9, 8, 130]),
    diagnostic(B, Xss, 'error', [0, 0, 0], [0, 4, 4])
  ]),
  sources: new Map([
    [A, SOURCE_A],
    [B, 'user']
  ])
}

const CLEAN: CheckResult = {
  ...RESULT,
  filesChecked: 1,
  diagnostics: [],
  sources: new Map()
}

let ts: TypeScript
let ctx: ReportContext

beforeAll(async () => {
  ts = await getTypeScript()
  ctx = { ts, cwd: ROOT, color: false, toolVersion: '5.0.0' }
})

describe('pretty', () => {
  it('prints code frames, documentation links and a summary', () => {
    expect(pretty(RESULT, ctx)).toMatchInlineSnapshot(`
      "src/my pages/home.tsx:1:1 - error TS88601: Content may introduce an XSS vulnerability and must be marked with the \`safe\` attribute.
      See https://html.kitajs.org/TS88601

      1 user
        ~~~~

      src/pages/login.tsx:3:6 - error TS88601: Content may introduce an XSS vulnerability and must be marked with the \`safe\` attribute.
      See https://html.kitajs.org/TS88601

      3     {user.name}
             ~~~~~~~~~

      src/pages/login.tsx:4:11 - warning TS88604: The \`safe\` attribute is unused in this context.
      See https://html.kitajs.org/TS88604

      4     <span safe>{1}</span>
                  ~~~~

      src/pages/login.tsx:5:5 - error TS88602: The \`safe\` attribute causes this content to be escaped more than once.
      See https://html.kitajs.org/TS88602

        5     <p safe>
              ~~~~~~~~
        6       <b />
          ~~~~~~~~~~~
      ... 
        9       <s />
          ~~~~~~~~~~~
       10     </p>
          ~~~~~~~~

      Found 3 errors and 1 warning in 2 files.
      "
    `)
  })

  it('prints ANSI colors only when enabled', () => {
    expect(pretty(RESULT, { ...ctx, color: true })).toContain('\x1b[')
    expect(pretty(RESULT, ctx)).not.toContain('\x1b[')
  })

  it('prints a success line when there are no diagnostics', () => {
    expect(pretty(CLEAN, ctx)).toBe('No XSS issues found in 1 file.\n')
    expect(pretty({ ...CLEAN, filesChecked: 4 }, ctx)).toBe(
      'No XSS issues found in 4 files.\n'
    )
  })

  it('writes headers the tsc problem matcher ignores when asked to', () => {
    const matcher =
      /^([^\s].*)[(:](\d+)[,:](\d+)(?:\):\s+|\s+-\s+)(error|warning|info)\s+TS(\d+)\s*:\s*(.*)$/

    for (const color of [false, true]) {
      const output = pretty(RESULT, { ...ctx, color, avoidTscMatcher: true })
      const lines = output.split('\n').map((line) => line.replace(/\x1b\[\d+m/g, ''))

      expect(lines).toContain(
        'src/pages/login.tsx:3:6: error TS88601: Content may introduce an XSS vulnerability and must be marked with the `safe` attribute.'
      )
      expect(lines).toContain(
        'src/pages/login.tsx:4:11: warning TS88604: The `safe` attribute is unused in this context.'
      )

      for (const line of lines) {
        expect(line).not.toMatch(matcher)
      }
    }
  })

  it('pluralizes the summary', () => {
    const one = {
      ...RESULT,
      diagnostics: RESULT.diagnostics.filter((d) => d.severity === 'warning')
    }
    expect(pretty(one, ctx).trimEnd().split('\n').at(-1)).toBe(
      'Found 1 warning in 1 file.'
    )
  })
})

describe('tsc', () => {
  it('prints one tsc-compatible line per diagnostic without links', () => {
    expect(tsc(RESULT, ctx)).toMatchInlineSnapshot(`
      "src/my pages/home.tsx(1,1): error TS88601: Content may introduce an XSS vulnerability and must be marked with the \`safe\` attribute.
      src/pages/login.tsx(3,6): error TS88601: Content may introduce an XSS vulnerability and must be marked with the \`safe\` attribute.
      src/pages/login.tsx(4,11): warning TS88604: The \`safe\` attribute is unused in this context.
      src/pages/login.tsx(5,5): error TS88602: The \`safe\` attribute causes this content to be escaped more than once.
      "
    `)
  })

  it('matches the VS Code $tsc problem matcher', () => {
    // Pattern of the built-in $tsc problem matcher
    const matcher =
      /^([^\s].*)[(:](\d+)[,:](\d+)(?:\):\s+|\s+-\s+)(error|warning|info)\s+TS(\d+)\s*:\s*(.*)$/

    for (const line of tsc(RESULT, ctx).trimEnd().split('\n')) {
      expect(line).toMatch(matcher)
    }
  })

  it('prints nothing when there are no diagnostics', () => {
    expect(tsc(CLEAN, ctx)).toBe('')
  })
})

describe('json', () => {
  const schema = JSON.parse(
    // Generated from src/reporters/json-report.ts by `pnpm build`
    fs.readFileSync(path.join(TEST_DIR, '../dist/check-report.schema.json'), 'utf8')
  )

  it('matches the schema generated from its types', () => {
    expect(validate(schema, JSON.parse(json(RESULT, ctx)))).toEqual([])
    expect(validate(schema, JSON.parse(json(CLEAN, ctx)))).toEqual([])
  })

  it('uses 1-based positions, relative forward-slash paths and a summary', () => {
    const report = JSON.parse(json(RESULT, ctx)) as JsonReport

    expect(report.projects).toEqual(['tsconfig.json'])
    expect(report.summary).toEqual({ filesChecked: 3, errors: 3, warnings: 1 })
    expect(report.diagnostics.find((d) => d.code === UnusedSafe.code)).toEqual({
      file: 'src/pages/login.tsx',
      code: 88604,
      id: 'TS88604',
      severity: 'warning',
      message: UnusedSafe.message,
      url: 'https://html.kitajs.org/TS88604',
      start: { line: 4, column: 11, offset: 53 },
      end: { line: 4, column: 15, offset: 57 }
    })
  })

  it('prints a report on success too', () => {
    const report = JSON.parse(json(CLEAN, ctx)) as JsonReport

    expect(report.diagnostics).toEqual([])
    expect(report.tool).toEqual({ name: '@kitajs/html-cli', version: '5.0.0' })
    expect(report.typescript).toBe('7.1.0')
  })

  it('validator rejects reports that break the schema', () => {
    const report = JSON.parse(json(RESULT, ctx))
    report.version = 1
    report.diagnostics[0].severity = 'info'
    report.diagnostics[0].id = '88601'
    delete report.summary.errors

    expect(validate(schema, report).sort()).toEqual(
      [
        '$.version: not allowed',
        '$.summary.errors: required',
        '$.diagnostics[0].id: does not match ^TS\\d+$',
        '$.diagnostics[0].severity: expected one of error, warning'
      ].sort()
    )
  })
})

describe('github', () => {
  it('prints one workflow command per finding', () => {
    expect(github(RESULT, ctx)).toMatchInlineSnapshot(`
      "::error file=src/my pages/home.tsx,line=1,col=1,endLine=1,endColumn=5,title=TS88601::Content may introduce an XSS vulnerability and must be marked with the \`safe\` attribute. See https://html.kitajs.org/TS88601
      ::error file=src/pages/login.tsx,line=3,col=6,endLine=3,endColumn=15,title=TS88601::Content may introduce an XSS vulnerability and must be marked with the \`safe\` attribute. See https://html.kitajs.org/TS88601
      ::warning file=src/pages/login.tsx,line=4,col=11,endLine=4,endColumn=15,title=TS88604::The \`safe\` attribute is unused in this context. See https://html.kitajs.org/TS88604
      ::error file=src/pages/login.tsx,line=5,col=5,endLine=10,endColumn=9,title=TS88602::The \`safe\` attribute causes this content to be escaped more than once. See https://html.kitajs.org/TS88602
      "
    `)
  })

  it('prints nothing the setup-node tsc problem matcher would annotate again', () => {
    // Pattern of the tsc problem matcher registered by actions/setup-node
    const matcher =
      /^([^\s].*)[(:](\d+)[,:](\d+)(?:\):\s+|\s+-\s+)(error|warning|info)\s+TS(\d+)\s*:\s*(.*)$/

    for (const line of github(RESULT, ctx).trimEnd().split('\n')) {
      expect(line).not.toMatch(matcher)
    }
  })

  it('makes annotation paths relative to GITHUB_WORKSPACE', () => {
    const output = github(RESULT, {
      ...ctx,
      cwd: path.join(ROOT, 'src'),
      workspace: ROOT
    })

    expect(output).toContain('::error file=src/pages/login.tsx,')
  })

  it('escapes workflow command data and properties', () => {
    expect(escapeData('100% done\r\nnext')).toBe('100%25 done%0D%0Anext')
    expect(escapeProperty('a:b,c%')).toBe('a%3Ab%2Cc%25')

    const output = github(
      {
        ...RESULT,
        diagnostics: [{ ...RESULT.diagnostics[0]!, fileName: file('src/a,b:c.tsx') }]
      },
      ctx
    )

    expect(output).toContain('file=src/a%2Cb%3Ac.tsx,')
  })

  it('prints nothing when there are no diagnostics', () => {
    expect(github(CLEAN, ctx)).toBe('')
  })
})
