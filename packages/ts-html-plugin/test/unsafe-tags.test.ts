import assert from 'node:assert';
import { it } from 'node:test';
import { Xss } from '../src/errors';
import { TSLangServer } from './util/lang-server';

it('Detect xss prone usage', async () => {
  await using server = new TSLangServer(__dirname);

  const diagnostics = await server.openWithDiagnostics/* tsx */ `
    export default (
      <>
        <div>
        <div>{html}</div>
        <div>{union}</div>
        <div>
          {['a', 'b', 'c'].map((i) => (
            <>{i}</>
          ))}
          {['a', 'b', 'c'].map((i) => (
            <div>{i}</div>
          ))}
        </div>
        <div>{['a', 'b', 'c'].map((i) => i)}</div>
        <div>{['a', 'b', 'c'].map((safeI) => safeI)}</div>
      </div>
      </>
    );
`;

  assert.deepStrictEqual(diagnostics.body, [
    {
      start: { line: 37, offset: 15 },
      end: { line: 37, offset: 19 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 38, offset: 15 },
      end: { line: 38, offset: 20 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 41, offset: 16 },
      end: { line: 41, offset: 17 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 44, offset: 19 },
      end: { line: 44, offset: 20 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 47, offset: 15 },
      end: { line: 47, offset: 44 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 48, offset: 15 },
      end: { line: 48, offset: 52 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ]);
});
