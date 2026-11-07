import { cpSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Copies the repo's `skills/kita-html/` source of truth into
// `packages/html/skills/kita-html/` so pnpm agent skills
// (https://pnpm.io/agent-skills) ships with the published package.
//
// Runs on `prepack`, which covers `pnpm publish` and `pnpm pack`.
// Kept as a node script (instead of `cp -r`) for Windows CI compat.
const here = dirname(fileURLToPath(import.meta.url))
const pkgDir = join(here, '..')
const src = join(pkgDir, '..', '..', 'skills', 'kita-html')
const dest = join(pkgDir, 'skills', 'kita-html')

rmSync(dest, { recursive: true, force: true })
cpSync(src, dest, { recursive: true })
