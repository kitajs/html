import assert from 'node:assert';
import { it } from 'node:test';
import { TSLangServer } from './util/lang-server';

it('Ensure PropsWithChildren works as normal', async () => {
  await using server = new TSLangServer(__dirname);

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export interface Extension extends PropsWithChildren {
      user?: { name: string };
    }
    
    export function Test({ children }: Extension) {
      return <div>{children}</div>;
    }
    
    export function Test2(props: Extension) {
      return <div>{props.children}</div>;
    }
    
    export function Test3({ children }: PropsWithChildren) {
      return <div>{children}</div>;
    }
    
    export function Test4(props: PropsWithChildren) {
      return <div>{props.children}</div>;
    }
    
    export function Test5(props?: PropsWithChildren) {
      return <div>{props?.children}</div>;
    }

    const element = <div />;

    export default (
      <>
        <div>
          <Test>{element}</Test>
          <Test2>{element}</Test2>
          <Test3>{element}</Test3>
          <Test4>{element}</Test4>
          <Test5>{element}</Test5>
        </div>

        <div>
          {element}
        </div>
      </>
    );
`;

  assert.deepStrictEqual(diagnostics.body, []);
});
