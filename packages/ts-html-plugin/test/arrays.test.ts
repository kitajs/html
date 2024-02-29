import assert from 'node:assert';
import { it } from 'node:test';
import { TSLangServer } from './util/lang-server';

it('Lists and arrays can be used normally', async () => {
  await using server = new TSLangServer(__dirname);

  const diagnostics = await server.openWithDiagnostics/* tsx */ `
    const list: JSX.Element[] = [];  

    export default (
      <>
        <div>{list}</div>
      </>
    );
`;

  assert.deepStrictEqual(diagnostics.body, []);
});
