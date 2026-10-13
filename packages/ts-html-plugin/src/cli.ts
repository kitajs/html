import fs from 'node:fs'
import path from 'node:path'
import { parseArgs, styleText } from 'node:util'
import ts from 'typescript'
import { recursiveDiagnoseJsxElements } from './util'

const { version } = require('../package.json')

const deprecation =
  'xss-scan is deprecated. Upgrade to TypeScript 7.1+ and use "kita-html check" from @kitajs/html-cli: https://html.kitajs.org/guide/xss/cli-scanner'

const help = `

@kitajs/ts-html-plugin v${version} - A CLI tool & TypeScript LSP for finding XSS vulnerabilities in your TypeScript code.

Deprecated: ${deprecation}

Usage: xss-scan         [options] <file> <file>...
       ts-html-plugin   [options] <file> <file>...

Options:
  --cwd <path>          The current working directory to use (defaults to process.cwd())
  -p, --project <path>  The path to the tsconfig.json file to use (defaults to 'tsconfig.json')
  -s, --simplified      Use simplified diagnostics
  -h, --help            Show this help message
  --version             Show the version number
  <file> <file>...      The files to check (defaults to all files in tsconfig.json)

Examples:
  $ xss-scan
  $ xss-scan --cwd src
  $ xss-scan --project tsconfig.build.json
  $ xss-scan src/index.tsx src/App.tsx

Exit codes:
  0 - No XSS vulnerabilities were found
  1 - XSS vulnerabilities were found
  2 - Only warnings were found

`.trim()

function readCompilerOptions(tsconfigPath: string) {
  const { config, error } = ts.readConfigFile(tsconfigPath, ts.sys.readFile)

  if (error) {
    return { errors: [error] }
  }

  const { options, errors, fileNames } = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    path.dirname(tsconfigPath),
    undefined,
    tsconfigPath
  )

  if (errors.length) {
    return { errors }
  }

  return { options, fileNames, errors: undefined }
}

function prettyPrintErrorCount(diagnostics: ts.Diagnostic[], root: string) {
  const files = new Map<string, number>()

  // Counts the amount of errors per file
  for (const diagnostic of diagnostics) {
    if (!diagnostic.file) {
      continue
    }

    const file = files.get(diagnostic.file.fileName)

    if (file !== undefined) {
      files.set(diagnostic.file.fileName, file + 1)
      continue
    }

    files.set(diagnostic.file.fileName, 1)
  }

  if (files.size > 1) {
    console.error(
      styleText(
        'red',
        `Found a total of ${diagnostics.length} errors in ${files.size} files\n`
      )
    )
  }

  for (const [file, amount] of files.entries()) {
    console.error(
      styleText(
        'red',
        `Found ${amount} error${amount === 1 ? '' : 's'} in ${path.relative(root, file)}`
      )
    )
  }
}

function simplifiedOrStyled(
  simplified: boolean,
  format: Parameters<typeof styleText>[0],
  text: string
) {
  return simplified || !process.stderr.isTTY ? text : styleText(format, text)
}

function fileExists(p: string) {
  try {
    fs.statSync(p)
    return true
  } catch {
    return false
  }
}

function parseCliArgs() {
  try {
    return parseArgs({
      allowPositionals: true,
      options: {
        cwd: { type: 'string' },
        help: { type: 'boolean', short: 'h' },
        project: { type: 'string', short: 'p' },
        simplified: { type: 'boolean', short: 's' },
        version: { type: 'boolean' }
      }
    })
  } catch (error) {
    console.error(`${(error as Error).message}. Run --help for more information.`)
    return process.exit(1)
  }
}

export async function main() {
  // TypeScript 7 ships no JS compiler API, so `ts` only has `version` there
  if (typeof ts.createProgram !== 'function') {
    console.error(
      `TypeScript ${ts.version} has no compiler API, which xss-scan requires. Use "kita-html check" from @kitajs/html-cli with TypeScript 7.1+ instead.`
    )
    return process.exit(1)
  }

  const args = parseCliArgs()

  if (args.values.help) {
    console.log(help)
    return process.exit(0)
  }

  if (args.values.version) {
    console.log(version)
    return process.exit(0)
  }

  console.warn(simplifiedOrStyled(!!args.values.simplified, 'yellow', deprecation))

  const root = args.values.cwd ?? process.cwd()

  const tsconfigPath = path.resolve(args.values.project ?? 'tsconfig.json')

  const simplified = !!args.values.simplified

  const diagnosticFormatter =
    !process.stdout.isTTY || simplified
      ? ts.formatDiagnostics
      : ts.formatDiagnosticsWithColorAndContext

  if (!fileExists(tsconfigPath)) {
    console.error(
      !simplified
        ? styleText('red', `Could not find ${tsconfigPath}`)
        : `Could not find ${tsconfigPath}`
    )
    return process.exit(1)
  }

  const tsconfig = readCompilerOptions(tsconfigPath)

  const diagnosticHost: ts.FormatDiagnosticsHost = {
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getCanonicalFileName: (fileName) => fileName,
    getNewLine: () => ts.sys.newLine
  }

  if (tsconfig.errors) {
    console.error(diagnosticFormatter(tsconfig.errors, diagnosticHost))
    return process.exit(1)
  }

  let files = tsconfig.fileNames

  if (args.positionals.length) {
    // Prefer the files passed as arguments, otherwise use the files in tsconfig.json
    files = []

    for (const file of args.positionals) {
      if (!fileExists(file)) {
        console.error(
          !simplified
            ? styleText('red', `Could not find provided '${file}' file.`)
            : `Could not find provided '${file}' file.`
        )
        return process.exit(1)
      }

      if (!file.match(/(t|j)sx$/)) {
        console.warn(
          !simplified
            ? styleText('yellow', `Provided '${file}' file is not a TSX/JSX file.`)
            : `Provided '${file}' file is not a TSX/JSX file.`
        )
        continue
      }

      files.push(file)
    }
  }

  if (!files.length) {
    console.error(
      !simplified
        ? styleText('red', 'No files were found to check.')
        : 'No files were found to check.'
    )
    return process.exit(1)
  }

  const program = ts.createProgram(files, tsconfig.options)
  const typeChecker = program.getTypeChecker()
  const sources = program.getSourceFiles()

  const diagnostics: ts.Diagnostic[] = []

  for (const source of sources) {
    const filename = source.fileName

    // Not a tsx file, so don't do anything
    if (!filename.match(/(t|j)sx$/)) {
      continue
    }

    // Deduplication compares positions only, so each file needs its own array or a
    // finding at the same offset in another file would be dropped
    const fileDiagnostics: ts.Diagnostic[] = []

    ts.forEachChild(source, function loopSourceNodes(node) {
      recursiveDiagnoseJsxElements(ts, node, typeChecker, fileDiagnostics)
    })

    diagnostics.push(...fileDiagnostics)
  }

  if (diagnostics.length) {
    const hasError = diagnostics.some(
      (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
    )

    console.error(diagnosticFormatter(diagnostics, diagnosticHost))

    if (!simplified) {
      prettyPrintErrorCount(diagnostics, root)
    }

    // process.exit() would drop buffered output when stderr is a pipe
    process.exitCode = hasError ? 1 : 2
    return
  }

  console.log(
    styleText('green', `No XSS vulnerabilities found in ${files.length} files!`)
  )
  process.exitCode = 0
}
