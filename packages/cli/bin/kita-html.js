#!/usr/bin/env node

import { execute } from '@oclif/core'
import { skipWindowsShellDetection } from '../dist/cli/environment.js'

skipWindowsShellDetection(process.argv.slice(2))

await execute({ dir: import.meta.url })
