# TM Digital Backend - Lead Management System

Backend API for the agricultural input distributor lead management system built with NestJS, TypeORM, and PostgreSQL.

## Technology Stack

- **Node.js** - Runtime environment
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **TypeORM** - ORM for database operations
- **PostgreSQL** - Relational database
- **class-validator** - Validation decorators
- **class-transformer** - Object transformation

## Architecture

The project follows **Domain-Driven Design (DDD)** principles with a clear separation of concerns:

```
src/
├── domain/                    # Domain layer - Business entities and rules
│   ├── leads/                 # Lead domain
│   │   ├── lead.entity.ts
│   │   ├── lead-status.enum.ts
│   │   └── ...
│   └── rural-properties/      # Rural Property domain
│       ├── rural-property.entity.ts
│       ├── crop-type.enum.ts
│       └── ...
│
├── application/               # Application layer - Use cases and services
│   ├── leads/
│   │   ├── services/
│   │   └── use-cases/
│   ├── rural-properties/
│   │   ├── services/
│   │   └── use-cases/
│   └── dashboard/
│       └── services/
│
├── infrastructure/            # Infrastructure layer - Persistence and external concerns
│   ├── database/
│   │   ├── typeorm-config.service.ts
│   │   ├── data-source.ts
│   │   └── migrations/
│   └── persistence/
│       ├── leads/
│       │   ├── lead.entity.ts         # TypeORM entity
│       │   └── lead.repository.ts
│       └── rural-properties/
│           ├── rural-property.entity.ts
│           └── rural-property.repository.ts
│
└── interfaces/                # Interface layer - API controllers and DTOs
    └── http/
        ├── leads/
        │   ├── leads.controller.ts
        │   └── dto/
        ├── rural-properties/
        │   ├── rural-properties.controller.ts
        │   └── dto/
        └── dashboard/
            ├── dashboard.controller.ts
            └── dto/
```

### Layer Responsibilities

#### Domain Layer
- Contains core business entities
- Defines domain rules and invariants
- Independent of frameworks and infrastructure
- Business logic lives here

#### Application Layer
- Orchestrates domain objects
- Implements use cases
- Coordinates between domain and infrastructure
- No framework-specific code

#### Infrastructure Layer
- Database entities (TypeORM)
- Repository implementations
- External service integrations
- Framework-specific implementations

#### Interface Layer (API)
- HTTP controllers
- Request/Response DTOs
- Input validation
- API routes and endpoints

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** >= 14.x

## Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables:**
   ```env
   NODE_ENV=development
   PORT=3000

   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=tm_digital_db

   TYPEORM_SYNCHRONIZE=false
   TYPEORM_LOGGING=true
   ```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create PostgreSQL database:**
   ```bash
   psql -U postgres
   CREATE DATABASE tm_digital_db;
   \q
   ```

3. **Run migrations:**
   ```bash
   npm run migration:run
   ```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

The API will be available at: `http://localhost:3000/api`

### Production Mode
```bash
npm run build
npm run start:prod
```

## Database Migrations

### Generate a new migration
```bash
npm run migration:generate -- src/infrastructure/database/migrations/MigrationName
```

### Run migrations
```bash
npm run migration:run
```

### Revert last migration
```bash
npm run migration:revert
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Leads
- `GET /leads` - List all leads with filtering
- `GET /leads/:id` - Get lead by ID
- `POST /leads` - Create new lead
- `PUT /leads/:id` - Update lead
- `DELETE /leads/:id` - Delete lead
- `GET /leads/:id/properties` - Get lead's rural properties

#### Rural Properties
- `GET /rural-properties` - List all rural properties
- `GET /rural-properties/:id` - Get rural property by ID
- `POST /rural-properties` - Create new rural property
- `PUT /rural-properties/:id` - Update rural property
- `DELETE /rural-properties/:id` - Delete rural property

#### Dashboard (Optional)
- `GET /dashboard/stats` - Get dashboard statistics

## Code Quality

### Format code
```bash
npm run format
```

### Lint code
```bash
npm run lint
```

## Project Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start in standard mode |
| `npm run start:dev` | Start in watch mode |
| `npm run start:prod` | Start production build |
| `npm run build` | Build the project |
| `npm run format` | Format code with Prettier |
| `npm run migration:generate` | Generate new migration |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:revert` | Revert last migration |

## Development Guidelines

- Keep controllers thin - business logic belongs in services/domain
- Use DTOs for all API inputs/outputs
- Apply validation decorators on DTOs
- Keep domain entities framework-agnostic
- Repository pattern for data access
- Use TypeORM migrations - never use synchronize in production

## Core Domain Concepts

### Lead
Represents a potential customer for agricultural inputs.

**Status Lifecycle:**
- `NEW` - Initial state
- `INITIAL_CONTACT` - First contact made
- `NEGOTIATION` - In negotiation process
- `CONVERTED` - Successfully converted to customer
- `LOST` - Lead lost

### Rural Property
Represents agricultural land owned/managed by a lead.

**Crop Types:**
- `SOY` - Soybean cultivation
- `CORN` - Corn cultivation
- `COTTON` - Cotton cultivation

**Priority Indicator:**
- Properties with `areaHectares > 100` are considered high priority

## License

UNLICENSED - Private project for technical assessment
