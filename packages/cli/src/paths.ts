/** Forward slashes and a lowercase drive letter, so Windows paths compare reliably. */
export function normalizePath(filePath: string): string {
  return filePath
    .replace(/\\/g, '/')
    .replace(/^([A-Z]):/, (_, drive: string) => `${drive.toLowerCase()}:`)
}

/** Default file systems on Windows and macOS ignore case. */
export const caseInsensitiveFileSystem =
  process.platform === 'win32' || process.platform === 'darwin'

/** Normalized path that compares equal for every spelling the file system accepts. */
export function comparablePath(filePath: string): string {
  const normalized = normalizePath(filePath)
  return caseInsensitiveFileSystem ? normalized.toLowerCase() : normalized
}
