export type Severity = 'error' | 'warning'

/** 0-based line and UTF-16 character, as reported by TypeScript. */
export interface Position {
  line: number
  character: number
}

export interface KitaDiagnostic {
  /** Absolute file name as reported by the TypeScript API. */
  fileName: string
  /** 0-based UTF-16 offsets. */
  start: number
  end: number
  startPosition: Position
  endPosition: Position
  code: number
  severity: Severity
  message: string
  url: string
}

export interface CheckResult {
  typescriptVersion: string
  /** Absolute tsconfig paths that were checked, in check order. */
  projects: string[]
  filesChecked: number
  diagnostics: KitaDiagnostic[]
  /** Text of every file that has at least one diagnostic, for code frames. */
  sources: Map<string, string>
}

export function compareDiagnostics(a: KitaDiagnostic, b: KitaDiagnostic): number {
  if (a.fileName !== b.fileName) {
    return a.fileName < b.fileName ? -1 : 1
  }

  return a.start - b.start || a.end - b.end || a.code - b.code
}

/** Sorts and removes diagnostics reported more than once for the same span and code. */
export function normalizeDiagnostics(diagnostics: KitaDiagnostic[]): KitaDiagnostic[] {
  const sorted = [...diagnostics].sort(compareDiagnostics)

  return sorted.filter((diagnostic, index) => {
    const previous = sorted[index - 1]
    return !previous || compareDiagnostics(previous, diagnostic) !== 0
  })
}

export function countBySeverity(diagnostics: readonly KitaDiagnostic[]) {
  let errors = 0
  let warnings = 0

  for (const diagnostic of diagnostics) {
    if (diagnostic.severity === 'error') {
      errors++
    } else {
      warnings++
    }
  }

  return { errors, warnings }
}

/** Exit code contract shared with xss-scan: 0 clean, 1 errors, 2 warnings only. */
export function exitCodeFor(diagnostics: readonly KitaDiagnostic[]): 0 | 1 | 2 {
  const { errors, warnings } = countBySeverity(diagnostics)

  if (errors) {
    return 1
  }

  return warnings ? 2 : 0
}
