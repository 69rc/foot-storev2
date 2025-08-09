# E-commerce Footwear Application

## Overview

This is a full-stack e-commerce application built for selling footwear. The application features a modern React frontend with a Node.js/Express backend, PostgreSQL database, and comprehensive authentication system. It includes customer-facing features for browsing and purchasing shoes, as well as admin functionality for managing products and orders.

## User Preferences

Preferred communication footstore: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent, accessible design
- **Form Handling**: React Hook Form with Zod for validation and type safety

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and request logging
- **Session Management**: Express sessions with PostgreSQL storage for persistent user sessions
- **Middleware**: Custom authentication middleware for protected routes

### Database Design
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Well-structured tables for users, products, shopping cart, orders, and sessions
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Connection**: Neon serverless PostgreSQL with connection pooling

### Authentication System
- **Provider**: Replit Auth (OpenID Connect) for secure user authentication
- **Strategy**: Passport.js with OpenID Connect strategy
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Authorization**: Role-based access control (customer vs admin roles)

### Key Features
- **Product Management**: CRUD operations for products with category organization
- **Shopping Cart**: Persistent cart functionality with quantity management
- **Order Processing**: Complete order workflow with status tracking
- **Admin Dashboard**: Product and order management interface
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Data Flow
- Frontend makes API requests to Express backend
- Backend validates requests and handles authentication
- Drizzle ORM manages database operations with type safety
- React Query handles client-side caching and synchronization
- Sessions persist user state across browser sessions

## External Dependencies

### Database Service
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Environment**: Requires `DATABASE_URL` environment variable

### Authentication Service
- **Replit Auth**: OpenID Connect provider for user authentication
- **Configuration**: Requires `REPLIT_DOMAINS`, `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables

### UI Component Libraries
- **Radix UI**: Headless, accessible component primitives
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library built on Radix UI

### Development Tools
- **Vite**: Build tool with hot module replacement and fast builds
- **TypeScript**: Type safety across the entire application
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **PostCSS**: CSS processing with autoprefixer

### Production Considerations
- **Build Process**: Vite for frontend, esbuild for backend bundling
- **Asset Serving**: Express serves static assets in production
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Logging**: Request logging for API endpoints with response details