# Agent Instructions

## Change intents

Every bug fix, feature change, or any other user-facing change to a published package must
include a change intent. Run
`pnpm change --bump <patch|minor|major> --summary "<text>" <pkg>...` to create one
non-interactively and commit the generated `.changeset/*.md` file with your PR.

Documentation-only changes in `@kitajs/docs-html` and changes limited to examples or
benchmarks do not need a change intent, as those packages are listed under
`versioning.ignore` in `pnpm-workspace.yaml`.
