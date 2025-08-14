# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Database Setup

- `./start-database.sh` - Start PostgreSQL database using Docker
- `pnpm run db:generate` - Run Prisma migrations in development
- `pnpm run db:migrate` - Deploy Prisma migrations
- `pnpm run db:push` - Push schema changes to database
- `pnpm run db:studio` - Open Prisma Studio for database inspection

### Development

- `pnpm run dev` - Start development server with Turbo (http://localhost:3000)
- `pnpm run build` - Build production application
- `pnpm run start` - Start production server
- `pnpm run preview` - Build and start production server

### Code Quality

- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Run ESLint with auto-fix
- `pnpm run typecheck` - Run TypeScript type checking
- `pnpm run check` - Run both linting and type checking
- `pnpm run format:check` - Check code formatting with Prettier
- `pnpm run format:write` - Format code with Prettier

### Testing

- `pnpm run test` - Run tests in watch mode with Vitest
- `pnpm run test:run` - Run tests once
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:ui` - Run tests with Vitest UI
- `pnpm run test:coverage` - Run tests with coverage report

### UI Components

- `pnpm run ui:add` - Add new shadcn/ui components

## Application Architecture

### Core Concept

This is **Next Starter** - a full-stack Next.js 15 boilerplate with authentication, database setup, and modern tooling. It provides a clean foundation for building web applications with user authentication and multi-tenant organization support.

### Tech Stack

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: tRPC for type-safe APIs, NextAuth.js for authentication
- **Database**: PostgreSQL with Prisma ORM
- **Email**: Resend integration for password reset functionality
- **Testing**: Vitest with React Testing Library for unit, component, and integration tests

### Database Schema

Core entities for authentication and multi-tenant support:

- **User** - User accounts with email/password and OAuth support
- **Account** - OAuth account connections (NextAuth)
- **Session** - User sessions (NextAuth)
- **VerificationToken** - Email verification tokens (NextAuth)
- **Organization** - Multi-tenant organization containers owned by users
- **OrganizationMember** - Organization membership with role management

### Key Architectural Patterns

#### Authentication & Authorization

- NextAuth.js with dual authentication: GitHub OAuth + email/password credentials
- Automatic organization creation during user registration
- Session-based authentication with secure session management
- Protected routes use server-side session validation
- Organization context provider for multi-tenant data access

#### API Structure

- **tRPC Routers**: `user`, `organization` (src/server/api/routers/)
- **Core API Endpoints**: `/api/auth/[...nextauth]` (NextAuth), `/api/trpc/[trpc]` (tRPC)
- **Type-safe API**: Full end-to-end type safety with tRPC and Zod validation

#### Route Protection & Layout

- **App Router**: Next.js 15 app directory with route groups
- **Protected Routes**: `(protected)/` - requires authentication, redirects to login if not authenticated
- **Public Routes**: `(public)/` - accessible without authentication (login, signup, password reset)
- **Layout Hierarchy**: Protected layout includes sidebar navigation and organization context

#### Component Architecture

- **shadcn/ui**: Radix UI primitives with Tailwind CSS styling
- **Sidebar Navigation**: Collapsible sidebar with user account management
- **Form Handling**: react-hook-form with Zod validation throughout auth flows
- **Email Integration**: React Email components for password reset emails

#### Data Management

- **Prisma ORM**: Type-safe database queries with PostgreSQL
- **tRPC Integration**: Server-side procedures with client-side React Query caching
- **Organization Context**: React context for multi-tenant data scoping
- **Session Management**: NextAuth session integration with tRPC context

### Environment Setup

Requires `.env` file with:

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth session encryption key
- `NEXTAUTH_URL` - Application URL for NextAuth callbacks
- `AUTH_GITHUB_ID` & `AUTH_GITHUB_SECRET` - GitHub OAuth credentials (optional)
- `RESEND_API_KEY` & `EMAIL_FROM` - Email service configuration (optional)

### Development Workflow

1. Start database with `./start-database.sh`
2. Install dependencies with `pnpm install`
3. Start development server with `pnpm run dev`
4. Use `pnpm run db:studio` for database inspection
5. Run `pnpm run check` before committing to ensure code quality
6. Use `pnpm run test` to run tests during development

### Testing Architecture

- **Vitest Configuration**: Located in `vitest.config.ts` with React plugin and jsdom environment
- **Test Setup**: `src/test/setup.ts` configures testing-library/jest-dom matchers and mocks
- **Test Utilities**: `src/test/utils.tsx` provides custom render function with tRPC and React Query providers
- **Example Tests**: 
  - Unit tests: `src/lib/utils.test.ts` (utility functions)
  - Component tests: `src/components/ui/button.test.tsx` (UI components)  
  - Integration tests: `src/server/api/routers/user.test.ts` (API logic)
  - React integration: `src/app/(protected)/account/_components/edit-name-dialog.test.tsx` (components with tRPC)

### Extending the Boilerplate

- **New tRPC Routers**: Add to `src/server/api/routers/` and register in `root.ts`
- **Database Changes**: Modify `prisma/schema.prisma` and run `pnpm run db:generate`
- **Protected Pages**: Add to `src/app/(protected)/` for authenticated access
- **UI Components**: Use `pnpm run ui:add [component]` to add new shadcn/ui components
