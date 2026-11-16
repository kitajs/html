import { expect, it } from 'vitest'
import { openWithDiagnostics } from '../util/project.js'

it('Ensure PropsWithChildren works as normal', async () => {
  const diagnostics = await openWithDiagnostics /* tsx */ `
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
`

  expect(diagnostics.body).toEqual([])
})
