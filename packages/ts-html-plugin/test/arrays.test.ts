import { expect, it } from 'vitest';
import { TSLangServer } from './util/lang-server';

it('Lists and arrays can be used normally', async () => {
  await using server = new TSLangServer(__dirname);

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    const list: JSX.Element[] = [];

    export default (
      <>
        <div>{list}</div>
      </>
    );
`;

  expect(diagnostics.body).toEqual([]);
});
