# Tasks: Initialize API and Database Configuration

## Overview
This document outlines the implementation tasks for setting up the API server, database schema, and authentication system for the mosque financial management application.

## Task Sequence

### Phase 1: Project Setup and Configuration

#### Task 1.1: Initialize Server Project Structure with TypeScript
- Create `server/` directory in project root
- Initialize npm project with `npm init -y`
- Install core dependencies:
  - `express` - Web framework
  - `dotenv` - Environment variable management
  - `cors` - Cross-origin resource sharing
  - `morgan` - HTTP request logger
  - `helmet` - Security headers
  - `express-rate-limit` - Rate limiting
  - `@supabase/supabase-js` - Supabase client
  - `zod` - Runtime schema validation
- Install TypeScript and dev dependencies:
  - `typescript` - TypeScript compiler
  - `@types/node` - Node.js type definitions
  - `@types/express` - Express type definitions
  - `@types/cors` - CORS type definitions
  - `@types/morgan` - Morgan type definitions
  - `ts-node-dev` - Development auto-reload with TypeScript
- Create tsconfig.json with strict mode enabled
- Create directory structure: `src/`, `src/types/`, `src/config/`, `src/middleware/`, `src/routes/`, `src/controllers/`, `src/services/`, `src/validators/`, `src/utils/`
- Add build scripts to package.json (build, dev, start)
- **Validation:** Project structure matches design.md layout, TypeScript compiles successfully
- **Dependencies:** None

#### Task 1.2: TypeScript Type Definitions
- Create `src/types/api.types.ts` for API request/response types
- Define `ApiResponse<T>`, `ApiError`, `PaginatedResponse<T>` interfaces
- Create `src/types/auth.types.ts` for auth types
- Define `UserRole` enum (ADMIN, TREASURER, VIEWER)
- Define `AuthUser`, `UserProfile`, `AuthRequest` interfaces
- Create `src/types/index.ts` to export all types
- **Validation:** Types compile without errors and are importable
- **Dependencies:** Task 1.1

#### Task 1.3: Environment Configuration Setup
- Create `.env.example` with all required variables documented
- Create `.env` file (add to .gitignore)
- Implement `src/config/env.ts` to load and validate environment variables with types
- Add validation for required variables (PORT, SUPABASE_URL, SUPABASE_ANON_KEY)
- Implement default values for optional variables
- Define `EnvConfig` interface
- **Validation:** Server fails to start with clear error if required env vars missing
- **Dependencies:** Task 1.2

#### Task 1.4: Supabase Client Configuration with TypeScript
- Create `src/config/supabase.ts`
- Initialize typed Supabase client with anon key for client operations
- Initialize typed Supabase client with service role key for admin operations
- Export both clients with clear naming and types
- Add connection test function with proper return types
- **Validation:** Connection test succeeds with valid credentials, clients are properly typed
- **Dependencies:** Task 1.3

### Phase 2: Core Server Setup

#### Task 2.1: Express App Initialization with TypeScript
- Create `src/app.ts` for Express app configuration
- Configure middleware stack with proper typing:
  - `helmet()` for security headers
  - `cors()` with configured origins
  - `express.json()` for JSON parsing
  - `morgan()` for request logging
  - `express-rate-limit` for rate limiting
- Setup route mounting point (`/api/v1`)
- Configure 404 handler with typed error response
- **Validation:** Server accepts requests and logs them, TypeScript compiles without errors
- **Dependencies:** Task 1.4

#### Task 2.2: Global Error Handler with TypeScript
- Create `src/middleware/errorHandler.ts`
- Define custom error classes with proper typing
- Implement error handler middleware with Express error handler type
- Handle different error types (validation, authentication, database, generic)
- Return standardized error response format using ApiError type
- Log errors with stack traces
- Configure appropriate HTTP status codes
- **Validation:** Thrown errors are caught and returned in standard format with type safety
- **Dependencies:** Task 2.1, Task 1.2

#### Task 2.3: Standard Response Utility with TypeScript
- Create `src/utils/response.ts`
- Implement `successResponse<T>(data: T, message?: string): ApiResponse<T>` function
- Implement `errorResponse(code: string, message: string, details?: any): ApiResponse<never>` function
- Implement `paginatedResponse<T>(data: T[], pagination: Pagination): PaginatedResponse<T>` function
- Use generic types for type safety
- **Validation:** Helper functions return correctly typed responses
- **Dependencies:** Task 1.2

#### Task 2.4: Server Entry Point with TypeScript
- Create `server.ts` as main entry point
- Import app from `src/app.ts`
- Start server on configured PORT with proper typing
- Implement graceful shutdown handler (SIGTERM, SIGINT)
- Add startup logging with environment info
- **Validation:** Server starts, logs startup message, and shuts down gracefully
- **Dependencies:** Task 2.1, Task 2.2

### Phase 3: Authentication System

#### Task 3.1: Authentication Middleware with TypeScript
- Create `src/middleware/auth.ts`
- Implement `authenticate` middleware function with proper Express types
- Extract token from Authorization header
- Validate JWT token with typed Supabase client
- Extract user information from token
- Query user_profiles table for role and status with proper typing
- Attach typed user info to req.user (using AuthRequest type)
- Handle errors (missing token, invalid token, expired token) with typed error responses
- **Validation:** Valid tokens allow access, invalid tokens return 401, TypeScript enforces types
- **Dependencies:** Task 1.4, Task 1.2

#### Task 3.2: Authorization Middleware with TypeScript
- Add `requireRole(...roles: UserRole[])` middleware function to `src/middleware/auth.ts`
- Use UserRole enum for type safety
- Check if req.user.role is in allowed roles
- Return 403 if user lacks required role
- Provide clear error message with required roles
- **Validation:** Users with correct roles access endpoints, others get 403, role types enforced
- **Dependencies:** Task 3.1

#### Task 3.3: Request Validation Middleware with Zod
- Create `src/middleware/validator.ts`
- Implement `validateRequest` middleware factory using Zod schemas
- Create helper to validate request body, query, or params
- Integrate Zod error messages into ApiError format
- Return 400 with clear validation errors from Zod
- **Validation:** Invalid requests return 400 with descriptive errors, runtime and compile-time type safety
- **Dependencies:** Task 2.2, Task 1.2

### Phase 4: Database Schema

#### Task 4.1: Database Migration - Core Tables
- Create `server/migrations/` directory
- Create `001_initial_schema.sql` migration file
- Write SQL to create tables:
  - `pockets` table with columns:
    - id (uuid, PK)
    - name (varchar, unique) - e.g., "Kas Umum", "Kas Pembangunan", "Kas Sawah", "Kas Anggota"
    - description (text)
    - current_balance (numeric(15,2), default 0)
    - is_active (boolean, default true)
    - created_at (timestamp)
    - updated_at (timestamp)
  - `donation_categories` table with all columns and constraints
  - `expense_categories` table with all columns and constraints
  - `user_profiles` table with all columns and foreign key to auth.users
  - `donations` table with all columns, foreign keys, and constraints
    - **Add pocket_id (uuid, FK -> pockets, required)**
  - `expenses` table with all columns, foreign keys, and constraints
    - **Add pocket_id (uuid, FK -> pockets, required)**
- Add UUID generation for primary keys
- Add timestamp defaults (created_at, updated_at)
- **Validation:** Migration runs successfully via Supabase dashboard or CLI
- **Dependencies:** Task 1.4
- **Can be done in parallel with:** Task 3.x

#### Task 4.1b: Generate Supabase TypeScript Types
- Install Supabase CLI if not already installed
- Run `supabase gen types typescript --project-id <project-id> > src/types/database.types.ts`
- Verify generated types match database schema
- Import Database type in Supabase client configuration
- Type the Supabase client with `SupabaseClient<Database>`
- **Validation:** Types are generated, Supabase queries are fully typed
- **Dependencies:** Task 4.1

#### Task 4.2: Database Indexes
- Add to migration file or create `002_indexes.sql`
- Create indexes:
  - `idx_donations_pocket_id` on donations(pocket_id)
  - `idx_donations_category_id` on donations(category_id)
  - `idx_donations_date` on donations(donation_date)
  - `idx_donations_recorded_by` on donations(recorded_by)
  - `idx_expenses_pocket_id` on expenses(pocket_id)
  - `idx_expenses_category_id` on expenses(category_id)
  - `idx_expenses_date` on expenses(expense_date)
  - `idx_expenses_status` on expenses(status)
  - `idx_expenses_recorded_by` on expenses(recorded_by)
- **Validation:** Indexes are created and improve query performance
- **Dependencies:** Task 4.1

#### Task 4.3: Row Level Security Policies
- Create `003_rls_policies.sql` migration file
- Enable RLS on all tables
- Create policies for pockets:
  - SELECT: authenticated users
  - INSERT/UPDATE/DELETE: admin only
- Create policies for donation_categories:
  - SELECT: authenticated users
  - INSERT/UPDATE/DELETE: admin only
- Create policies for donations:
  - SELECT: authenticated users
  - INSERT/UPDATE: admin and treasurer
  - DELETE: admin only
- Create policies for expense_categories:
  - SELECT: authenticated users
  - INSERT/UPDATE/DELETE: admin only
- Create policies for expenses:
  - SELECT: authenticated users
  - INSERT/UPDATE: admin and treasurer (status update admin only)
  - DELETE: admin only
- Create policies for user_profiles:
  - SELECT: own profile or admin
  - UPDATE: admin only
- **Validation:** RLS policies enforce access rules correctly
- **Dependencies:** Task 4.1

#### Task 4.4: Database Triggers and Functions
- Create `004_triggers.sql` migration file
- Create function to update `updated_at` timestamp on row update
- Create trigger to call function on all tables
- Create function to auto-create user_profiles on auth.users insert
- Create trigger on auth.users for profile creation
- **Validation:** Timestamps update automatically, profiles created on user registration
- **Dependencies:** Task 4.1

#### Task 4.5: Seed Data
- Create `server/seeds/` directory
- Create `001_seed_pockets_and_categories.sql`
- Insert pockets:
  - "Kas Umum" - "Kas untuk operasional dan kegiatan umum masjid"
  - "Kas Pembangunan" - "Kas untuk pembangunan dan renovasi masjid"
  - "Kas Sawah" - "Kas dari hasil pengelolaan sawah masjid"
  - "Kas Anggota" - "Kas iuran dan kontribusi anggota masjid"
- Insert donation categories:
  - "Infaq Umum" - "Sumbangan umum untuk operasional masjid"
  - "Zakat" - "Zakat mal dan fitrah"
  - "Sedekah" - "Sedekah sukarela"
  - "Wakaf" - "Wakaf tunai atau barang"
- Insert expense categories:
  - "Operasional" - "Biaya operasional harian masjid"
  - "Pemeliharaan Gedung" - "Perbaikan dan pemeliharaan bangunan"
  - "Gaji Pegawai" - "Gaji imam, marbot, dan pegawai masjid"
  - "Kegiatan Keagamaan" - "Biaya kajian, pengajian, dan kegiatan islami"
  - "Utilitas" - "Listrik, air, dan kebutuhan utilitas lainnya"
- **Validation:** Seed data populates pockets and categories correctly
- **Dependencies:** Task 4.1
- **Can be done in parallel with:** Task 4.2, 4.3, 4.4

### Phase 5: Health Check and Basic Endpoints

#### Task 5.1: Health Check Route with TypeScript
- Create `src/routes/health.ts`
- Define `HealthResponse` interface
- Implement typed GET /api/health endpoint
- Return server status, timestamp, API version
- Check database connectivity with typed Supabase client
- Return "healthy" if database connected, "degraded" otherwise
- **Validation:** Health endpoint returns 200 with correct typed data
- **Dependencies:** Task 2.1, Task 1.4, Task 1.2

#### Task 5.2: Route Aggregator with TypeScript
- Create `src/routes/index.ts`
- Import and mount health routes with proper typing
- Export typed Router
- Configure in `src/app.ts`
- **Validation:** Health endpoint accessible via /api/health
- **Dependencies:** Task 5.1

### Phase 6: Donation Endpoints (Foundation)

#### Task 6.0: Donation Types and Validation Schemas
- Create `src/types/donation.types.ts`
- Define interfaces: `Donation`, `CreateDonationRequest`, `UpdateDonationRequest`, `DonationResponse`
  - **Include pocket_id field (required) in all interfaces**
- Create `src/validators/donation.schema.ts`
- Define Zod schemas:
  - `createDonationSchema` with all validation rules
    - **Include pocket_id: z.string().uuid() (required)**
  - `updateDonationSchema` with optional fields
    - **Include pocket_id: z.string().uuid().optional()**
  - `donationQuerySchema` for filtering
    - **Include pocket_id filter option**
- Export types inferred from Zod schemas
- **Validation:** Types compile, schemas validate correctly including pocket_id
- **Dependencies:** Task 1.2, Task 4.1b

#### Task 6.1: Donation Service Layer with TypeScript
- Create `src/services/donationService.ts`
- Implement fully typed service functions:
  - `getDonations(filters, pagination): Promise<PaginatedResponse<DonationResponse>>`
    - **Support filtering by pocket_id**
  - `getDonationById(id: string): Promise<DonationResponse | null>`
    - **Include pocket information in response**
  - `createDonation(data: CreateDonationRequest, userId: string): Promise<DonationResponse>`
    - **Validate pocket_id exists before creating**
  - `updateDonation(id: string, data: UpdateDonationRequest, userId: string): Promise<DonationResponse>`
    - **Validate pocket_id if updated**
  - `deleteDonation(id: string): Promise<void>`
  - `getDonationsByPocket(pocketId: string, pagination): Promise<PaginatedResponse<DonationResponse>>`
    - **New function to get donations by specific pocket**
- Use typed Supabase client for all queries
- Map database rows to response types including pocket name
- **Validation:** Service functions execute correct typed queries with pocket support
- **Dependencies:** Task 6.0, Task 4.1b, Task 1.4
- **Can be done in parallel with:** Task 6.2

#### Task 6.2: Donation Controller with TypeScript
- Create `src/controllers/donationController.ts`
- Implement typed controller methods using AuthRequest:
  - `listDonations(req: AuthRequest, res: Response)`
  - `getDonation(req: AuthRequest, res: Response)`
  - `createDonation(req: AuthRequest, res: Response)`
  - `updateDonation(req: AuthRequest, res: Response)`
  - `deleteDonation(req: AuthRequest, res: Response)`
- Call corresponding service methods
- Use typed response utilities
- Handle errors with proper typing
- **Validation:** Controllers return standardized typed responses
- **Dependencies:** Task 6.1, Task 2.3, Task 1.2

#### Task 6.3: Donation Routes with TypeScript
- Create `src/routes/donations.ts`
- Define typed routes:
  - GET /api/v1/donations - list with optional pocket_id query param (authenticated)
  - GET /api/v1/donations/:id - get one (authenticated)
  - POST /api/v1/donations - create (admin/treasurer)
    - **Require pocket_id in request body**
  - PUT /api/v1/donations/:id - update (admin/treasurer)
  - DELETE /api/v1/donations/:id - delete (admin only)
  - GET /api/v1/pockets/:pocketId/donations - list donations for specific pocket (authenticated)
- Apply authentication middleware
- Apply authorization middleware with UserRole enum
- Apply validation middleware with Zod schemas
- Mount in `src/routes/index.ts`
- **Validation:** Routes respond correctly with type-safe authentication, authorization, and pocket filtering
- **Dependencies:** Task 6.2, Task 3.1, Task 3.2, Task 3.3

### Phase 7: Expense Endpoints (Foundation)

#### Task 7.0: Expense Types and Validation Schemas
- Create `src/types/expense.types.ts`
- Define interfaces: `Expense`, `CreateExpenseRequest`, `UpdateExpenseRequest`, `ExpenseResponse`
  - **Include pocket_id field (required) in all interfaces**
- Define `ExpenseStatus` enum ('pending', 'approved', 'rejected')
- Create `src/validators/expense.schema.ts`
- Define Zod schemas:
  - `createExpenseSchema` with all validation rules
    - **Include pocket_id: z.string().uuid() (required)**
  - `updateExpenseSchema` with optional fields
    - **Include pocket_id: z.string().uuid().optional()**
  - `approveExpenseSchema` for approval action
  - `expenseQuerySchema` for filtering
    - **Include pocket_id filter option**
- Export types inferred from Zod schemas
- **Validation:** Types compile, schemas validate correctly including pocket_id
- **Dependencies:** Task 1.2, Task 4.1b
- **Can be done in parallel with:** Task 6.x

#### Task 7.1: Expense Service Layer with TypeScript
- Create `src/services/expenseService.ts`
- Implement fully typed service functions:
  - `getExpenses(filters, pagination): Promise<PaginatedResponse<ExpenseResponse>>`
    - **Support filtering by pocket_id**
  - `getExpenseById(id: string): Promise<ExpenseResponse | null>`
    - **Include pocket information in response**
  - `createExpense(data: CreateExpenseRequest, userId: string): Promise<ExpenseResponse>`
    - **Validate pocket_id exists before creating**
  - `updateExpense(id: string, data: UpdateExpenseRequest, userId: string): Promise<ExpenseResponse>`
    - **Validate pocket_id if updated**
  - `approveExpense(id: string, adminId: string): Promise<ExpenseResponse>`
  - `deleteExpense(id: string): Promise<void>`
  - `getExpensesByPocket(pocketId: string, pagination): Promise<PaginatedResponse<ExpenseResponse>>`
    - **New function to get expenses by specific pocket**
- Use typed Supabase client for all queries
- Map database rows to response types including pocket name
- **Validation:** Service functions execute correct typed queries with pocket support
- **Dependencies:** Task 7.0, Task 4.1b, Task 1.4
- **Can be done in parallel with:** Task 7.2, Task 6.x

#### Task 7.2: Expense Controller with TypeScript
- Create `src/controllers/expenseController.ts`
- Implement typed controller methods using AuthRequest:
  - `listExpenses(req: AuthRequest, res: Response)`
  - `getExpense(req: AuthRequest, res: Response)`
  - `createExpense(req: AuthRequest, res: Response)`
  - `updateExpense(req: AuthRequest, res: Response)`
  - `approveExpense(req: AuthRequest, res: Response)`
  - `deleteExpense(req: AuthRequest, res: Response)`
- Call corresponding service methods
- Use typed response utilities
- Handle errors with proper typing
- **Validation:** Controllers return standardized typed responses
- **Dependencies:** Task 7.1, Task 2.3, Task 1.2

#### Task 7.3: Expense Routes with TypeScript
- Create `src/routes/expenses.ts`
- Define typed routes:
  - GET /api/v1/expenses - list with optional pocket_id query param (authenticated)
  - GET /api/v1/expenses/:id - get one (authenticated)
  - POST /api/v1/expenses - create (admin/treasurer)
    - **Require pocket_id in request body**
  - PUT /api/v1/expenses/:id - update (admin/treasurer)
  - PUT /api/v1/expenses/:id/approve - approve (admin only)
  - DELETE /api/v1/expenses/:id - delete (admin only)
  - GET /api/v1/pockets/:pocketId/expenses - list expenses for specific pocket (authenticated)
- Apply authentication middleware
- Apply authorization middleware with UserRole enum
- Apply validation middleware with Zod schemas
- Mount in `src/routes/index.ts`
- **Validation:** Routes respond correctly with type-safe authentication, authorization, and pocket filtering
- **Dependencies:** Task 7.2, Task 3.1, Task 3.2, Task 3.3

### Phase 8: Category and Pocket Endpoints

#### Task 8.1: Category Types and Routes with TypeScript
- Create `src/types/category.types.ts`
- Define interfaces: `DonationCategory`, `ExpenseCategory`
- Create `src/routes/categories.ts`
- Define typed routes:
  - GET /api/v1/categories/donations - list donation categories (authenticated)
  - GET /api/v1/categories/expenses - list expense categories (authenticated)
- Implement simple typed controller functions inline or create `src/controllers/categoryController.ts`
- Query donation_categories and expense_categories tables with typed Supabase client
- Filter by is_active = true
- Return typed responses
- Mount in `src/routes/index.ts`
- **Validation:** Category endpoints return seed data correctly with proper types
- **Dependencies:** Task 4.1, Task 4.1b, Task 4.5, Task 3.1, Task 1.2
- **Can be done in parallel with:** Task 6.x, Task 7.x, Task 8.2

#### Task 8.2: Pocket Types and Routes with TypeScript
- Create `src/types/pocket.types.ts`
- Define interfaces: `Pocket`, `PocketBalance`, `PocketSummary`
- Create `src/routes/pockets.ts`
- Define typed routes:
  - GET /api/v1/pockets - list all pockets with current balance (authenticated)
  - GET /api/v1/pockets/:id - get single pocket with detailed balance info (authenticated)
  - GET /api/v1/pockets/:id/summary - get pocket summary (total donations, total expenses, balance) (authenticated)
- Implement typed controller functions or create `src/controllers/pocketController.ts`
- Query pockets table with typed Supabase client
- Calculate current_balance from donations and expenses for each pocket
- Filter by is_active = true
- Return typed responses with pocket balance information
- Mount in `src/routes/index.ts`
- **Validation:** Pocket endpoints return seed data correctly with balance calculations
- **Dependencies:** Task 4.1, Task 4.1b, Task 4.5, Task 3.1, Task 1.2, Task 6.3, Task 7.3
- **Can be done in parallel with:** Task 8.1

### Phase 9: Documentation and Testing

#### Task 9.1: API Documentation with TypeScript
- Create `server/README.md`
- Document TypeScript setup and build process
- Document all endpoints with typed examples
- Document authentication flow with type information
- Document environment variables
- Document how to run migrations and generate types
- Document how to seed data
- Add example requests with curl or Postman including type information
- Document npm scripts (dev, build, start, type-check)
- **Validation:** Documentation is clear and complete
- **Dependencies:** All previous tasks
- **Can be done in parallel with:** Task 9.2

#### Task 9.2: Manual Testing Checklist with TypeScript
- Create `server/TESTING.md`
- Document manual test scenarios for each endpoint
- Test authentication success and failure cases
- Test authorization for different roles with UserRole enum
- Test validation errors from Zod schemas
- Test database operations with typed responses
- Test health check
- Test TypeScript compilation (`npm run build`)
- Test type checking (`npm run type-check`)
- **Validation:** All test scenarios pass, TypeScript compiles without errors
- **Dependencies:** All previous tasks

#### Task 9.3: Environment Setup Documentation
- Update main `README.md` in project root
- Document TypeScript prerequisites
- Document how to set up Supabase project
- Document how to get Supabase credentials
- Document how to install dependencies including TypeScript
- Document how to run migrations
- Document how to generate Supabase TypeScript types
- Document how to seed data
- Document how to start the development server with ts-node-dev
- Document how to build for production
- **Validation:** A new developer can follow docs to set up the project
- **Dependencies:** All previous tasks

## Parallelizable Work

The following tasks can be worked on in parallel:
- **Phase 1** tasks are sequential
- **Phase 2** tasks are mostly sequential
- **Phase 3** and **Phase 4** can be done in parallel
- **Phase 6** and **Phase 7** can be done in parallel after Phase 3 and 4 complete
- **Phase 8** can be done in parallel with Phase 6 and 7
- **Phase 9** tasks can all be done in parallel after other phases complete

## Success Metrics

- TypeScript compiles without errors (tsc --noEmit)
- All migrations run successfully
- Supabase types are generated and integrated
- Server starts without errors
- Health check returns 200
- All CRUD endpoints work for donations and expenses with full type safety
- Authentication and authorization work correctly with typed requests
- RLS policies enforce access rules
- Zod validation schemas validate runtime data
- Seed data loads successfully
- No usage of `any` type in production code
- Documentation is complete with TypeScript examples

## Estimated Completion

This change includes approximately 35+ discrete tasks organized into 9 phases. The tasks build incrementally to deliver a fully type-safe API with TypeScript, authentication, database schema, and core endpoints for managing mosque finances. The addition of TypeScript adds type definitions, validation schemas, and type generation tasks throughout the implementation.
