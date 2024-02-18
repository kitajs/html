import type { Children, Fragment, PropsWithChildren } from './index.d.ts';

export function safeChildrenArray(children: Children): Array<Children>;

export function jsx(
  type: string | ((props: PropsWithChildren) => JSX.Element),
  props: PropsWithChildren
): Promise<string> | string;

export function jsxs(
  type: string | typeof jsx,
  props: PropsWithChildren
): Promise<string> | string;

export { Fragment };
