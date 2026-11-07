import type { Type } from 'typescript/sync'
import { comparablePath } from '../paths.js'
import type { AnalyzerContext, KitaAlias } from './context.js'

const JSX_ELEMENT_NAME = /(^|\.)JSX\.Element$/
const HTML_NAMESPACE_CHILDREN_NAME = /(^|\.)Html\.Children$/
const MODULE_CHILDREN_NAME = /^"(.+)"\.Children$/
const KITA_PACKAGE_PATH = /\/@kitajs\/html\//i

/**
 * Resolves whether a type was declared through `JSX.Element` or `Html.Children`. Uses the
 * fully qualified alias name, which TypeScript builds from the real path of the declaring
 * file, so pnpm symlinks and workspace links resolve to the same `@kitajs/html` root.
 */
export function getKitaAlias(ctx: AnalyzerContext, type: Type): KitaAlias {
  if (ctx.aliasCache.has(type.id)) {
    return ctx.aliasCache.get(type.id)
  }

  const alias = resolveKitaAlias(ctx, type)
  ctx.aliasCache.set(type.id, alias)
  return alias
}

function resolveKitaAlias(ctx: AnalyzerContext, type: Type): KitaAlias {
  const symbol = type.getAliasSymbol()

  // Avoids a fully qualified name round trip for every other alias
  if (!symbol || (symbol.name !== 'Element' && symbol.name !== 'Children')) {
    return undefined
  }

  const name = ctx.checker.getFullyQualifiedName(symbol)

  if (symbol.name === 'Element') {
    return JSX_ELEMENT_NAME.test(name) ? 'element' : undefined
  }

  if (HTML_NAMESPACE_CHILDREN_NAME.test(name)) {
    return 'children'
  }

  const modulePath = MODULE_CHILDREN_NAME.exec(name)?.[1]

  if (!modulePath) {
    return undefined
  }

  const normalized = comparablePath(modulePath)

  if (ctx.kitaRoot && normalized.startsWith(`${ctx.kitaRoot}/`)) {
    return 'children'
  }

  return KITA_PACKAGE_PATH.test(normalized) ? 'children' : undefined
}
