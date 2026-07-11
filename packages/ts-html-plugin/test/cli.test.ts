import { execSync } from 'node:child_process'
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
    const output = execSync(`node ${CLI}`, {
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
      execSync(`node ${CLI} --project missing.json`, {
        cwd: tmpDir,
        encoding: 'utf-8',
        stdio: 'pipe'
      })
    ).toThrow()
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})
