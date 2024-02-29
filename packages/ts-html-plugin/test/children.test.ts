import assert from 'node:assert';
import { it } from 'node:test';
import { TSLangServer } from './util/lang-server';

it('Ensure PropsWithChildren works as normal', async () => {
  await using server = new TSLangServer(__dirname);

  const diagnostics = await server.openWithDiagnostics/* tsx */ `
    export interface Extension extends PropsWithChildren {
      user?: { name: string };
    }
    
    export function Test({ children }: Extension) {
      return <div>{children}</div>;
    }

    const element = <div />;

    export default (
      <>
        <div>
          <Test>
             {element}
          </Test>
        </div>

        <div>
          {element}
        </div>
      </>
    );
`;

  assert.deepStrictEqual(diagnostics.body, []);
});
