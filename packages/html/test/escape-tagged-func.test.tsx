import { describe, expect, test } from 'vitest'
import * as Html from '../src/index.js'

describe('escape Tagged Template Function', () => {
  test('e is the same as escape', () => {
    expect(Html.e).toBe(Html.escape)
  })

  test('handles unknown values', () => {
    expect(Html.escape``).toBe('')
    expect(Html.escape`${{ a: 1 }}`).toBe('[object Object]')
  })

  // The matrix of cases we need to test for:
  // 1. Works with short strings
  // 2. Works with long strings
  // 3. Works with latin1 strings
  // 4. Works with utf16 strings
  // 5. Works when the text to escape is somewhere in the middle
  // 6. Works when the text to escape is in the beginning
  // 7. Works when the text to escape is in the end
  // 8. Returns the same string when there's no need to escape
  test('escapes special characters', () => {
    expect(Html.escape`absolutely nothing to do here`).toBe(
      'absolutely nothing to do here'
    )
    expect(Html.escape`<script>alert(1)</script>`).toBe('&lt;script>alert(1)&lt;/script>')
    expect(Html.escape`<`).toBe('&lt;')
    expect(Html.escape`>`).toBe('>')
    expect(Html.escape`&`).toBe('&amp;')
    expect(Html.escape`'`).toBe('&#39;')
    expect(Html.escape`"`).toBe('&#34;')
    expect(Html.escape`\u00A0`).toBe('\u00A0')
    expect(Html.escape`<script>ab`).toBe('&lt;script>ab')
    expect(Html.escape`<script>`).toBe('&lt;script>')
    expect(Html.escape`<script><script>`).toBe('&lt;script>&lt;script>')

    expect(Html.escape`lalala<script>alert(1)</script>lalala`).toBe(
      'lalala&lt;script>alert(1)&lt;/script>lalala'
    )

    expect(Html.escape`<script>alert(1)</script>lalala`).toBe(
      '&lt;script>alert(1)&lt;/script>lalala'
    )
    expect(Html.escape`lalala<script>alert(1)</script>`).toBe(
      'lalala' + '&lt;script>alert(1)&lt;/script>'
    )

    expect(Html.escape`What does 😊 mean?`).toBe('What does 😊 mean?')
    expect(Html.escape`<What does 😊`).toBe('&lt;What does 😊')
    expect(Html.escape`<div>What does 😊 mean in text?`).toBe(
      '&lt;div>What does 😊 mean in text?'
    )

    expect(
      Html.escape`${('lalala' + '<script>alert(1)</script>' + 'lalala').repeat(900)}`
    ).toBe('lalala&lt;script>alert(1)&lt;/script>lalala'.repeat(900))
    expect(Html.escape`${('<script>alert(1)</script>' + 'lalala').repeat(900)}`).toBe(
      '&lt;script>alert(1)&lt;/script>lalala'.repeat(900)
    )
    expect(Html.escape`${('lalala' + '<script>alert(1)</script>').repeat(900)}`).toBe(
      ('lalala' + '&lt;script>alert(1)&lt;/script>').repeat(900)
    )

    // the positions of the unicode codepoint are important
    // our simd code for U16 is at 8 bytes, so we need to especially check the boundaries
    expect(Html.escape`😊lalala<script>alert(1)</script>lalala`).toBe(
      '😊lalala&lt;script>alert(1)&lt;/script>lalala'
    )
    expect(Html.escape`${'<script>😊alert(1)</script>' + 'lalala'}`).toBe(
      '&lt;script>😊alert(1)&lt;/script>lalala'
    )
    expect(Html.escape`<script>alert(1)😊</script>lalala`).toBe(
      '&lt;script>alert(1)😊&lt;/script>lalala'
    )
    expect(Html.escape`<script>alert(1)</script>😊lalala`).toBe(
      '&lt;script>alert(1)&lt;/script>😊lalala'
    )
    expect(Html.escape`<script>alert(1)</script>lal😊ala`).toBe(
      '&lt;script>alert(1)&lt;/script>lal😊ala'
    )
    expect(Html.escape`${'<script>alert(1)</script>' + 'lal😊ala'.repeat(10)}`).toBe(
      '&lt;script>alert(1)&lt;/script>' + 'lal😊ala'.repeat(10)
    )

    for (let i = 1; i < 10; i++)
      expect(Html.escape`${'<script>alert(1)</script>' + 'la😊'.repeat(i)}`).toBe(
        '&lt;script>alert(1)&lt;/script>' + 'la😊'.repeat(i)
      )

    expect(Html.escape`${'la😊' + '<script>alert(1)</script>'}`).toBe(
      'la😊' + '&lt;script>alert(1)&lt;/script>'
    )
    expect(Html.escape`${('lalala' + '<script>alert(1)</script>😊').repeat(1)}`).toBe(
      ('lalala' + '&lt;script>alert(1)&lt;/script>😊').repeat(1)
    )

    expect(Html.escape`${'😊'.repeat(100)}`).toBe('😊'.repeat(100))
    expect(Html.escape`${'😊<'.repeat(100)}`).toBe('😊&lt;'.repeat(100))
    expect(Html.escape`${'<😊>'.repeat(100)}`).toBe('&lt;😊>'.repeat(100))
    expect(Html.escape`😊`).toBe('😊')
    expect(Html.escape`😊😊`).toBe('😊😊')
    expect(Html.escape`😊lo`).toBe('😊lo')
    expect(Html.escape`lo😊`).toBe('lo😊')

    expect(Html.escape`${' '.repeat(32) + '😊'}`).toBe(' '.repeat(32) + '😊')
    expect(Html.escape`${' '.repeat(32) + '😊😊'}`).toBe(' '.repeat(32) + '😊😊')
    expect(Html.escape`${' '.repeat(32) + '😊lo'}`).toBe(' '.repeat(32) + '😊lo')
    expect(Html.escape`${' '.repeat(32) + 'lo😊'}`).toBe(' '.repeat(32) + 'lo😊')
  })
})
