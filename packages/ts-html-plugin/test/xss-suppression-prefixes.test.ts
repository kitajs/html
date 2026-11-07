import { expect, it } from 'vitest'
import { Xss } from '../src/errors'
import { TSLangServer } from './util/lang-server'

/**
 * Name-based suppressions only apply to their documented forms: `safe`-prefixed camelCase
 * identifiers, `escapeHtml()`/`escape()` calls, the `e` template tag, and the `as 'safe'`
 * cast. Lookalikes such as `safetyRating`, `escaped`, `escapeRoom()` and casts to other
 * string literals render raw at runtime and must be flagged.
 */
it('`safe`-prefixed variable like `safetyRating` is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test() {
      const safetyRating = html;
      return <div>{safetyRating}</div>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 36, offset: 20 },
      end: { line: 36, offset: 32 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('`escape`-prefixed identifier that was never escaped is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test() {
      const escaped = html;
      return <div>{escaped}</div>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 36, offset: 20 },
      end: { line: 36, offset: 27 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('function named `escape*` that does not escape is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    function escapeRoom(input: string) {
      return input;
    }

    export default <div>{escapeRoom(html)}</div>;
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 38, offset: 26 },
      end: { line: 38, offset: 42 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('cast to an arbitrary string literal (not `safe`) is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export default <div>{html as 'not-a-safe-marker'}</div>;
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 34, offset: 22 },
      end: { line: 34, offset: 49 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('documented suppression techniques still work', async () => {
  await using server = new TSLangServer(__dirname)

  // Control: `safe`-prefixed camelCase names, escapeHtml() calls and the `as 'safe'`
  // cast must remain valid suppression techniques.
  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test() {
      const safeHtml = html;
      return <div>{safeHtml}</div>;
    }

    export function Test2() {
      return <div>{Html.escapeHtml(html)}</div>;
    }

    export default <div>{html as 'safe'}</div>;
  `

  expect(diagnostics.body).toEqual([])
})

it('generic escapeHtml calls still suppress', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    declare function escapeHtml<T>(input: T): string;

    export default <div>{escapeHtml<string>(html)}</div>;
  `

  expect(diagnostics.body).toEqual([])
})

it('literal cast wrapped in extra parentheses is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export default <div>{((html as 'not-a-safe-marker'))}</div>;
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 34, offset: 24 },
      end: { line: 34, offset: 51 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})
