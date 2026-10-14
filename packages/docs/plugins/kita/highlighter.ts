import { createCssVariablesTheme, createHighlighter, type Highlighter } from 'shiki'

// Create CSS variables theme matching Rspress configuration
const cssVariablesTheme = createCssVariablesTheme({
  name: 'css-variables',
  variablePrefix: '--shiki-',
  variableDefaults: {},
  fontStyle: true
})

/** Our Shiki highlighter instance */
export const highligherPromise = createHighlighter({
  themes: [cssVariablesTheme],
  langs: ['html']
})

/** Highlights HTML code using Shiki with CSS variables theme */
export function highlightHtml(highlighter: Highlighter, html: string): string {
  return highlighter.codeToHtml(html, {
    lang: 'html',
    theme: 'css-variables'
  })
}
