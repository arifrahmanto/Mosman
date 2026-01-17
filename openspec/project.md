# Project Context

## Purpose
Aplikasi Keuangan Masjid - A financial management system for mosques to track donations, expenses, and generate financial reports. The system helps mosque administrators manage finances transparently and efficiently.

## Tech Stack
- **Language**: TypeScript
- **Frontend**: React.js with TypeScript
- **Backend**: Express.js (Node.js) with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for receipts and documents)

## Project Conventions

### Code Style
- Use TypeScript with strict mode enabled
- Follow consistent naming conventions:
  - Types/Interfaces: PascalCase (e.g., `DonationRequest`, `IUserProfile`)
  - Components: PascalCase (e.g., `DonationForm.tsx`)
  - Functions/variables: camelCase (e.g., `getTotalDonations`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
  - Database tables: snake_case (e.g., `mosque_donations`)
  - Enums: PascalCase (e.g., `UserRole`, `ExpenseStatus`)
- Use meaningful variable and function names in Indonesian or English
- Prefer functional components and hooks in React
- Use async/await for asynchronous operations
- Always define explicit types for function parameters and return values
- Use interfaces for object shapes, types for unions/intersections
- Avoid using `any` type; use `unknown` if type is truly unknown
- Use enums for fixed sets of values (e.g., roles, status)

### Architecture Patterns
- **Frontend**: Component-based architecture with React + TypeScript
  - Separate components into presentational and container components
  - Use React Context or state management library for global state
  - API calls handled through service layer with typed responses
  - Shared types between frontend and backend
- **Backend**: RESTful API architecture with TypeScript
  - Controllers handle HTTP requests/responses (typed)
  - Services contain business logic with type safety
  - Types/Interfaces define data structures and API contracts
  - Middleware for authentication and validation (typed)
  - DTOs (Data Transfer Objects) for request/response validation
- **Database**: Supabase client for real-time subscriptions and queries with TypeScript types

### Testing Strategy
- Unit tests for business logic and utility functions
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for critical user flows (donation submission, report generation)

### Git Workflow
- Main branch: `main` (production-ready code)
- Development branch: `dev`
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`
- Commit messages in Indonesian or English, clear and descriptive

## Domain Context
- **Pockets/Kas**: Multiple financial pockets for segregating funds:
  - Kas Umum (General fund for mosque operations and general activities)
  - Kas Pembangunan (Building/construction fund for mosque development and renovation)
  - Kas Sawah (Agricultural fund from mosque's rice field management)
  - Kas Anggota (Member contribution fund from member dues and contributions)
  - Each pocket tracks its own balance from donations and expenses
- **Donations (Sumbangan/Infaq)**: Track various types including:
  - Infaq umum (general donations)
  - Zakat (obligatory charity)
  - Sedekah (voluntary charity)
  - Wakaf (endowment)
  - **Each donation must be assigned to a specific pocket**
- **Expenses (Pengeluaran)**: Categories include:
  - Operational costs
  - Building maintenance
  - Employee salaries
  - Religious activities
  - Utilities
  - **Each expense must be assigned to a specific pocket**
- **Reports**: Monthly and annual financial statements per pocket and overall
- **Transparency**: All transactions must be traceable and auditable per pocket
- **Multiple Users**: Support for different roles (admin, treasurer, viewer)

## Important Constraints
- All financial data must be accurate and secure
- Support for Indonesian Rupiah (IDR) currency
- Must comply with Islamic financial principles
- Data privacy for donors (option for anonymous donations)
- Audit trail for all transactions
- Reports must be exportable (PDF, Excel)
- Accessible on desktop and mobile devices

## External Dependencies
- **Supabase**: Database, Authentication, and Storage (with TypeScript SDK)
- **TypeScript**: Type checking and compilation
- **Type Definitions**: @types/* packages for third-party libraries
- **Validation**: Zod or Joi for runtime type validation
- **PDF Generation**: Library for generating financial reports (with TypeScript support)
- **Excel Export**: Library for exporting data to spreadsheet format
- **Date handling**: Library for Islamic calendar dates (Hijri)
- **Number formatting**: Indonesian locale number formatting
