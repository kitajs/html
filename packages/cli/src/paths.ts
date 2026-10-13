/** Forward slashes and a lowercase drive letter, so Windows paths compare reliably. */
export function normalizePath(filePath: string): string {
  return filePath
    .replace(/\\/g, '/')
    .replace(/^([A-Z]):/, (_, drive: string) => `${drive.toLowerCase()}:`)
}
