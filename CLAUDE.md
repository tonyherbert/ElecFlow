# CLAUDE.md

This file provides guidance to AI Agents.

## About the project <NAME>

If you read this, ask question about the project to fill this part. You need to describe what is the purpose of the project, main feature and goals.

## Development Commands

### Core Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application
- `pnpm start` - Start production server
- `pnpm ts` - Run TypeScript type checking
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm lint:ci` - Run ESLint without auto-fix for CI
- `pnpm clean` - Run lint, type check, and format code
- `pnpm format` - Format code with Prettier

### Testing Commands

**CRITICAL - ALWAYS use CI commands for testing (non-interactive mode):**

- **ALWAYS run `pnpm test:ci`** - Run unit tests in CI mode (located in `__tests__/`)
- **ALWAYS run `pnpm test:e2e:ci`** - Run e2e tests in CI mode (headless) (located in `e2e/`)

**NEVER run these interactive commands:**

- **NEVER** `pnpm test` - Interactive mode (not compatible with Claude Code)
- **NEVER** `pnpm test:e2e` - Interactive mode (not compatible with Claude Code)

### Database Commands

- `pnpm prisma:seed` - Seed the database
- `pnpm better-auth:migrate` - Generate better-auth Prisma schema

### Development Tools

- `pnpm email` - Email development server
- `pnpm stripe-webhooks` - Listen for Stripe webhooks
- `pnpm knip` - Run knip for unused code detection

## Architecture Overview

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v4 with Shadcn/UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with organization support
- **Forms**: TanStack Form with Zod validation (~~React Hook Form~~ deprecated)
- **Email**: React Email with Resend
- **Payments**: Stripe integration
- **Testing**: Vitest for unit tests, Playwright for e2e
- **Package Manager**: pnpm

### Project Structure

- `app/` - Next.js App Router pages and layouts
- `src/components/` - UI components (Shadcn/UI in `ui/`, custom in `nowts/`)
- `src/features/` - Feature-specific components and logic
- `src/lib/` - Utilities, configurations, and services
- `src/hooks/` - Custom React hooks
- `emails/` - Email templates using React Email
- `prisma/` - Database schema and migrations
- `e2e/` - End-to-end tests
- `__tests__/` - Unit tests

### Key Features

- **Multi-tenant Organizations**: Full organization management with roles and permissions
- **Authentication**: Email/password, magic links, OAuth (GitHub, Google)
- **Billing**: Stripe subscriptions with plan management
- **Dialog System**: Global dialog manager for modals and confirmations
- **Forms**: TanStack Form with Zod validation and server actions
- **Email System**: Transactional emails with React Email

## Code Conventions

### TypeScript

- Use `type` over `interface` (enforced by ESLint)
- Prefer functional components with TypeScript types
- No enums - use maps instead
- Strict TypeScript configuration

### React/Next.js

- Prefer React Server Components over client components
- Use `"use client"` only for Web API access in small components
- Wrap client components in `Suspense` with fallback
- Use dynamic loading for non-critical components
- **ALWAYS use the global `PageProps<"/route/path">` type for page components** - NEVER create local `PageProps` type definitions
  - Example: `export default async function MyPage(props: PageProps<"/admin/users">) {}`

### Styling

- Mobile-first approach with TailwindCSS
- Use Shadcn/UI components from `src/components/ui/`
- Custom components in `src/components/nowts/`

### Styling preferences

- Use the shared typography components in `@/components/nowts/typography.tsx` for paragraphs and headings (instead of creating custom `p`, `h1`, `h2`, etc.).
- For spacing, prefer utility layouts like `flex flex-col gap-4` for vertical spacing and `flex gap-4` for horizontal spacing (instead of `space-y-4`).
- Prefer the card container `@/components/ui/card.tsx` for styled wrappers rather than adding custom styles directly to `<div>` elements.

### State Management

- Use `nuqs` for URL search parameter state
- Zustand for global state (see dialog-store.ts)
- TanStack Query for server state

### Forms and Server Actions

**CRITICAL**: Use TanStack Form for ALL forms - ~~React Hook Form~~ is deprecated

- See `.claude/rules/tanstack-form.md` for detailed patterns
- Server actions in `.action.ts` files
- Use `resolveActionResult` helper for mutations

### Authentication

- See `.claude/rules/authentication.md` for detailed patterns

### Database

- Prisma ORM with PostgreSQL
- Database hooks for user creation setup
- Organization-based data access patterns

### Dialog System

- See `.claude/rules/dialog-manager.md` for detailed patterns

## Testing

### Unit Tests

- Located in `__tests__/` directory
- Use Vitest with React Testing Library
- Mock extended with `vitest-mock-extended`

### E2E Tests

- Located in `e2e/` directory
- Use Playwright with custom test utilities
- Helper functions in `e2e/utils/`

## Important Files

- `src/lib/auth.ts` - Authentication configuration
- `src/features/dialog-manager/` - Global dialog system
- `src/lib/actions/actions-utils.ts` - Server action utilities
- `src/features/form/tanstack-form.tsx` - TanStack Form components (useForm, Form, field components)
- `src/site-config.ts` - Site configuration
- `src/lib/actions/safe-actions.ts` - All Server Action SHOULD use this logic
- `src/lib/zod-route.ts` - See `.claude/rules/api-routes.md` for detailed patterns

### Database Schemas

- `prisma/schema/schema.prisma` - Main database schema
- `prisma/schema/better-auth.prisma` - Better Auth schema (auto-generated)

## Development Notes

- Always use `pnpm` for package management
- Use TypeScript strict mode - no `any` types
- Prefer server components and avoid unnecessary client-side state
- Prefer using `??` than `||`
- All API Request SHOULD use `@/lib/up-fetch.ts` and NEVER use `fetch`

## Files naming

- All server actions should be suffix by `.action.ts` eg. `user.action.ts`, `dashboard.action.ts`

## Debugging and complexe tasks

- For complexe logic and debugging, use logs. Add a lot of logs at each steps and ASK ME TO SEND YOU the logs so you can debugs easily.

## TypeScript imports

Always use TypeScript path aliases instead of relative imports:

- `@/*` → `./src/*` (e.g., `@/components/ui/button`)
- `@email/*` → `./emails/*` (e.g., `@email/welcome`)
- `@app/*` → `./app/*` (e.g., `@app/api/route`)

## Workflow modification

🚨 **CRITICAL RULE - ALWAYS FOLLOW THIS** 🚨

**BEFORE editing any files, you MUST Read at least 3 files** that will help you to understand how to make a coherent and consistency.

This is **NON-NEGOTIABLE**. Do not skip this step under any circumstances. Reading existing files ensures:

- Code consistency with project patterns
- Proper understanding of conventions
- Following established architecture
- Avoiding breaking changes

**Types of files you MUST read:**

1. **Similar files**: Read files that do similar functionality to understand patterns and conventions
2. **Imported dependencies**: Read the definition/implementation of any imports you're not 100% sure how to use correctly - understand their API, types, and usage patterns

**Steps to follow:**

1. Read at least 3 relevant existing files (similar functionality + imported dependencies)
2. Understand the patterns, conventions, and API usage
3. Only then proceed with creating/editing files

## UI / UX experiences

- Never use emojis (prefer Lucide Icon for illustration)
- Never use gradients unless explicitly asked by user
