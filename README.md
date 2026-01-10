# Âm Lịch - Vietnamese Lunar Calendar

A comprehensive Vietnamese lunar calendar web application with event management and cultural context.

## Features

- **Vietnamese Lunar Calendar**: Complete lunar calendar with Vietnamese terminology and cultural context
- **Event Management**: Create and manage Vietnamese cultural events, ancestor worship dates, and personal reminders
- **Cultural Context**: Built-in Vietnamese holidays, zodiac information, and traditional observances
- **Progressive Web App**: Install as native app with offline functionality
- **Authentication**: Secure user accounts with Email/Password
- **Export Functionality**: Export calendars to various formats
- **Modern UI**: Responsive design optimized for Vietnamese users

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: tRPC, NextAuth.js, Prisma ORM
- **Database**: PostgreSQL with Vietnamese cultural data
- **UI Components**: shadcn/ui, Radix UI
- **Lunar Calculations**: Chinese Lunar Calendar libraries with Vietnamese adaptations

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Docker (for PostgreSQL)
- Git

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd am-lich
pnpm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in your environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/amlich"

# NextAuth
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"
```

### 3. Database Setup

Start PostgreSQL using Docker:

```bash
./start-database.sh
```

Run database migrations:

```bash
pnpm run db:generate
```

### 4. Start Development

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Commands

### Database

- `./start-database.sh` - Start PostgreSQL with Docker
- `pnpm run db:generate` - Run Prisma migrations in development
- `pnpm run db:migrate` - Deploy Prisma migrations to production
- `pnpm run db:push` - Push schema changes to database
- `pnpm run db:studio` - Open Prisma Studio

### Development

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run preview` - Build and start production server

### Code Quality

- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Run ESLint with auto-fix
- `pnpm run typecheck` - Run TypeScript type checking
- `pnpm run check` - Run both linting and type checking
- `pnpm run format:check` - Check code formatting
- `pnpm run format:write` - Format code with Prettier

### Testing

- `pnpm run test` - Run tests in watch mode
- `pnpm run test:run` - Run tests once
- `pnpm run test:coverage` - Run tests with coverage

### UI Components

- `pnpm run ui:add` - Add new shadcn/ui components

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Protected app routes (dashboard, events)
│   ├── (auth)/            # Authentication routes (login, signup)
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── lunar/            # Vietnamese lunar calendar components
│   └── ...               # Custom components
├── lib/                  # Utility functions
│   ├── lunar-calendar.ts # Vietnamese lunar calendar logic
│   └── vietnamese-localization.ts # Vietnamese language support
├── server/               # Server-side code
│   ├── api/routers/      # tRPC API routers
│   ├── auth/             # NextAuth configuration
│   └── db.ts             # Database client
└── styles/               # Global styles
```

## Database Schema

The application includes comprehensive models for Vietnamese lunar calendar functionality:

### Core Authentication

- **User**: User accounts with email/password authentication
- **Account**: Account connections for authentication providers
- **Session**: User sessions
- **VerificationToken**: Email verification tokens

### Vietnamese Lunar Calendar

- **VietnameseLunarEvent**: Vietnamese cultural events with lunar dates, zodiac years, and ancestor worship support
- **VietnameseHoliday**: Traditional Vietnamese holidays and their cultural significance
- **VietnameseZodiacInfo**: Vietnamese zodiac system with Can Chi combinations

## Key Features

### Vietnamese Lunar Calendar

- View current Vietnamese lunar date with proper terminology (Mồng 1, Rằm, etc.)
- Browse lunar months with Vietnamese zodiac information
- See upcoming important dates and cultural significance
- Traditional Vietnamese holiday integration

### Event Management

- Create Vietnamese cultural events with lunar dates
- Ancestor worship scheduling (giỗ tổ tiên)
- Annual recurring events for traditional celebrations
- Event export to various calendar formats

## Development

### Adding New Features

1. Create new pages in `src/app/(app)/` for authenticated features
2. Add tRPC routers in `src/server/api/routers/`
3. Create UI components in `src/components/`

### Database Changes

1. Modify `prisma/schema.prisma`
2. Run `pnpm run db:generate` to create migrations
3. Update tRPC routers and API endpoints

### Vietnamese Localization

- Update `src/lib/vietnamese-localization.ts` for new text
- Add cultural context to calendar components
- Follow Vietnamese design patterns

## Deployment

### Environment Variables

Ensure all production environment variables are set:

- `DATABASE_URL` - Production PostgreSQL connection
- `AUTH_SECRET` - Strong random secret (use `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production domain
- `RESEND_API_KEY` and `EMAIL_FROM`

### Database Migration

```bash
pnpm run db:migrate
```

### Build and Deploy

```bash
pnpm run build
pnpm run start
```

## Cultural Context

This application is designed specifically for the Vietnamese community and incorporates:

- Traditional Vietnamese lunar calendar terminology
- Vietnamese zodiac system (Can Chi)
- Cultural significance of dates like Mồng 1 (new moon) and Rằm (full moon)
- Ancestor worship scheduling (giỗ tổ tiên)
- Vietnamese traditional holidays and observances

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm run check` to ensure code quality
5. Test with Vietnamese cultural context
6. Submit a pull request

## License

[MIT License](LICENSE.md)
