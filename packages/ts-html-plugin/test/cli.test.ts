import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { expect, it } from 'vitest'

const CLI = path.resolve(__dirname, '../bin/index.js')

function createProject(tmpDir: string, tsconfig: object, files: Record<string, string>) {
  fs.mkdirSync(tmpDir, { recursive: true })

  for (const [file, content] of Object.entries(files)) {
    const filePath = path.join(tmpDir, file)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, content)
  }

  fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2))

  return tmpDir
}

it('handles rootDirs with outDir without crashing', () => {
  const tmpDir = path.join(__dirname, '.tmp-rootdirs')

  createProject(
    tmpDir,
    {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        rootDirs: ['src', 'profiles'],
        outDir: 'dist',
        jsx: 'react-jsx',
        jsxImportSource: '@kitajs/html'
      }
    },
    {
      'src/index.tsx': 'export default <div>Hello</div>;\n',
      'profiles/profile.tsx': 'export const profile = <div>Profile</div>;\n'
    }
  )

  try {
    const output = execFileSync('node', [CLI], {
      cwd: tmpDir,
      encoding: 'utf-8',
      stdio: 'pipe'
    })

    expect(output).toContain('No XSS vulnerabilities found')
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})

it('exits non-zero when tsconfig is missing', () => {
  const tmpDir = path.join(__dirname, '.tmp-missing')
  fs.mkdirSync(tmpDir, { recursive: true })

  try {
    expect(() =>
      execFileSync('node', [CLI, '--project', 'missing.json'], {
        cwd: tmpDir,
        encoding: 'utf-8',
        stdio: 'pipe'
      })
    ).toThrow()
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})

it('prints a deprecation notice pointing to kita-html check', () => {
  const tmpDir = path.join(__dirname, '.tmp-deprecation')

  createProject(
    tmpDir,
    { compilerOptions: { jsx: 'react-jsx', jsxImportSource: '@kitajs/html' } },
    { 'src/index.tsx': 'export default <div>Hello</div>;\n' }
  )

  try {
    const result = spawnSync('node', [CLI], { cwd: tmpDir, encoding: 'utf-8' })

    expect(result.status).toBe(0)
    expect(result.stderr).toContain('xss-scan is deprecated')
    expect(result.stderr).toContain('kita-html check')
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})

it('does not truncate large reports written to a pipe', () => {
  const tmpDir = path.join(__dirname, '.tmp-large')
  const count = 3000
  const body = Array.from({ length: count }, () => '    {input}').join('\n')

  createProject(
    tmpDir,
    {
      compilerOptions: { jsx: 'react-jsx', jsxImportSource: '@kitajs/html', strict: true }
    },
    {
      'src/index.tsx': `declare const input: string\nexport default (\n  <div>\n${body}\n  </div>\n);\n`
    }
  )

  try {
    const result = spawnSync('node', [CLI, '--simplified'], {
      cwd: tmpDir,
      encoding: 'utf-8',
      maxBuffer: 64 * 1024 * 1024
    })

    expect(result.status).toBe(1)
    expect(result.stderr.match(/error TS88601/g)).toHaveLength(count)
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})

it('reports findings at the same position in different files', () => {
  const tmpDir = path.join(__dirname, '.tmp-same-position')
  const source = 'declare const input: string\nexport default <div>{input}</div>;\n'

  createProject(
    tmpDir,
    {
      compilerOptions: { jsx: 'react-jsx', jsxImportSource: '@kitajs/html', strict: true }
    },
    { 'src/a.tsx': source, 'src/b.tsx': source }
  )

  try {
    const result = spawnSync('node', [CLI, '--simplified'], {
      cwd: tmpDir,
      encoding: 'utf-8'
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('a.tsx(2,22): error TS88601')
    expect(result.stderr).toContain('b.tsx(2,22): error TS88601')
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})

it('checks arrays inside recursive aliases by their element types', () => {
  // Deferred type references are not resolved before the scan, unlike in tsserver
  const tmpDir = path.join(__dirname, '.tmp-recursive')

  createProject(
    tmpDir,
    {
      compilerOptions: { jsx: 'react-jsx', jsxImportSource: '@kitajs/html', strict: true }
    },
    {
      'src/index.tsx':
        'type Nested = number | Array<Nested | string>\ndeclare const nested: Nested\nexport default <div>{nested}</div>;\n'
    }
  )

  try {
    const result = spawnSync('node', [CLI, '--simplified'], {
      cwd: tmpDir,
      encoding: 'utf-8'
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('index.tsx(3,22): error TS88601')
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})
