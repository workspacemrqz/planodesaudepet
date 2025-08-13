# UNIPET PLAN - Pet Health Insurance Platform

## Overview

UNIPET PLAN is a comprehensive pet health insurance platform built for the Brazilian market. The application provides a modern, minimalist web interface for pet owners to explore insurance plans, submit contact forms for quotes, and learn about services. The platform features a responsive design with a dark theme (#0E0E0E background) and golden accent colors (#EAA42A), optimized for showcasing pet insurance plans and facilitating customer engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing with pages for home, plans, about, and contact
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessible, consistent design
- **Styling**: Tailwind CSS with custom CSS variables for the UNIPET brand colors and responsive design
- **State Management**: TanStack Query for server state management and API caching
- **Form Handling**: React Hook Form with Zod validation for robust form processing
- **Build System**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ESM modules for modern JavaScript features
- **API Structure**: RESTful endpoints for contact form submissions and admin data retrieval
- **Data Validation**: Zod schemas shared between frontend and backend for consistent validation
- **Development**: Hot module replacement and development middleware integration with Vite

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM with migrations
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Development Storage**: In-memory storage implementation for development and testing
- **Schema Management**: Shared TypeScript schema definitions between client and server

### Contact Management System
- **Form Processing**: Comprehensive contact form capturing pet owner details, pet information, and plan interests
- **Data Models**: Structured contact submissions with fields for name, email, phone, city, pet details, and plan preferences
- **Admin Interface**: API endpoints for retrieving all contact submissions for administrative review

### FAQ Management System
- **Database Storage**: Complete FAQ system with database persistence using PostgreSQL
- **Data Migration**: All existing FAQs from the static page have been imported to the database
- **Dynamic Content**: FAQ page now dynamically loads content from the database in real-time
- **Admin Panel**: Full CRUD operations (Create, Read, Update, Delete) for managing FAQ items through the admin interface
- **Frontend Integration**: Live synchronization between admin changes and public FAQ page display
- **Data Structure**: FAQ items include question, answer, display order, and active status fields

### Authentication and Authorization
- **Current State**: Basic foundation with user schema defined but not fully implemented
- **Session Management**: Express session configuration prepared for future authentication features
- **Security**: CORS and security middleware ready for production deployment

### External Dependencies

#### UI and Design
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Modern icon library for consistent iconography
- **Google Fonts**: Inter font family for modern typography

#### Development and Build Tools
- **Vite**: Fast build tool with HMR and Replit integration plugins
- **TypeScript**: Static type checking across the entire stack
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **ESBuild**: Fast JavaScript bundler for server-side code

#### Database and ORM
- **Neon Database**: Serverless PostgreSQL database service
- **Drizzle Kit**: Database migration and schema management tools
- **connect-pg-simple**: PostgreSQL session store for Express sessions

#### Form and Data Handling
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation library
- **date-fns**: Modern date utility library for date formatting and manipulation

#### Development Experience
- **Replit Integration**: Custom plugins for development environment integration
- **Runtime Error Overlay**: Development error handling and debugging tools