import assert from 'node:assert';
import { it } from 'node:test';
import { Xss } from '../src/errors';
import { TSLangServer } from './util/lang-server';

it('Operators are evaluated normally', async () => {
  await using server = new TSLangServer(__dirname);

  const diagnostics = await server.openWithDiagnostics/* tsx */ `
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
        <div>{<div>{html}</div> || safeString}</div>
        <div>{(<div><div>{html}</div></div>) || safeString}</div>

        {/* safe */}
        <div>{boolean ? number : <div>Safe!</div>}</div>
        <div>{boolean ? number : (<div>Safe!</div>)}</div>
        <div>{boolean ? (number) : (<div><div>Deep safe!</div></div>)}</div>

        <div>{number && <div>Safe!</div>}</div>
        <div>{number && (<div>Safe!</div>)}</div>
        <div>{number && (<div><div>Deep safe!</div></div>)}</div>

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
      start: { line: 36, offset: 34 },
      end: { line: 36, offset: 38 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 37, offset: 35 },
      end: { line: 37, offset: 39 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 38, offset: 40 },
      end: { line: 38, offset: 44 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 39, offset: 48 },
      end: { line: 39, offset: 52 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },

    {
      start: { line: 41, offset: 25 },
      end: { line: 41, offset: 29 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 42, offset: 26 },
      end: { line: 42, offset: 30 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 43, offset: 37 },
      end: { line: 43, offset: 41 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 44, offset: 31 },
      end: { line: 44, offset: 35 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },

    {
      start: { line: 48, offset: 21 },
      end: { line: 48, offset: 25 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 49, offset: 27 },
      end: { line: 49, offset: 31 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ]);
});
