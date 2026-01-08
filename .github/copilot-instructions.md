# Copilot Instructions – Technical Assessment 2025

## Project Context

This project is a **full-stack CRUD system** developed as part of a technical assessment.

The client is an **agricultural input distributor** operating in **Minas Gerais, Brazil**, focused on selling **fertilizers** for:
- Soybean
- Corn
- Cotton

The main business goal is to **improve lead management and sales prospecting**, helping the commercial team:
- Discover and prioritize new leads
- Track lead history and current status
- Gain visibility into potential high-value customers

The solution must be **simple, practical, and production-oriented**, avoiding unnecessary complexity.

---

## Technology Stack (Mandatory)

### Backend
- **Node.js**
- **NestJS**
- **TypeORM**
- **PostgreSQL**
- **TypeScript**
- **class-validator / class-transformer**

### Frontend
- **Angular**
- **PrimeNG**
- **TypeScript**
- **HTML / SCSS**

No other frameworks or databases should be introduced unless explicitly required.

---

## Architectural Approach

The system must follow a **layered and modular architecture**, prioritizing:
- Maintainability
- Scalability
- Clear separation of concerns

### Backend Architecture

Adopt **Domain-Driven Design (DDD)** principles **where appropriate**, without overengineering.

#### Layers

- **Domain**
  - Entities
  - Enums
  - Domain rules and invariants
- **Application**
  - Use cases
  - Services coordinating domain logic
- **Infrastructure**
  - Database entities (TypeORM)
  - Repositories
  - Persistence concerns
- **Interface (API)**
  - Controllers
  - DTOs
  - Validation
  - HTTP concerns

> DDD should be applied pragmatically.  
> The goal is clarity and business alignment, not academic purity.

---

## Core Domain Concepts

### Lead

Represents a potential customer.

**Fields:**
- `id`
- `name`
- `cpf`
- `status` (`NEW`, `INITIAL_CONTACT`, `NEGOTIATION`, `CONVERTED`, `LOST`)
- `comments`
- `municipality`
- `createdAt`
- `updatedAt`

---

### RuralProperty

Represents a rural property owned or managed by a lead.

- Each property belongs to **one Lead**
- A Lead can have **multiple Rural Properties**

**Fields:**
- `id`
- `leadId`
- `cropType` (`SOY`, `CORN`, `COTTON`)
- `areaHectares`
- `geometry` (stored as text or JSON, no map visualization required)
- `createdAt`
- `updatedAt`

---

## Functional Requirements

### Mandatory Features

- Full CRUD for Leads
- Full CRUD for Rural Properties
- Filtering and listing capabilities
- Clear lead status lifecycle
- Data validation on both backend and frontend

---

### Optional / Differential Features

- Simple dashboard with:
  - Total leads
  - Leads grouped by status
  - Leads grouped by municipality
- Visual indicator for **priority leads**  
  - Any lead with at least one property where `areaHectares > 100`

---

## Backend Guidelines  
**NestJS + TypeORM + PostgreSQL**

- Use **NestJS modular architecture**
- Create modules aligned with the domain:
  - Leads
  - Rural Properties
  - Dashboard (optional)
- Keep **controllers thin**
- Place business rules in:
  - Domain entities
  - Application services / use cases
- Use **DTOs** as contracts between API and application layer
- Apply **class-validator** for input validation
- Use migrations for database schema
- Implement proper error handling and HTTP status codes

---

## Frontend Guidelines  
**Angular + PrimeNG**

- Feature-based folder structure
- Separation between:
  - Pages
  - Components
  - Services
- Use **PrimeNG** components for:
  - Tables
  - Forms
  - Dialogs
  - Status tags
  - Dashboard cards
- Responsive layout
- Visual clarity and productivity-focused UX
- Align frontend models with backend DTOs

---

## API Design Guidelines

- RESTful API design
- Predictable and consistent routes

**Examples:**
- `GET /leads`
- `POST /leads`
- `PUT /leads/:id`
- `DELETE /leads/:id`
- `GET /leads/:id/properties`

- Use proper HTTP status codes
- Keep response formats consistent

---

## Coding Standards & Best Practices

- Prefer clarity over cleverness
- Avoid premature optimization
- Keep functions small and cohesive
- Use meaningful naming conventions
- Follow SOLID principles where applicable
- Write code as if it will be maintained by another engineer

---

## Non-Requirements

Do **NOT** implement unless explicitly requested:

- External API integrations
- Geographical maps or spatial visualizations
- Advanced authentication or authorization
- Automated tests (unit or e2e)

---

## Documentation Expectations

Provide a clear `README.md` including:

- Project overview
- Architecture explanation
- Tech stack
- Environment requirements
- Step-by-step setup instructions (backend & frontend)
- How to run the project locally

---

## Delivery Mindset

- This project will be reviewed by **senior engineers**
- Prioritize:
  - Correctness
  - Code organization
  - Maintainability
  - Architectural consistency
- The goal is to demonstrate **solid engineering fundamentals**, not complexity
