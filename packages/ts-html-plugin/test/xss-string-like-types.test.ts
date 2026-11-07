import { expect, it } from 'vitest'
import { ComponentXss, Xss } from '../src/errors'
import { TSLangServer } from './util/lang-server'

/**
 * String-like types without the `TypeFlags.String` flag must still be treated as strings:
 * generic type parameters, template literal types, intrinsic string mappings and
 * `unknown`. Each case below renders a string at runtime and must be flagged.
 */
it('generic type parameter with string constraint is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test<T extends string>(props: { bio: T }) {
      return <div>{props.bio}</div>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 35, offset: 20 },
      end: { line: 35, offset: 29 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('template literal type child is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test(props: { id: string }) {
      const bio: ${'`<b>${string}</b>`'} = ${'`<b>${props.id}</b>`'};
      return <div>{bio}</div>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 36, offset: 20 },
      end: { line: 36, offset: 23 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('intrinsic string mapping type (Uppercase<string>) child is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test(props: { bio: Uppercase<string> }) {
      return <div>{props.bio}</div>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 35, offset: 20 },
      end: { line: 35, offset: 29 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('`unknown` typed child is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  // The @ts-ignore suppresses TS2322 (unknown is not assignable to Children) to isolate
  // the plugin diagnostic. Transpile-only builds (esbuild/tsgo/babel) strip types
  // without performing that check, so the plugin is the only safety net there.
  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test() {
      const content = JSON.parse('"<img src=x onerror=alert(1)>"') as unknown;
      // @ts-ignore - transpile-only builds strip types without performing this check
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

it('component children: generic type parameter is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export function Test<T extends string>(props: { bio: T }) {
      return <Component>{props.bio}</Component>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 35, offset: 26 },
      end: { line: 35, offset: 35 },
      text: ComponentXss.message,
      code: ComponentXss.code,
      category: 'error'
    }
  ])
})

it('unresolved conditional type holding a string is flagged', async () => {
  await using server = new TSLangServer(__dirname)

  // Conditional types without the String flag are resolved through their constraint
  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    type MaybeString<T> = T extends string ? string : string;

    export function Test<T>(props: { value: MaybeString<T> }) {
      return <div>{props.value}</div>;
    }
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 37, offset: 20 },
      end: { line: 37, offset: 31 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})
