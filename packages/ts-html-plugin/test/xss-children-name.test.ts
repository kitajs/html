import { expect, it } from 'vitest'
import { ComponentXss, Xss } from '../src/errors'
import { TSLangServer } from './util/lang-server'

/**
 * Identifiers named `children` and `.children` property accesses are only treated as
 * PropsWithChildren JSX when their type is not raw string content. Each case below
 * renders a string at runtime and must be flagged.
 */
it('identifier named `children` holding a string is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test() {
      const children = html;
      return <div>{children}</div>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 36, offset: 20 },
      end: { line: 36, offset: 28 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('`.children` property access on `any` is flagged (any is never safe)', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test(props: { data: any }) {
      return <div>{props.data.children}</div>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 35, offset: 20 },
      end: { line: 35, offset: 39 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('`.children` property access with plain string type is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  // e.g. a CMS/DB field named `children` holding raw user content
  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    declare const cms: { entry: { children: string } };

    export default <div>{cms.entry.children}</div>;
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 36, offset: 26 },
      end: { line: 36, offset: 44 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('component children: identifier named `children` holding a string is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test() {
      const children = html;
      return <Component>{children}</Component>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 36, offset: 26 },
      end: { line: 36, offset: 34 },
      text: ComponentXss.message,
      code: ComponentXss.code,
      category: 'error'
    }
  ])
})

it('optional `children` prop typed as string is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  // `children?: string` is `string | undefined`, not Html.Children
  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test(props: { children?: string }) {
      return <div>{props.children}</div>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 35, offset: 20 },
      end: { line: 35, offset: 34 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('`children` prop typed as Promise<string> is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  // Thenables are awaited by the runtime and the resolved string is rendered raw
  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test(props: { children: Promise<string> }) {
      return <div>{props.children}</div>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 35, offset: 20 },
      end: { line: 35, offset: 34 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('`children` prop typed as a tuple containing a string is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test(props: { children: [string, number] }) {
      return <div>{props.children}</div>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 35, offset: 20 },
      end: { line: 35, offset: 34 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})
