# TM Digital Test - Frontend

## Project Overview

This is the Angular frontend application for the TM Digital Test project, an agricultural input distributor lead management system for Minas Gerais, Brazil.

> 📖 **Para instruções completas de setup do projeto (incluindo backend e banco de dados), veja o [README principal](../README.md)**

## Technology Stack

- **Angular**: 17.3.12
- **PrimeNG**: 17.18.11 (UI Components)
- **PrimeIcons**: 7.0.0 (Icons)
- **PrimeFlex**: 3.3.1 (Utility CSS)
- **TypeScript**: 5.4.2

## Prerequisites

- Node.js 18+ or 20+
- npm 9+ or 10+
- Angular CLI 17+

## Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm start
# Or: ng serve

# Navigate to http://localhost:4200/
```

## Project Structure

✅ Clean architecture with core, shared, features, and layout layers
✅ Standalone components for better tree-shaking
✅ Lazy loading routes configured
✅ Environment files set up

See [ANGULAR-FOLDER-STRUCTURE.md](../ANGULAR-FOLDER-STRUCTURE.md) for complete details.

## What's Configured

✅ Angular 17.3.12 project created
✅ PrimeNG 17.18.11 + PrimeIcons + PrimeFlex installed
✅ Global styles with CSS custom properties
✅ Responsive design utilities
✅ Status badges (NEW, INITIAL_CONTACT, NEGOTIATION, CONVERTED, LOST)
✅ Crop badges (SOY, CORN, COTTON)
✅ Priority indicators
✅ Core models (Lead, RuralProperty, Dashboard)
✅ Base API service with HttpClient
✅ Routing with lazy loading
✅ Environment configuration (dev & prod)

## API Configuration

The app connects to the backend API at:
- Development: http://localhost:3000
- Production: /api (relative path)

Configure in `src/environments/environment.ts`

## Building

```bash
# Development build
npm run build

# Production build
ng build --configuration production
```

## Next Steps - Implementation TODO

1. Create layout components (header, sidebar, main-layout)
2. Implement Dashboard page with stat cards
3. Implement Leads module (list, detail, form)
4. Implement Rural Properties module (list, detail, form)
5. Create shared components (badges, loading, empty-state)
6. Add HTTP interceptor for error handling
7. Implement forms with validation

## Documentation

- [ANGULAR-SETUP.md](../ANGULAR-SETUP.md) - Setup guide
- [ANGULAR-FOLDER-STRUCTURE.md](../ANGULAR-FOLDER-STRUCTURE.md) - Architecture details
- [API.md](../API.md) - Backend API reference

## License

Technical Assessment - TM Digital
