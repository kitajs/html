import * as Html from '@kitajs/html'
import * as JsxRuntime from '@kitajs/html/jsx-runtime'
import * as Suspense from '@kitajs/html/suspense'
import { text } from 'node:stream/consumers'
import vm from 'node:vm'
import { format } from 'prettier'
import ts from 'typescript'

/** Renders Kita JSX code at build time and extracts the HTML output */
export async function renderKitaCode(
  code: string,
  variableName: string = 'html'
): Promise<string> {
  // Export the html variable if it's declared as const/let without export
  // Match "const variableName" or "let variableName" at word boundaries
  const constRegex = new RegExp(`(^|\\n)(const|let)\\s+(${variableName})\\b`, 'g')
  code = code.replace(constRegex, '$1export $2 $3')

  // Transpile TypeScript/JSX to JavaScript (CommonJS for vm compatibility)
  const transpiled = ts.transpileModule(code, {
    reportDiagnostics: false,
    jsDocParsingMode: ts.JSDocParsingMode.ParseNone,
    moduleName: 'kita-code-block',
    compilerOptions: {
      types: ['node'],
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      jsxImportSource: '@kitajs/html',
      esModuleInterop: true
    }
  })

  const context = vm.createContext({
    Html,
    html: undefined,
    exports: {},
    module: { exports: {} },
    require: (id: string) => {
      if (id === '@kitajs/html/jsx-runtime') {
        return JsxRuntime
      }
      if (id === '@kitajs/html') {
        return Html
      }
      if (id === '@kitajs/html/suspense') {
        return Suspense
      }
      throw new Error(`Cannot require '${id}' in sandboxed code`)
    }
  })

  // Wrap the transpiled CommonJS in an async IIFE so examples can use top-level await.
  await vm.runInContext(
    `(async () => {\n${transpiled.outputText}\n})().catch(console.error)`,
    context,
    {
      filename: 'kita-code-block.js'
    }
  )

  // Extract the variable from the context
  let htmlOutput: string =
    variableName === 'stream'
      ? await text(context.exports[variableName])
      : await context.exports[variableName]

  if (htmlOutput === undefined) {
    throw new Error(
      `Expected code to have a variable named "${variableName}" with the HTML output. Example: const ${variableName} = <div>Hello</div>;`
    )
  }

  // Replace suspense script with placeholder so giant scripts don't bork formatting and readability
  htmlOutput = htmlOutput.replace(
    Suspense.SuspenseScript,
    '<!-- SuspenseScript omitted for brevity -->\n'
  )

  // Format HTML with prettier
  const formatted = await format(htmlOutput, {
    parser: 'html',
    printWidth: 80,
    tabWidth: 2,
    useTabs: false
  })

  return formatted.trim()
}
