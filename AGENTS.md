# Agent Instructions

## Changesets

Every bug fix, feature change, or any other user-facing change to a published package must
include a changeset entry. Run `pnpm changeset` to create one and commit the generated
file with your PR.

Documentation-only changes in `@kitajs/docs-html` and changes limited to examples or
benchmarks do not need a changeset, as those packages are ignored in
`.changeset/config.json`.
