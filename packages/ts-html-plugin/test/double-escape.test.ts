import { expect, it } from 'vitest';
import { DoubleEscape } from '../src/errors';
import { TSLangServer } from './util/lang-server';

/**
 * Comprehensive test for TS88602 DoubleEscape error detection.
 *
 * Tests that the `safe` attribute triggers a DoubleEscape error when combined with:
 *
 * - Direct JSX children (elements with opening/closing tags, self-closing components)
 * - JSX in expressions (ternary operators, binary operators like ||)
 * - Html.escapeHtml() calls (already escaped content)
 *
 * This ensures that HTML content is not double-escaped, which would corrupt the markup.
 */
it('Avoid escaping twice - comprehensive test', async () => {
  await using server = new TSLangServer(__dirname);

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    declare function UserBadge(props?: { url?: string, children?: JSX.Element }): JSX.Element;
    declare function Fallback(): JSX.Element;
    declare const user: { name: string, badgeUrl: string };
    declare const condition: boolean;
    declare const content: string | null;

    export default (
      <>
        {/* Direct children - native elements */}
        <div safe>
          <div>{number}</div>
        </div>
        <div safe>
          <span>test</span>
        </div>

        {/* Direct children - components with opening/closing tags */}
        <div safe>
          <Component>{Html.escapeHtml(object)}</Component>
          asd
        </div>
        <div safe>
          <UserBadge>
            <span>Badge</span>
          </UserBadge>
        </div>

        {/* Direct children - self-closing components */}
        <div safe>
          {user.name}
          <UserBadge url={user.badgeUrl} />
        </div>

        {/* Expression with escapeHtml */}
        <div safe>{Html.escapeHtml(object)}</div>
        ${'<div safe>{Html.e`${object}`}</div>'}
        ${'<div safe>{e`${object}`}</div>'}

        {/* Expressions - ternary with self-closing component */}
        <div safe>
          {condition ? <UserBadge /> : 'fallback'}
        </div>

        {/* Expressions - ternary with full element */}
        <div safe>
          {condition ? <span>test</span> : 'fallback'}
        </div>

        {/* Expressions - || operator with self-closing component */}
        <div safe>
          {content || <Fallback />}
        </div>
      </>
    );
`;

  expect(diagnostics.body).toEqual([
    // Direct children - native element with opening/closing tags
    {
      start: { line: 43, offset: 14 },
      end: { line: 43, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    // Direct children - native element <span>
    {
      start: { line: 46, offset: 14 },
      end: { line: 46, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    // Direct children - component with opening/closing tags
    {
      start: { line: 51, offset: 14 },
      end: { line: 51, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    // Direct children - component <UserBadge>
    {
      start: { line: 55, offset: 14 },
      end: { line: 55, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    // Direct children - self-closing component
    {
      start: { line: 62, offset: 14 },
      end: { line: 62, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    // Expression with Html.escapeHtml()
    {
      start: { line: 68, offset: 14 },
      end: { line: 68, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    // Expression with Html.e``
    {
      start: { line: 69, offset: 14 },
      end: { line: 69, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    // Expression with e``
    {
      start: { line: 70, offset: 14 },
      end: { line: 70, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    // Ternary with self-closing component
    {
      start: { line: 73, offset: 14 },
      end: { line: 73, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    // Ternary with full element
    {
      start: { line: 78, offset: 14 },
      end: { line: 78, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    },
    // || operator with self-closing component
    {
      start: { line: 83, offset: 14 },
      end: { line: 83, offset: 18 },
      text: DoubleEscape.message,
      code: DoubleEscape.code,
      category: 'error'
    }
  ]);
});
