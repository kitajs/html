/**
 * Oclif detects the user's shell while loading its config, on every run. On Windows
 * without `SHELL`, that spawns PowerShell for a WMI query, which takes seconds on
 * desktops and tens of seconds on CI runners. Only `autocomplete` reads the shell, and it
 * also accepts the shell as an argument, so every other command skips the detection.
 */
export function skipWindowsShellDetection(
  argv: readonly string[],
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform
): void {
  if (platform !== 'win32' || env.SHELL || argv[0] === 'autocomplete') {
    return
  }

  env.SHELL = 'cmd.exe'
}
