# Code Style and Conventions

## TypeScript Configuration

The project uses **strict TypeScript settings** with the following key configurations:

### JSX Settings

- `jsx`: "react-jsx"
- `jsxImportSource`: "@kitajs/html"
- `plugins`: [{ "name": "@kitajs/ts-html-plugin" }]

### Module Settings

- `module`: "CommonJS"
- `moduleResolution`: "node"
- `target`: "ESNext"
- `esModuleInterop`: true

### Strict Mode Settings (all enabled)

- `strict`: true
- `noImplicitAny`: true
- `strictNullChecks`: true
- `strictFunctionTypes`: true
- `strictBindCallApply`: true
- `strictPropertyInitialization`: true
- `noImplicitThis`: true
- `useUnknownInCatchVariables`: true
- `alwaysStrict`: true
- `noUnusedLocals`: true
- `noUnusedParameters`: true
- `noImplicitReturns`: true
- `noFallthroughCasesInSwitch`: true
- `noUncheckedIndexedAccess`: true
- `noImplicitOverride`: true

### Build Settings

- Source maps and declaration maps enabled
- Output directory: `dist`
- Incremental compilation enabled

## Formatting

- **Tool**: Prettier
- **Configuration**: Uses @arthurfiorette/prettier-config
- **Plugins**:
  - prettier-plugin-jsdoc
  - prettier-plugin-organize-imports
  - prettier-plugin-packagejson
- **Pre-commit hook**: Automatically formats staged files before commit

## Naming Conventions

Based on the codebase:

- Functions: camelCase (e.g., `createElement`, `attributesToString`)
- Constants: UPPER_SNAKE_CASE (e.g., `CAMEL_REGEX`, `ESCAPED_REGEX`)
- Variables: camelCase (e.g., `escapeHtml`)
- Files: kebab-case for test files (e.g., `simple-html.test.tsx`)
- Packages: scoped with @kitajs/ prefix

## JSX Usage

- No need to import React or Html namespace when using react-jsx transform
- Components can be sync (return string) or async (return Promise<string>)
- Always use `safe` attribute or `Html.escapeHtml()` for user input to prevent XSS
- Attributes are automatically escaped by default
- Children content is NOT escaped by default (requires `safe` attribute)

## File Organization

- Source files in `src/` directory
- Tests in `test/` directory with `.test.tsx` or `.test.ts` extension
- Type definitions generated alongside compiled files in `dist/`
- Build output in `dist/` directory
- Additional type definition files (htmx.d.ts, alpine.d.ts, etc.) in package root

## Documentation

- Use JSDoc comments for public APIs
- TypeScript types serve as primary documentation
- README.md in each package with comprehensive examples
