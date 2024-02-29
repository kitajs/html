import assert from 'node:assert';
import { it } from 'node:test';
import { DoubleEscape } from '../src/errors';
import { TSLangServer } from './util/lang-server';

it('Avoid escaping twice', async () => {
  await using server = new TSLangServer(__dirname);

  const diagnostics = await server.openWithDiagnostics/* tsx */ `
    export default (
      <>
        <div safe>
          <div>{number}</div>
        </div>
        <div safe>
          <Component>{Html.escapeHtml(object)}</Component>
          asd
        </div>
        <div safe>{Html.escapeHtml(object)}</div>
        ${'<div safe>{Html.e`${object}`}</div>'}
        ${'<div safe>{e`${object}`}</div>'}
      </>
    );
`;

  assert.deepStrictEqual(diagnostics.body, [
    {
      start: { line: 36, offset: 14 },
      end: { line: 36, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    {
      start: { line: 39, offset: 14 },
      end: { line: 39, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    {
      start: { line: 43, offset: 14 },
      end: { line: 43, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    {
      start: { line: 44, offset: 14 },
      end: { line: 44, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    {
      start: { line: 45, offset: 14 },
      end: { line: 45, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    }
  ]);
});
