import assert from 'node:assert';
import { it } from 'node:test';
import { ComponentXss } from '../src/errors';
import { TSLangServer } from './util/lang-server';

it('Ensure <Component /> children are safe', async () => {
  await using server = new TSLangServer(__dirname);

  const diagnostics = await server.openWithDiagnostics/* tsx */ `
    export default (
      <>
        {/* error */}
        <div>
        {['a', 'b', 'c'].map((i) => (
          <Component>{i}</Component>
        ))}
        </div>
        <Component>
          {['a', 'b', 'c'].map((i) => (i === 'a' ? safeString : <Component>{i}</Component>))}
        </Component>

        {/* safe */}
        <div>
          {[1, 2, 3].map((i) => (
            <Component>{i}</Component>
          ))}
        </div>
        <div>
          {['a', 'b', 'c'].map((i) => (
            <Component>{Html.escapeHtml(i)}</Component>
          ))}
        </div>
        <div>
          <Component>{Html.escapeHtml(object)}</Component>
          asd
        </div>
      </>
    );
`;

  assert.deepStrictEqual(diagnostics.body, [
    {
      start: { line: 39, offset: 23 },
      end: { line: 39, offset: 24 },
      text: ComponentXss.message,
      code: ComponentXss.code,
      category: 'error'
    },
    {
      start: { line: 43, offset: 77 },
      end: { line: 43, offset: 78 },
      text: ComponentXss.message,
      code: ComponentXss.code,
      category: 'error'
    }
  ]);
});

it('Ensure <Component /> children are safe using "e" tag function', async () => {
  await using server = new TSLangServer(__dirname);

  const diagnostics = await server.openWithDiagnostics/* tsx */ `
    export default (
      <>
        {/* error */}
        <div>
        {['a', 'b', 'c'].map((i) => (
          <Component>{i}</Component>
        ))}
        </div>
        <Component>
          {['a', 'b', 'c'].map((i) => (i === 'a' ? safeString : <Component>{i}</Component>))}
        </Component>

        {/* safe */}
        <div>
          {[1, 2, 3].map((i) => (
            <Component>{i}</Component>
          ))}
        </div>
        <div>
          {['a', 'b', 'c'].map((i) => (
            ${'<Component>{Html.e`${i}`}</Component>'}
          ))}
        </div>
        <div>
          ${'<Component>{Html.e`${object}`}</Component>'}
          asd
        </div>
        <div>
          {['a', 'b', 'c'].map((i) => (
            ${'<Component>{e`${i}`}</Component>'}
          ))}
        </div>
        <div>
          ${'<Component>{e`${object}`}</Component>'}
          asd
        </div>
      </>
    );
`;

  assert.deepStrictEqual(diagnostics.body, [
    {
      start: { line: 39, offset: 23 },
      end: { line: 39, offset: 24 },
      text: ComponentXss.message,
      code: ComponentXss.code,
      category: 'error'
    },
    {
      start: { line: 43, offset: 77 },
      end: { line: 43, offset: 78 },
      text: ComponentXss.message,
      code: ComponentXss.code,
      category: 'error'
    }
  ]);
});
