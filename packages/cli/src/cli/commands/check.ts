import { Args, Command, Errors, Flags, type Interfaces } from '@oclif/core'
import { check, CheckError, loadProjectTypeScript } from '../../check.js'
import { exitCodeFor } from '../../diagnostic.js'
import { github } from '../../reporters/github.js'
import { json } from '../../reporters/json.js'
import { pretty } from '../../reporters/pretty.js'
import type { Reporter } from '../../reporters/shared.js'
import { tsc } from '../../reporters/tsc.js'
import { TypeScriptVersionError } from '../../typescript.js'
import { resolveColor } from '../color.js'

const reporters = { pretty, tsc, json, github } satisfies Record<string, Reporter>

export default class Check extends Command {
  static override summary = 'Find XSS vulnerabilities in TSX and JSX files.'

  static override description = `Type checks every TSX/JSX file of the given projects with TypeScript 7.1+ and reports content that may introduce XSS vulnerabilities (TS88601 to TS88604).

A solution-style tsconfig (only "references", no files) is expanded to every referenced project, like "tsc -b". Positional files narrow the report to those files; the program is still built from the tsconfig.

--format accepts several formats, comma separated or repeated, and prints them in order. It defaults to pretty, or to pretty,github inside GitHub Actions (GITHUB_ACTIONS=true), so findings show up on the pull request without extra configuration. json cannot be combined with other formats.

Exit codes: 0 when no issues are found, 1 when errors are found or the configuration is invalid, 2 when only warnings are found.`

  static override examples = [
    {
      description: 'Check the project in the current directory',
      command: '<%= config.bin %> <%= command.id %>'
    },
    {
      description: 'Check a monorepo through its solution tsconfig',
      command: '<%= config.bin %> <%= command.id %> -p tsconfig.json'
    },
    {
      description:
        'Pretty output plus GitHub annotations (already the default inside GitHub Actions)',
      command: '<%= config.bin %> <%= command.id %> --format pretty,github'
    },
    {
      description: 'Feed the VS Code $tsc problem matcher',
      command: '<%= config.bin %> <%= command.id %> --format tsc'
    },
    {
      description: 'Only report on staged files',
      command:
        '<%= config.bin %> <%= command.id %> src/pages/login.tsx src/pages/home.tsx'
    }
  ]

  // Files are variadic
  static override strict = false

  static override args = {
    files: Args.string({
      description:
        'TSX/JSX files to report on. Defaults to every TSX/JSX file in the projects.'
    })
  }

  static override flags = {
    project: Flags.string({
      char: 'p',
      multiple: true,
      // One value per occurrence, so positional files after the flag stay files
      multipleNonGreedy: true,
      helpValue: '<path>',
      description: 'tsconfig.json file or directory to check. Repeatable. Defaults to "."'
    }),
    format: Flags.option({
      char: 'f',
      options: ['pretty', 'tsc', 'json', 'github'] as const,
      multiple: true,
      multipleNonGreedy: true,
      delimiter: ',',
      description:
        'Output formats, comma separated or repeated. json must be used alone.',
      default: async () =>
        process.env.GITHUB_ACTIONS === 'true' ? ['pretty', 'github'] : ['pretty'],
      defaultHelp: async () => 'pretty (pretty,github in GitHub Actions)'
    })(),
    color: Flags.boolean({
      allowNo: true,
      description: 'Force ANSI colors on or off for the pretty format.'
    })
  }

  /**
   * Oclif exits 2 on flag and argument errors, which would read as "only warnings" in CI.
   * Usage errors exit 1 instead; the check's own exit codes (ExitError) pass through.
   */
  protected override async catch(error: Interfaces.CommandError): Promise<unknown> {
    if (
      error instanceof Errors.CLIError &&
      !(error instanceof Errors.ExitError) &&
      error.oclif.exit === 2
    ) {
      error.oclif.exit = 1
    }

    return super.catch(error)
  }

  public async run(): Promise<void> {
    const { argv, flags } = await this.parse(Check)
    const formats = [...new Set(flags.format)]

    // Anything else on stdout would make the JSON unparseable
    if (formats.includes('json') && formats.length > 1) {
      this.error('The json format cannot be combined with other formats.', { exit: 1 })
    }

    const cwd = process.cwd()
    const projects = { cwd, projects: flags.project }

    try {
      // Reporters use the formatters of the same TypeScript the check runs with
      const ts = await loadProjectTypeScript(projects)

      const result = await check({
        ...projects,
        typescript: ts,
        files: argv as string[],
        onNotice: (message) => this.warn(message)
      })

      const context = {
        ts,
        cwd,
        color: resolveColor(flags.color, process.env, !!process.stdout.isTTY),
        workspace: process.env.GITHUB_WORKSPACE,
        toolVersion: this.config.version,
        avoidTscMatcher: formats.includes('github')
      }

      const output = formats.map((format) => reporters[format](result, context)).join('')

      if (output) {
        process.stdout.write(output)
      }

      // this.exit() would make oclif call process.exit() without flushing stdout, which
      // truncates large reports written to a pipe
      process.exitCode = exitCodeFor(result.diagnostics)
    } catch (error) {
      if (error instanceof CheckError || error instanceof TypeScriptVersionError) {
        this.error(error.message, { exit: 1 })
      }

      throw error
    }
  }
}
