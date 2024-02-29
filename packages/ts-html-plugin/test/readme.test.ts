import assert from 'node:assert';
import { it } from 'node:test';
import { Xss } from '../src/errors';
import { TSLangServer } from './util/lang-server';

it('Ensures readme checks will throw error', async () => {
  await using server = new TSLangServer(__dirname);

  const diagnostics = await server.openWithDiagnostics/* tsx */ `
    export default (
      <>
        <div>{String.name}</div>
      </>
    );
`;

  assert.deepStrictEqual(diagnostics.body, [
    {
      category: 'error',
      code: Xss.code,
      end: { line: 36, offset: 26 },
      start: { line: 36, offset: 15 },
      text: Xss.message
    }
  ]);
});
