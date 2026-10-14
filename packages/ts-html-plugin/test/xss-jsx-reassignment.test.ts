import { expect, it } from 'vitest'
import { Xss } from '../src/errors'
import { TSLangServer } from './util/lang-server'

/**
 * JSX-initialized variables are only treated as safe while their use-site type is still
 * JSX-ish. After reassignment the narrowed type is `string`, which the runtime renders
 * unescaped and must be flagged.
 */
it('JSX-initialized variable later reassigned to a string is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test() {
      let content: JSX.Element | string = <b>ok</b>;
      content = html;
      return <div>{content}</div>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 37, offset: 20 },
      end: { line: 37, offset: 27 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('JSX-initialized variable is still allowed while its type stays JSX-ish', async () => {
  await using server = new TSLangServer(__dirname)

  // Control: without reassignment the narrowed type at the use site is JSX.Element,
  // so no diagnostic is expected.
  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test() {
      let content: JSX.Element | string = <b>ok</b>;
      return <div>{content}</div>;
    }
  `

  expect(diagnostics.body).toEqual([])
})

it('JSX-initialized variable reassigned inside a branch is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  // The use-site type is the `Element | string` union, not narrowed to Element
  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test(cond: boolean) {
      let content: JSX.Element | string = <b>ok</b>;
      if (cond) {
        content = html;
      }
      return <div>{content}</div>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 39, offset: 20 },
      end: { line: 39, offset: 27 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('JSX-initialized variable reassigned inside a closure is not flagged', async () => {
  await using server = new TSLangServer(__dirname)

  // Accepted limitation: writes inside nested functions cannot be statically ordered
  // against the render (deferred callbacks run after it), so this stays silent.
  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test() {
      let content: JSX.Element | string = <b>ok</b>;
      setTimeout(() => {
        content = html;
      });
      return <div>{content}</div>;
    }
  `

  expect(diagnostics.body).toEqual([])
})
