import type { Code, Root } from 'mdast'
import type { MdxjsEsm } from 'mdast-util-mdxjs-esm'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { highligherPromise, highlightHtml } from './highlighter.js'
import { renderKitaCode } from './renderer.js'

/** Creates an MDX ESM import AST node (matching preview plugin pattern) */
function createImportNode(name: string, from: string): MdxjsEsm {
  return {
    type: 'mdxjsEsm',
    value: `import ${name} from ${JSON.stringify(from)}`,
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [
          {
            type: 'ImportDeclaration',
            attributes: [],
            specifiers: [
              {
                type: 'ImportDefaultSpecifier',
                local: { type: 'Identifier', name }
              }
            ],
            source: {
              type: 'Literal',
              value: from,
              raw: JSON.stringify(from)
            }
          }
        ]
      }
    }
  }
}

/** Remark plugin to process ```tsx kita code blocks */
export const remarkKitaPlugin: Plugin<[], Root> = () => {
  return async (tree) => {
    const promises: Promise<void>[] = []
    let hasKitaBlocks = false

    visit(tree, 'code', (node: Code) => {
      // Skip if already visited
      if ('hasVisited' in node && node.hasVisited === true) {
        return
      }

      // Check if this is a kita code block
      if (node.lang !== 'tsx' && node.lang !== 'jsx') {
        return
      }

      const meta = node.meta || ''

      // Check if meta contains "kita" or "kita=varname"
      const kitaMatch = meta.match(/\bkita(?:=(\w+))?/)
      if (!kitaMatch) {
        return
      }

      hasKitaBlocks = true

      // Extract variable name (default to "html")
      const variableName = kitaMatch[1] || 'html'

      // Process the code block asynchronously
      promises.push(
        (async () => {
          // Render the Kita code to HTML
          const rawHtml = await renderKitaCode(node.value, variableName)

          // Highlight the HTML
          const highlightedHtml = highlightHtml(await highligherPromise, rawHtml)

          // Keep a copy of the original code block for Shiki to process
          const originalCodeBlock = { ...node, hasVisited: true }

          // Mutate the node in place to become a KitaCodeBlock wrapper
          // (matching preview plugin's Object.assign pattern)
          Object.assign(node, {
            type: 'mdxJsxFlowElement',
            name: 'KitaCodeBlock',
            attributes: [
              {
                type: 'mdxJsxAttribute',
                name: 'htmlOutput',
                value: highlightedHtml
              },
              {
                type: 'mdxJsxAttribute',
                name: 'rawHtml',
                value: rawHtml
              }
            ],
            children: [originalCodeBlock]
          })
        })()
      )
    })

    // Wait for all blocks to be processed
    await Promise.all(promises)

    // Add import for KitaCodeBlock component at the top if we found any blocks
    if (hasKitaBlocks) {
      tree.children.unshift(
        createImportNode('KitaCodeBlock', '@theme/components/KitaCodeBlock')
      )
    }
  }
}
