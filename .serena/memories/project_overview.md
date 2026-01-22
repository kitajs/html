# KitaJS HTML - Project Overview

## Purpose

KitaJS HTML is a monorepo containing a super fast JSX runtime library that generates HTML
strings. It's designed to work with any Node.js framework (Express, Fastify, Hono,
AdonisJS, Bun, etc.) and integrates well with HTMX, Alpine.js, and Hotwire Turbo.

Key features:

- JSX-based HTML generation that outputs strings
- Type-safe HTML templates using TypeScript
- Built-in XSS protection with TypeScript plugin
- Support for async components with Suspense
- Error boundaries for async error handling
- Performance-focused (benchmarks show 7-41x faster than alternatives)

## Repository Structure

This is a pnpm monorepo with the following structure:

### Main Packages (packages/)

- **@kitajs/html** - Core JSX runtime for HTML generation
- **@kitajs/ts-html-plugin** - TypeScript LSP plugin for XSS detection and validation
- **@kitajs/fastify-html-plugin** - Fastify integration plugin

### Additional Directories

- **benchmarks/** - Performance benchmarks comparing with React, Typed Html, etc.
- **examples/** - Example code demonstrating usage
- **.husky/** - Git hooks configuration
- **.github/** - GitHub workflows and CI/CD
- **.changeset/** - Changesets for version management

## Tech Stack

- **Language**: TypeScript 5.9+
- **Runtime**: Node.js >= 20.13
- **Package Manager**: pnpm >= 10 (required via preinstall hook)
- **JSX Transform**: react-jsx with jsxImportSource: @kitajs/html
- **Module System**: CommonJS
- **Build Tool**: tsgo (@typescript/native-preview)
- **Testing**: Vitest with @vitest/coverage-v8
- **Formatting**: Prettier with @arthurfiorette/prettier-config
- **Git Hooks**: Husky
- **Versioning**: Changesets with GitHub changelog integration

## Key Dependencies

- csstype (for CSS types)
- fastify-plugin (for Fastify integration)
- TypeScript, tslib (build tools)
- JSDOM (for DOM testing)
- Vitest with v8 coverage
