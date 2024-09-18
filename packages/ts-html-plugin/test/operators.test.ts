import assert from 'node:assert';
import { it } from 'node:test';
import { DoubleEscape, Xss } from '../src/errors';
import { TSLangServer } from './util/lang-server';

it('Operators are evaluated normally', async () => {
  await using server = new TSLangServer(__dirname);

  const diagnostics = await server.openWithDiagnostics/* tsx */ `

    function CustomComponent(props: { name: string }) {
      return ${'<div>{Html.e`${props.name}`}</div>'}
    }

    export default (
      <>
        <div>{boolean ? number : html}</div>
        <div>{boolean ? number : (html)}</div>
        <div>{boolean ? number : <div>{html}</div>}</div>
        <div>{boolean ? (number) : (<div><div>{html}</div></div>)}</div>

        <div>{number && html}</div>
        <div>{number && (html)}</div>
        <div>{number && (<div><div>{html}</div></div>)}</div>
        <div>{number && <div>{html}</div>}</div>

        <div>{html || safeString}</div>
        <div>{(html) || safeString}</div>
        <div>{safeString || html}</div>
        <div>{(safeString) || html}</div>
        <div>{safeString || (html)}</div>
        <div>{<div>{html}</div> || safeString}</div>
        <div>{(<div><div>{html}</div></div>) || safeString}</div>

        {/* safe */}
        <div safe>{html || safeString}</div>
        <div safe>{(html) || safeString}</div>
        <div safe>{safeString || html}</div>
        <div safe>{(safeString) || html}</div>
        <div safe>{safeString || (html)}</div>
        <div safe>{<div>{html}</div> || safeString}</div>
        <div safe>{(<div><div>{html}</div></div>) || safeString}</div>

        <div>{boolean ? number : <div>Safe!</div>}</div>
        <div>{boolean ? number : (<div>Safe!</div>)}</div>
        <div>{boolean ? (number) : (<div><div>Deep safe!</div></div>)}</div>
        <div>{boolean && (<CustomComponent name="boolean" />)}</div>
        <div>{boolean && <CustomComponent name="boolean" />}</div>
        <div>{boolean ? <CustomComponent name="boolean" /> : null}</div>

        <div>{number && <div>Safe!</div>}</div>
        <div>{number && (<div>Safe!</div>)}</div>
        <div>{number && (<div><div>Deep safe!</div></div>)}</div>
        <div>{number && (<CustomComponent name="number" />)}</div>
        <div>{number && <CustomComponent name="number" />}</div>
        <div>{number ? <CustomComponent name="number" /> : null}</div>

        <div>{<div>Safe!</div> || safeString}</div>
        <div>{(<div>Safe!</div>) || safeString}</div>
        <div>{(<div><div>Deep safe!</div></div>) || safeString}</div>

        {/* Booleans */}
        <div>{html !== 'Html'}</div>
        <div>{html >= 'Html'}</div>
        <div>{html <= 'Html'}</div>
        <div>{html > 'Html'}</div>
        <div>{html < 'Html'}</div>
        <div>{'html' in ({ html })}</div>
        <div>{new String(html) instanceof String}</div>
      </>
    );
`;

  assert.deepStrictEqual(diagnostics.body, [
    {
      start: { line: 40, offset: 34 },
      end: { line: 40, offset: 38 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 41, offset: 35 },
      end: { line: 41, offset: 39 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 42, offset: 40 },
      end: { line: 42, offset: 44 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 43, offset: 48 },
      end: { line: 43, offset: 52 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },

    {
      start: { line: 45, offset: 25 },
      end: { line: 45, offset: 29 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 46, offset: 26 },
      end: { line: 46, offset: 30 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 47, offset: 37 },
      end: { line: 47, offset: 41 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 48, offset: 31 },
      end: { line: 48, offset: 35 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },

    {
      start: { line: 50, offset: 15 },
      end: { line: 50, offset: 19 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 51, offset: 16 },
      end: { line: 51, offset: 20 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 52, offset: 29 },
      end: { line: 52, offset: 33 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 53, offset: 31 },
      end: { line: 53, offset: 35 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 54, offset: 30 },
      end: { line: 54, offset: 34 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 55, offset: 21 },
      end: { line: 55, offset: 25 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 56, offset: 27 },
      end: { line: 56, offset: 31 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 64, offset: 26 },
      end: { line: 64, offset: 30 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 64, offset: 14 },
      end: { line: 64, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    {
      start: { line: 65, offset: 32 },
      end: { line: 65, offset: 36 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ]);
});
