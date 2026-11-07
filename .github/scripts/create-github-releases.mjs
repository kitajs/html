// Creates a git tag and GitHub release for every package listed in
// pnpm-publish-summary.json (written by `pnpm publish -r --report-summary`),
// using the matching CHANGELOG.md section as release notes.

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const summaryPath = 'pnpm-publish-summary.json'

if (!existsSync(summaryPath)) {
  console.log('No publish summary found, skipping.')
  process.exit(0)
}

const { publishedPackages } = JSON.parse(readFileSync(summaryPath, 'utf8'))

const dirs = new Map()
for (const dir of readdirSync('packages')) {
  const manifest = join('packages', dir, 'package.json')
  if (existsSync(manifest)) {
    dirs.set(JSON.parse(readFileSync(manifest, 'utf8')).name, join('packages', dir))
  }
}

function changelogSection(dir, version) {
  const file = join(dir, 'CHANGELOG.md')
  if (!dir || !existsSync(file)) return ''

  const lines = readFileSync(file, 'utf8').split('\n')
  const start = lines.findIndex((line) => line.trim() === `## ${version}`)
  if (start === -1) return ''

  const end = lines.findIndex((line, i) => i > start && line.startsWith('## '))
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .join('\n')
    .trim()
}

for (const { name, version } of publishedPackages) {
  const tag = `${name}@${version}`
  const args = [
    'release',
    'create',
    tag,
    '--target',
    process.env.GITHUB_SHA,
    '--title',
    tag
  ]

  if (version.includes('-')) args.push('--prerelease')

  args.push('--notes', changelogSection(dirs.get(name), version) || tag)

  console.log(`Creating release ${tag}`)
  execFileSync('gh', args, { stdio: 'inherit' })
}
