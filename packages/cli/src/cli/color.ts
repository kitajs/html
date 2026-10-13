/**
 * Resolves whether the pretty format uses ANSI colors. An explicit `--color` or
 * `--no-color` wins, then `NO_COLOR` and `FORCE_COLOR`, then whether stdout is a TTY.
 */
export function resolveColor(
  flag: boolean | undefined,
  env: NodeJS.ProcessEnv,
  isTTY: boolean
): boolean {
  if (flag !== undefined) {
    return flag
  }

  if (env.NO_COLOR) {
    return false
  }

  if (env.FORCE_COLOR && env.FORCE_COLOR !== '0') {
    return true
  }

  return isTTY
}
