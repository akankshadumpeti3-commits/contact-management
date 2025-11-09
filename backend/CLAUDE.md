# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `npm run start:dev` - Start in development mode with watch/hot-reload
- `npm run start:debug` - Start in debug mode with watch
- `npm run build` - Build the application (output to `dist/`)
- `npm run start:prod` - Run the production build

### Testing
- `npm test` - Run all unit tests (Jest, from `src/` directory)
- `npm run test:watch` - Run tests in watch mode for TDD
- `npm run test:cov` - Run tests with coverage report
- `npm run test:debug` - Run tests in debug mode with Node inspector
- `npm run test:e2e` - Run end-to-end tests (uses `test/jest-e2e.json` config)

### Code Quality
- `npm run lint` - Run ESLint and auto-fix issues
- `npm run format` - Format code with Prettier

## Architecture Overview

This is a NestJS v11 application currently in migration from TypeORM/MySQL to Mongoose/MongoDB.

### Database Migration State (IMPORTANT)
The codebase is in **active migration** from TypeORM to MongoDB:
- **NEW**: MongoDB/Mongoose is configured and running (see `src/app.module.ts:19-25`)
- **OLD**: TypeORM code is commented out but still present in the codebase
- The migration is tracked as "Story 1.3 - MongoDB migration" (see comments in `src/app.module.ts`)

**When working with this codebase:**
- Use MongoDB/Mongoose for new features
- The old TypeORM Contact entity (`src/entities/contact.entity.ts`) uses MySQL but is not currently active
- The ContactService (`src/contact/contact.service.ts`) and ContactsController (`src/contacts/contacts.controller.ts`) are commented out in AppModule because they depend on TypeORM
- These will need to be migrated to use Mongoose schemas instead of TypeORM entities

### Module Structure
NestJS follows a modular architecture pattern:
- **Modules**: Group related functionality (`*.module.ts`)
- **Controllers**: Handle HTTP requests and routing (`*.controller.ts`)
- **Services**: Contain business logic (`*.service.ts`)
- **Entities/Schemas**: Define data models (currently TypeORM entities in `src/entities/`, will become Mongoose schemas)

The root module is `AppModule` (`src/app.module.ts`), which:
- Configures global environment variables via `ConfigModule`
- Sets up MongoDB connection via `MongooseModule.forRootAsync()`
- Registers all application controllers and providers

### Application Bootstrap
Entry point is `src/main.ts`:
- Creates NestJS application from AppModule
- Enables CORS globally
- Sets up MongoDB connection event logging
- Runs on port 3000 (or `PORT` from environment)

### Contact Management (Legacy - Being Migrated)
The existing contact management feature uses:
- `Contact` entity with TypeORM decorators (`src/entities/contact.entity.ts`)
- `ContactService` with Repository pattern (`src/contact/contact.service.ts`)
- `ContactsController` with REST endpoints (`src/contacts/contacts.controller.ts`):
  - `GET /contacts` - List all contacts
  - `POST /contacts/create` - Create new contact
  - `PUT /contacts/:id/update` - Update contact
  - `DELETE /contacts/:id/delete` - Delete contact

## Environment Setup

### Prerequisites
- Node.js v14+ (TypeScript 5.9.3, targets ES2017)
- MongoDB v4.4+ running on default port 27017

### MongoDB Setup
Option 1 - Local:
```bash
# MongoDB should be running on mongodb://localhost:27017
```

Option 2 - Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:4.4
```

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Required variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Application port (default: 3000)
- `MONGODB_URI` - MongoDB connection string (default: mongodb://localhost:27017/contact-management)
- `MONGODB_DATABASE` - Database name (default: contact-management)

The application will warn if `MONGODB_URI` is not set and use the default value.

## TypeScript Configuration
- Compiler target: ES2017
- Module system: CommonJS
- Decorators: Enabled (`experimentalDecorators`, `emitDecoratorMetadata`)
- Source maps: Enabled
- Output directory: `dist/`

## Testing Configuration
- Unit tests use Jest with ts-jest transform
- Test files: `*.spec.ts` (in `src/`)
- E2E tests: `*.e2e-spec.ts` (in `test/`)
- Coverage output: `coverage/` directory
