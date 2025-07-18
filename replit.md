# Library Management System

## Overview

This is a full-stack library management system built with a React frontend and Express.js backend. The application provides both public user interfaces for browsing books and administrative interfaces for managing library operations including books, members, circulation, and analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query** for server state management and API data fetching
- **Tailwind CSS** with **shadcn/ui** components for styling and UI components
- **React Hook Form** with **Zod** validation for form handling

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with endpoints for books, members, circulation, and analytics
- **Drizzle ORM** for database operations and schema management
- **PostgreSQL** database (configured via Neon serverless)
- **Connect-pg-simple** for session storage

### Project Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript types and schemas
└── migrations/      # Database migration files
```

## Key Components

### Database Schema
The system uses PostgreSQL with the following main entities:
- **Books**: Core book information (title, author, category, status, etc.)
- **Members**: Library member details and registration info
- **Categories**: Book categorization system
- **Book Suggestions**: Member-submitted book requests
- **Book Reviews**: Member reviews and ratings
- **Circulation**: Book checkout/return transaction history

### Authentication & Authorization
- Simple admin login system (no complex user authentication implemented)
- Public access for book browsing and suggestions
- Admin-only access for management functions

### API Structure
RESTful endpoints organized by resource:
- `/api/books` - Book management and search
- `/api/members` - Member management
- `/api/categories` - Category management
- `/api/book-suggestions` - Book suggestion system
- `/api/book-reviews` - Review system
- `/api/circulation` - Checkout/return operations
- `/api/analytics` - Reports and statistics

## Data Flow

1. **Public Interface**: Users can browse books, search the catalog, submit book suggestions, and write reviews
2. **Admin Interface**: Librarians manage books, members, process circulation, and view analytics
3. **Database Layer**: Drizzle ORM handles all database operations with type safety
4. **API Layer**: Express routes handle business logic and data validation using Zod schemas

## External Dependencies

### UI Framework
- **@radix-ui/*** - Accessible UI primitives for complex components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Class Variance Authority** - Component variant styling

### Data Management
- **@tanstack/react-query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Runtime type validation
- **Date-fns** - Date manipulation utilities

### Database & Backend
- **@neondatabase/serverless** - Serverless PostgreSQL connection
- **Drizzle ORM** - Type-safe database operations
- **Express.js** - Web server framework

## Deployment Strategy

### Development
- Vite dev server for frontend hot reloading
- Express server with TypeScript compilation via `tsx`
- Database migrations managed through Drizzle Kit
- Environment variables for database configuration

### Production Build
- Frontend built via Vite and served as static files
- Backend compiled to ESM bundle via esbuild
- Single deployment artifact with both frontend and backend
- Database schema managed through migrations

### Environment Configuration
- `DATABASE_URL` required for PostgreSQL connection
- Development vs production modes handled via `NODE_ENV`
- Replit-specific development tooling integration

The architecture emphasizes type safety throughout the stack, with shared TypeScript definitions ensuring consistency between frontend and backend. The modular component structure allows for easy maintenance and feature additions.