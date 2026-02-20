# AGENTS.md - Developer Guide for Groupli

This document provides essential information for AI coding agents working in this codebase.

## Project Overview

Groupli is a Next.js 15 application for managing group pairings, built with:
- **Framework**: Next.js 15 (App Router), React 19
- **Language**: TypeScript (strict mode)
- **Database**: SQLite with Drizzle ORM
- **Effect System**: Effect-TS v3 for functional error handling
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Testing**: Vitest (unit), Playwright (e2e)
- **Package Manager**: pnpm v9.12.3
- **Node Version**: 22

## Build, Lint, and Test Commands

### Development
```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server
```

### Quality Checks
```bash
pnpm lint             # Lint with Biome (src directory only)
pnpm check            # Type-check with TypeScript (no emit)
```

### Testing
```bash
# Unit tests (Vitest)
pnpm test             # Run all unit tests
pnpm test:w           # Watch mode

# Run a single test file
pnpm vitest run src/domain/person/index.test.ts

# Run tests matching a pattern
pnpm vitest run -t "should add a person"

# E2E tests (Playwright)
pnpm test:e2e         # Seed DB + run all e2e tests
pnpm playwright       # Run Playwright tests only
pnpm playwright --project=chromium  # Single browser
pnpm playwright e2e/basic.spec.ts   # Single test file
```

### Database
```bash
pnpm generate         # Generate Drizzle migrations
pnpm studio           # Open Drizzle Studio (DB browser)
```

## Code Style Guidelines

### Formatting (Biome)
- **Indentation**: Tabs (width: 2)
- **Semicolons**: As needed (omit where possible)
- **Quotes**: Single quotes for strings
- **Sorted Classes**: Tailwind classes should be sorted (auto-fixable warning)
- **No Static-Only Classes**: Disabled (Effect Context Tags use static classes)

### Imports
- **Path Alias**: Use `@/*` for all imports from `src/`
  ```typescript
  import { Button } from '@/components/ui/button'
  import { Person, Group } from '@/domain'
  ```
- **Import Order**: External packages first, then `@/*` imports
- **Barrel Exports**: Domain modules use barrel exports (`src/domain/index.ts`)
- **Server-Only**: Use `import 'server-only'` in server-side modules

### TypeScript
- **Strict Mode**: Enabled with `exactOptionalPropertyTypes: true`
- **Module System**: ESNext with bundler resolution
- **Type Imports**: Use `import type` for type-only imports
  ```typescript
  import type { GroupId } from '@/domain/group'
  ```
- **No Any**: Avoid `any`, use `unknown` for uncertain types
- **Explicit Returns**: Always specify return types for exported functions

### Naming Conventions
- **Files**: kebab-case (`add-person.tsx`, `group-name-form.tsx`)
- **Components**: PascalCase (`AddPerson`, `GroupNameForm`)
- **Functions**: camelCase (`addPerson`, `startNewRound`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Types/Interfaces**: PascalCase
- **Effect Tags**: Namespaced (e.g., `Person.Repository`, `Round.Repository`)

### React Components

#### Server Components (Default)
- Async functions for data fetching
- Return Effect-wrapped JSX for error handling
- No `'use client'` directive needed
  ```typescript
  export default async function GroupPage({ params }: { params: { id: string } }) {
    return Effect.gen(function* () {
      const group = yield* Group.getById(params.id)
      return <div>{group.name}</div>
    }).pipe(
      Effect.catchAll(handleError),
      run
    )
  }
  ```

#### Client Components
- Add `'use client'` directive at top
- Use for interactivity: forms, buttons, state management
- Hooks: `useActionState`, `useFormStatus`, `useId`, `useRef`
- Example: `src/app/group/[id]/add-person.tsx`

#### Component Structure
- Props interface before component
- Use `React.forwardRef` for ref-forwarding components
- Destructure props with defaults
- Use `cn()` utility for className merging

### Error Handling (Effect-TS)

#### Defining Errors
Use `Schema.TaggedError` for typed errors:
```typescript
export class NameRequired extends Schema.TaggedError<NameRequired>()(
  'NameRequired',
  { message: Schema.String }
) {}
```

#### Effect Generator Syntax
```typescript
Effect.gen(function* () {
  const person = yield* Person.add(name, groupId)
  const group = yield* Group.getById(groupId)
  return { person, group }
})
```

#### Error Recovery
```typescript
Effect.catchAll((error) => {
  if (error instanceof NotFound) {
    return Effect.succeed(defaultValue)
  }
  return Effect.fail(error)
})
```

#### Server Actions
- Return `Schema.Exit` types with success/failure/defect
- Use `Effect.catchAll` for known errors
- Log defects and return generic errors to client

### Database (Drizzle ORM)

#### Repository Pattern
- Each domain entity has a Repository Context Tag
- Queries return Effect types: `Effect.Effect<Result, DbError, Db>`
- Use `Effect.gen` for complex queries
  ```typescript
  export const getByGroupId = (groupId: GroupId) =>
    Effect.gen(function* () {
      const db = yield* Db
      const rows = yield* db.query.Persons.findMany({
        where: eq(Persons.groupId, groupId),
      })
      return rows
    })
  ```

#### Transactions
Use `db.transaction()` for atomic operations

#### Schema
- Located in `src/adapter/db/schema.ts`
- Use snake_case for column names
- Export table definitions and relations

### Testing

#### Unit Tests (Vitest)
- Test files: `*.test.ts` alongside source files
- Use `runWithInMemoryDb` helper for Effect tests
- Assert with Node.js `assert` module
  ```typescript
  import assert from 'node:assert'
  import { Effect } from 'effect'
  import { describe, it } from 'vitest'
  import { runWithInMemoryDb } from '@/adapter/effect/run-with-in-memory-db'

  describe('Person', () => {
    it('should add a person', () =>
      Effect.gen(function* () {
        const person = yield* Person.add('Alice', groupId)
        assert.equal(person.name, 'Alice')
      }).pipe(runWithInMemoryDb))
  })
  ```

#### E2E Tests (Playwright)
- Located in `/e2e` folder
- Seed data before tests with `pnpm seed:e2e`
- Use standard Playwright patterns

### Styling (Tailwind CSS)

#### Utilities
- Use `cn()` from `@/lib/utils` for conditional classes
- Keep sorted order (Biome warns if not sorted)
- Responsive: `md:`, `lg:` prefixes
- Dark mode: Not currently implemented

#### Component Variants
Use `class-variance-authority` for variant-based styling:
```typescript
const buttonVariants = cva('base-classes', {
  variants: {
    variant: { default: '...', destructive: '...' },
    size: { default: '...', sm: '...', lg: '...' }
  },
  defaultVariants: { variant: 'default', size: 'default' }
})
```

## Architecture Patterns

### Domain-Driven Design
- Domain logic in `src/domain/` (Group, Person, Round, Pairing)
- Adapters in `src/adapter/` (DB, Next.js, tracing, UUID)
- App routes in `src/app/` (Next.js App Router)

### Dependency Injection
- Effect Context Tags for services
- Layer-based composition
- Runtime configuration in `src/adapter/effect/`

### Observability
- OpenTelemetry integration
- Use `Effect.withSpan('action')` for tracing

## Common Patterns

### Form Submission
```typescript
const [state, action] = useActionState(serverAction, initialState)
const { pending } = useFormStatus()
```

### Server Actions
- Define in files imported by client components
- Bind params: `const action = serverAction.bind(null, id)`
- Use `revalidatePath()` for cache invalidation

## Commit Conventions

Follow Conventional Commits (enforced by commitlint):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build/tooling changes
