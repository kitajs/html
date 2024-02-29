import assert from 'node:assert';
import { it } from 'node:test';
import { UnusedSafe } from '../src/errors';
import { TSLangServer } from './util/lang-server';

it('Warn on unused `safe` tags', async () => {
  await using server = new TSLangServer(__dirname);

  const diagnostics = await server.openWithDiagnostics/* tsx */ `
    export default (
      <>
        <div safe>
        {number} {safeString}
        </div>
        <div safe>{safeString}</div>
        <div safe>{promiseNumber}</div>
        <div safe> </div>
        <div safe></div>
      </>
    );
`;

  assert.deepStrictEqual(diagnostics.body, [
    {
      start: { line: 36, offset: 14 },
      end: { line: 36, offset: 18 },
      text: UnusedSafe.message,
      code: UnusedSafe.code,
      category: 'warning'
    },
    {
      start: { line: 39, offset: 14 },
      end: { line: 39, offset: 18 },
      text: UnusedSafe.message,
      code: UnusedSafe.code,
      category: 'warning'
    },
    {
      start: { line: 40, offset: 14 },
      end: { line: 40, offset: 18 },
      text: UnusedSafe.message,
      code: UnusedSafe.code,
      category: 'warning'
    },
    {
      start: { line: 41, offset: 14 },
      end: { line: 41, offset: 18 },
      text: UnusedSafe.message,
      code: UnusedSafe.code,
      category: 'warning'
    },
    {
      start: { line: 42, offset: 14 },
      end: { line: 42, offset: 18 },
      text: UnusedSafe.message,
      code: UnusedSafe.code,
      category: 'warning'
    }
  ]);
});
