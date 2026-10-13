import { Args, Command, Errors, Flags, type Interfaces } from '@oclif/core'
import { check, CheckError, loadProjectTypeScript } from '../../check.js'
import { exitCodeFor } from '../../diagnostic.js'
import { annotations, github } from '../../reporters/github.js'
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

Without --format, the output is pretty. Inside GitHub Actions (GITHUB_ACTIONS=true) it is pretty plus GitHub annotations, so findings show up on the pull request without extra configuration.

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
        'Print only GitHub annotations and plain lines (inside GitHub Actions, omitting --format already adds annotations to the pretty output)',
      command: '<%= config.bin %> <%= command.id %> --format github'
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
      helpValue: '<path>',
      description: 'tsconfig.json file or directory to check. Repeatable. Defaults to "."'
    }),
    format: Flags.option({
      char: 'f',
      options: ['pretty', 'tsc', 'json', 'github'] as const,
      description:
        'Output format. Defaults to pretty, plus GitHub annotations inside GitHub Actions.'
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

      // An explicit --format always wins, so `--format pretty` turns the annotations off
      const annotate = !flags.format && process.env.GITHUB_ACTIONS === 'true'

      const context = {
        ts,
        cwd,
        color: resolveColor(flags.color, process.env, !!process.stdout.isTTY),
        workspace: process.env.GITHUB_WORKSPACE,
        toolVersion: this.config.version,
        avoidTscMatcher: annotate
      }

      let output = reporters[flags.format ?? 'pretty'](result, context)

      if (annotate) {
        output = annotations(result, context) + output
      }

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
