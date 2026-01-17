# Design: Initialize API and Database Configuration

## Architecture Overview

The system follows a three-tier architecture:

```
┌─────────────────────┐
│   Future Frontend   │
│     (React.js)      │
└──────────┬──────────┘
           │ HTTP/REST
           ▼
┌─────────────────────┐
│   Express.js API    │
│  ┌───────────────┐  │
│  │  Controllers  │  │
│  ├───────────────┤  │
│  │   Services    │  │
│  ├───────────────┤  │
│  │  Middleware   │  │
│  └───────────────┘  │
└──────────┬──────────┘
           │ Supabase Client
           ▼
┌─────────────────────┐
│     Supabase        │
│  ┌───────────────┐  │
│  │  PostgreSQL   │  │
│  ├───────────────┤  │
│  │     Auth      │  │
│  ├───────────────┤  │
│  │   Storage     │  │
│  └───────────────┘  │
└─────────────────────┘
```

## Project Structure

```
mosman/
├── server/
│   ├── src/
│   │   ├── types/
│   │   │   ├── database.types.ts  # Supabase generated types
│   │   │   ├── api.types.ts       # API request/response types
│   │   │   ├── auth.types.ts      # Auth-related types
│   │   │   └── index.ts           # Type exports
│   │   ├── config/
│   │   │   ├── supabase.ts        # Supabase client initialization
│   │   │   └── env.ts             # Environment configuration
│   │   ├── middleware/
│   │   │   ├── auth.ts            # Authentication middleware
│   │   │   ├── errorHandler.ts   # Global error handling
│   │   │   └── validator.ts      # Request validation
│   │   ├── routes/
│   │   │   ├── index.ts           # Route aggregator
│   │   │   ├── health.ts          # Health check routes
│   │   │   ├── donations.ts       # Donation routes
│   │   │   └── expenses.ts        # Expense routes
│   │   ├── controllers/
│   │   │   ├── donationController.ts
│   │   │   └── expenseController.ts
│   │   ├── services/
│   │   │   ├── donationService.ts
│   │   │   └── expenseService.ts
│   │   ├── validators/
│   │   │   ├── donation.schema.ts # Zod schemas for donations
│   │   │   └── expense.schema.ts  # Zod schemas for expenses
│   │   ├── utils/
│   │   │   ├── response.ts        # Standard response format
│   │   │   └── logger.ts          # Logging utility
│   │   └── app.ts                 # Express app setup
│   ├── dist/                      # Compiled JavaScript output
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── seeds/
│   │   └── 001_seed_categories.sql
│   ├── .env.example
│   ├── .env
│   ├── tsconfig.json              # TypeScript configuration
│   ├── package.json
│   └── server.ts                  # Entry point
├── openspec/
└── README.md
```

## Database Schema Design

### Core Tables

#### 1. users (managed by Supabase Auth)
- Extended with custom profile table
- Role-based access (admin, treasurer, viewer)

#### 2. pockets
```sql
- id (uuid, PK)
- name (varchar, unique) - e.g., "Kas Umum", "Kas Pembangunan", "Kas Sawah", "Kas Anggota"
- description (text)
- current_balance (numeric(15,2), default 0)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 3. donation_categories
```sql
- id (uuid, PK)
- name (varchar) - e.g., "Infaq Umum", "Zakat", "Sedekah", "Wakaf"
- description (text)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 4. donations
```sql
- id (uuid, PK)
- pocket_id (uuid, FK -> pockets, required)
- category_id (uuid, FK -> donation_categories)
- donor_name (varchar, nullable for anonymous)
- amount (numeric(15,2))
- is_anonymous (boolean)
- payment_method (varchar) - e.g., "cash", "transfer", "qris"
- receipt_url (text, nullable)
- notes (text, nullable)
- donation_date (date)
- recorded_by (uuid, FK -> auth.users)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 5. expense_categories
```sql
- id (uuid, PK)
- name (varchar) - e.g., "Operasional", "Pemeliharaan", "Gaji", "Kegiatan"
- description (text)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 6. expenses
```sql
- id (uuid, PK)
- pocket_id (uuid, FK -> pockets, required)
- category_id (uuid, FK -> expense_categories)
- description (text)
- amount (numeric(15,2))
- receipt_url (text, nullable)
- expense_date (date)
- approved_by (uuid, FK -> auth.users, nullable)
- recorded_by (uuid, FK -> auth.users)
- status (varchar) - "pending", "approved", "rejected"
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 7. user_profiles
```sql
- id (uuid, PK, FK -> auth.users)
- full_name (varchar)
- role (varchar) - "admin", "treasurer", "viewer"
- phone (varchar, nullable)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### Row Level Security (RLS) Policies

1. **Pockets Table**
   - SELECT: All authenticated users can read
   - INSERT/UPDATE/DELETE: Only admin role

2. **Donations Table**
   - SELECT: All authenticated users can read
   - INSERT: Only admin and treasurer roles
   - UPDATE: Only admin and treasurer roles
   - DELETE: Only admin role

3. **Expenses Table**
   - SELECT: All authenticated users can read
   - INSERT: Only admin and treasurer roles
   - UPDATE: Only admin role (for approval)
   - DELETE: Only admin role

4. **Categories Tables**
   - SELECT: All authenticated users can read
   - INSERT/UPDATE/DELETE: Only admin role

5. **User Profiles**
   - SELECT: All authenticated users can read their own profile
   - UPDATE: Only admin can update user profiles

## API Design Patterns

### RESTful Endpoint Structure

```
GET    /api/health                         # Health check

# Pockets
GET    /api/v1/pockets                     # List all pockets with balance
GET    /api/v1/pockets/:id                 # Get single pocket with details
GET    /api/v1/pockets/:id/summary         # Get pocket financial summary
GET    /api/v1/pockets/:pocketId/donations # List donations for specific pocket
GET    /api/v1/pockets/:pocketId/expenses  # List expenses for specific pocket

# Donations
GET    /api/v1/donations                   # List donations (with pagination, filter by pocket_id)
GET    /api/v1/donations/:id               # Get donation by ID
POST   /api/v1/donations                   # Create donation (requires pocket_id)
PUT    /api/v1/donations/:id               # Update donation
DELETE /api/v1/donations/:id               # Delete donation

# Expenses
GET    /api/v1/expenses                    # List expenses (with pagination, filter by pocket_id)
GET    /api/v1/expenses/:id                # Get expense by ID
POST   /api/v1/expenses                    # Create expense (requires pocket_id)
PUT    /api/v1/expenses/:id                # Update expense
DELETE /api/v1/expenses/:id                # Delete expense

# Categories
GET    /api/v1/categories/donations        # List donation categories
GET    /api/v1/categories/expenses         # List expense categories
```

### Standard Response Format

```javascript
// Success response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}

// Error response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional error details */ }
  }
}

// Paginated response
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Authentication Flow

1. User authenticates via Supabase Auth (email/password or social providers)
2. Supabase returns JWT access token
3. Frontend includes token in Authorization header: `Bearer <token>`
4. Express middleware validates token using Supabase client
5. Middleware extracts user ID and role from token
6. Request proceeds if authorized, otherwise returns 401/403

## Security Considerations

1. **Environment Variables**: All sensitive data (API keys, database URLs) in .env
2. **CORS**: Configure allowed origins for API access
3. **Rate Limiting**: Prevent abuse of API endpoints
4. **Input Validation**: Validate all request payloads
5. **SQL Injection Prevention**: Use parameterized queries via Supabase client
6. **RLS Policies**: Enforce data access rules at database level
7. **HTTPS Only**: Production must use HTTPS
8. **JWT Validation**: Verify token signature and expiration

## TypeScript Configuration

### TypeScript Compiler Options

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Type System Architecture

#### 1. Database Types
Generated from Supabase schema using Supabase CLI:
```typescript
// types/database.types.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      donations: {
        Row: {
          id: string
          category_id: string
          donor_name: string | null
          amount: number
          is_anonymous: boolean
          // ... other fields
        }
        Insert: {
          id?: string
          category_id: string
          // ... other fields
        }
        Update: {
          id?: string
          category_id?: string
          // ... other fields
        }
      }
      // ... other tables
    }
  }
}
```

#### 2. API Types
Request and response types for API endpoints:
```typescript
// types/api.types.ts
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface CreateDonationRequest {
  category_id: string
  donor_name?: string
  amount: number
  is_anonymous: boolean
  payment_method: string
  notes?: string
  donation_date: string
}

export interface DonationResponse {
  id: string
  category_id: string
  category_name: string
  donor_name: string | null
  amount: number
  is_anonymous: boolean
  payment_method: string
  donation_date: string
  created_at: string
}
```

#### 3. Auth Types
Authentication and authorization types:
```typescript
// types/auth.types.ts
export enum UserRole {
  ADMIN = 'admin',
  TREASURER = 'treasurer',
  VIEWER = 'viewer'
}

export interface UserProfile {
  id: string
  full_name: string
  role: UserRole
  phone: string | null
  is_active: boolean
}

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name: string
}

export interface AuthRequest extends Request {
  user?: AuthUser
}
```

#### 4. Validation Schemas
Zod schemas for runtime validation:
```typescript
// validators/donation.schema.ts
import { z } from 'zod'

export const createDonationSchema = z.object({
  category_id: z.string().uuid(),
  donor_name: z.string().optional(),
  amount: z.number().positive(),
  is_anonymous: z.boolean(),
  payment_method: z.enum(['cash', 'transfer', 'qris']),
  notes: z.string().optional(),
  donation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})

export type CreateDonationInput = z.infer<typeof createDonationSchema>
```

### TypeScript Build Process

1. **Development**: Use `ts-node-dev` for auto-reload during development
2. **Production**: Compile TypeScript to JavaScript in `dist/` folder
3. **Type Generation**: Generate Supabase types from database schema
4. **Type Checking**: Run `tsc --noEmit` in CI/CD to verify types

## Configuration Management

### Environment Variables

```
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# CORS
CORS_ORIGIN=http://localhost:5173

# Security
JWT_SECRET=xxxxx (if using custom JWT)
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## Trade-offs and Decisions

### Decision 1: Supabase vs Direct PostgreSQL
**Chosen:** Supabase
**Rationale:**
- Built-in authentication system
- Real-time subscriptions for future features
- Storage for receipts and documents
- Row Level Security for data access control
- Reduced backend complexity

**Trade-off:** Vendor lock-in, but acceptable for this use case

### Decision 2: Monorepo vs Separate Repos
**Chosen:** Monorepo (server/ and future client/ in same repo)
**Rationale:**
- Easier to manage for small team
- Shared types/interfaces between frontend and backend
- Simplified deployment pipeline

### Decision 3: JavaScript vs TypeScript
**Chosen:** TypeScript
**Rationale:**
- Type safety catches errors at compile time
- Better IDE support and autocomplete
- Improved code documentation through types
- Supabase has excellent TypeScript support with generated types
- Easier to maintain as the codebase grows
- Better collaboration - types serve as documentation
- Runtime validation with Zod provides additional safety

**Trade-off:** Slightly more initial setup, but long-term benefits outweigh costs

### Decision 4: Migration Tool
**Chosen:** Plain SQL migration files + Supabase CLI
**Rationale:**
- Simple and transparent
- No additional dependencies
- Supabase CLI supports migrations natively
- Easy to version control

## Performance Considerations

1. **Database Indexing**: Create indexes on frequently queried columns (category_id, donation_date, expense_date)
2. **Pagination**: Implement cursor-based pagination for large datasets
3. **Caching**: Consider Redis for frequently accessed data in future
4. **Connection Pooling**: Supabase handles this automatically

## Future Extensions

1. Real-time updates using Supabase subscriptions
2. Advanced filtering and search capabilities
3. Bulk import/export functionality
4. Audit log for all financial transactions
5. Report generation endpoints
6. File upload optimization
