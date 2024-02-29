import assert from 'node:assert';
import { it } from 'node:test';
import { TSLangServer } from './util/lang-server';

it('Allow correct xss usage', async () => {
  await using server = new TSLangServer(__dirname);

  const diagnostics = await server.openWithDiagnostics/* tsx */ `
    export default (
      <>
        <div></div>
        <div>{date.getTime()}</div>
        <div safe>{date.toISOString()}</div>
        <div>{safeString}</div>
        <div safe>{promiseHtml}</div>
        <div>{promiseNumber}</div>
        <div safe>{html}</div>
        <div>{number}</div>
        <div safe>hello {html}</div>
        <div safe>{unsafeNumber}</div>
        <div safe>{union}</div>
        <script>{html}</script>
        <div>
          {['asda', 'b', 'c'].map((i) => (
            <>{Html.escapeHtml(i)}</>
          ))}
        </div>
        <div>
          {['asda', 'b', 'c'].map((i) => (
            ${'<>{Html.e`${i} some text`}</>'}
          ))}
        </div>
        <div>
          {['asda', 'b', 'c'].map((i) => (
            ${'<>{Html.escape`${i} some text`}</>'}
          ))}
        </div>
        <div>
          {['a', 'b', 'c'].map((i) => (
            <div safe>{i}</div>
          ))}
        </div>
        <div>
          {[1, 2, 3].map((i) => (
            <>{i}</>
          ))}
        </div>
        <div>{[1, 2, 3].map((i) => i)}</div>
        <div safe>{['a', 'b', 'c'].map((i) => i)}</div>
        <div>
          {'literal'}
          {1}
        </div>
        <div>{Html.escapeHtml(html)}</div>
        <div>{Html.escapeHtml(object)}</div>
        ${'<div>{Html.e`${html}`}</div>'}
        ${'<div>{Html.e`${object}`}</div>'}
        ${'<div>{e`${html}`}</div>'}
        ${'<div>{e`${object}`}</div>'}
        ${'<div>{Html.escape`${html}`}</div>'}
        ${'<div>{Html.escape`${object}`}</div>'}
        <div>{boolean ? number : safeString}</div>
        <div>{number || safeString}</div>
      </>
    );
`;

  assert.strictEqual(diagnostics.body.length, 0);
});
