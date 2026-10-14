/**
 * Resolves whether the pretty format uses ANSI colors. An explicit `--color` or
 * `--no-color` wins, then `NO_COLOR` and `FORCE_COLOR`, then GitHub Actions (whose logs
 * render ANSI colors although stdout is not a TTY), then whether stdout is a TTY.
 */
export function resolveColor(
  flag: boolean | undefined,
  env: NodeJS.ProcessEnv,
  isTTY: boolean
): boolean {
  if (flag !== undefined) {
    return flag
  }

  // https://no-color.org: only a non-empty NO_COLOR disables colors
  if (env.NO_COLOR) {
    return false
  }

  // Same meaning as in Node.js: any value forces colors, including an empty one, except 0
  // and false, which turn them off
  if (env.FORCE_COLOR !== undefined) {
    return env.FORCE_COLOR !== '0' && env.FORCE_COLOR !== 'false'
  }

  if (env.GITHUB_ACTIONS === 'true') {
    return true
  }

  return isTTY
}
