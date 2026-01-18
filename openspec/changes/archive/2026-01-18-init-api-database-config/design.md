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
│   │   │   ├── auth.ts            # Authentication routes
│   │   │   ├── users.ts           # User management routes
│   │   │   ├── donations.ts       # Donation routes
│   │   │   ├── expenses.ts        # Expense routes
│   │   │   ├── pockets.ts         # Pocket routes
│   │   │   └── categories.ts      # Category routes
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── donationController.ts
│   │   │   └── expenseController.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── userService.ts
│   │   │   ├── donationService.ts
│   │   │   └── expenseService.ts
│   │   ├── validators/
│   │   │   ├── auth.schema.ts     # Zod schemas for authentication
│   │   │   ├── user.schema.ts     # Zod schemas for user management
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
- donor_name (varchar, nullable for anonymous)
- is_anonymous (boolean)
- payment_method (varchar) - e.g., "cash", "transfer", "qris"
- receipt_url (text, nullable)
- notes (text, nullable)
- donation_date (date)
- recorded_by (uuid, FK -> auth.users)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 4a. donation_items
```sql
- id (uuid, PK)
- donation_id (uuid, FK -> donations, ON DELETE CASCADE)
- category_id (uuid, FK -> donation_categories)
- amount (numeric(15,2))
- description (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

**Rationale**: Separating donation items allows a single donation to be split across multiple categories. For example, a 100,000 donation can be allocated as 70,000 for "Infaq Umum" and 30,000 for "Zakat". The total donation amount is calculated by summing all items.

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
- description (text)
- receipt_url (text, nullable)
- expense_date (date)
- approved_by (uuid, FK -> auth.users, nullable)
- recorded_by (uuid, FK -> auth.users)
- status (varchar) - "pending", "approved", "rejected"
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 6a. expense_items
```sql
- id (uuid, PK)
- expense_id (uuid, FK -> expenses, ON DELETE CASCADE)
- category_id (uuid, FK -> expense_categories)
- amount (numeric(15,2))
- description (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

**Rationale**: Separating expense items allows a single expense transaction to be split across multiple categories. For example, a 500,000 expense can be allocated as 300,000 for "Operasional" and 200,000 for "Pemeliharaan". The total expense amount is calculated by summing all items.

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

3. **Donation Items Table**
   - SELECT: All authenticated users can read
   - INSERT: Only admin and treasurer roles (same as parent donation)
   - UPDATE: Only admin and treasurer roles (same as parent donation)
   - DELETE: CASCADE on parent donation delete

4. **Expenses Table**
   - SELECT: All authenticated users can read
   - INSERT: Only admin and treasurer roles
   - UPDATE: Only admin role (for approval)
   - DELETE: Only admin role

5. **Expense Items Table**
   - SELECT: All authenticated users can read
   - INSERT: Only admin and treasurer roles (same as parent expense)
   - UPDATE: Only admin role (same as parent expense)
   - DELETE: CASCADE on parent expense delete

6. **Categories Tables**
   - SELECT: All authenticated users can read
   - INSERT/UPDATE/DELETE: Only admin role

7. **User Profiles**
   - SELECT: All authenticated users can read their own profile
   - UPDATE: Only admin can update user profiles

## API Design Patterns

### RESTful Endpoint Structure

```
GET    /api/health                         # Health check

# Authentication
POST   /api/v1/auth/register               # Register new user
POST   /api/v1/auth/login                  # Login user
POST   /api/v1/auth/logout                 # Logout user
POST   /api/v1/auth/refresh                # Refresh access token
POST   /api/v1/auth/forgot-password        # Request password reset
POST   /api/v1/auth/reset-password         # Reset password with token
PUT    /api/v1/auth/change-password        # Change user password
GET    /api/v1/auth/me                     # Get current user profile
PUT    /api/v1/auth/me                     # Update current user profile

# User Management (Admin only)
GET    /api/v1/users                       # List all users
GET    /api/v1/users/:id                   # Get user by ID
PUT    /api/v1/users/:id                   # Update user (role, status)
DELETE /api/v1/users/:id                   # Deactivate user

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
PUT    /api/v1/expenses/:id/approve        # Approve/reject expense (Admin only)
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

### Example API Requests with Line Items

#### Create Donation Request
```json
POST /api/v1/donations
{
  "pocket_id": "11111111-1111-1111-1111-111111111111",
  "donor_name": "Ahmad Yusuf",
  "is_anonymous": false,
  "payment_method": "transfer",
  "donation_date": "2026-01-18",
  "notes": "Donasi dari hasil usaha",
  "items": [
    {
      "category_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "amount": 700000,
      "description": "Infaq Umum"
    },
    {
      "category_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      "amount": 300000,
      "description": "Zakat Mal"
    }
  ]
}
```

#### Create Donation Response
```json
{
  "success": true,
  "data": {
    "id": "12345678-1234-1234-1234-123456789012",
    "pocket_id": "11111111-1111-1111-1111-111111111111",
    "pocket_name": "Kas Umum",
    "donor_name": "Ahmad Yusuf",
    "is_anonymous": false,
    "payment_method": "transfer",
    "donation_date": "2026-01-18",
    "total_amount": 1000000,
    "items": [
      {
        "id": "item-111",
        "category_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "category_name": "Infaq Umum",
        "amount": 700000,
        "description": "Infaq Umum"
      },
      {
        "id": "item-222",
        "category_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "category_name": "Zakat",
        "amount": 300000,
        "description": "Zakat Mal"
      }
    ],
    "created_at": "2026-01-18T10:30:00Z"
  },
  "message": "Donation created successfully"
}
```

#### Create Expense Request
```json
POST /api/v1/expenses
{
  "pocket_id": "11111111-1111-1111-1111-111111111111",
  "description": "Pembelian peralatan masjid dan honor pengurus",
  "expense_date": "2026-01-18",
  "receipt_url": "https://example.com/receipt.pdf",
  "notes": "Pembayaran bulan Januari",
  "items": [
    {
      "category_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
      "amount": 3000000,
      "description": "Operasional - Listrik dan air"
    },
    {
      "category_id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
      "amount": 2000000,
      "description": "Pemeliharaan - Cat dan perbaikan"
    }
  ]
}
```

#### Create Expense Response
```json
{
  "success": true,
  "data": {
    "id": "87654321-4321-4321-4321-210987654321",
    "pocket_id": "11111111-1111-1111-1111-111111111111",
    "pocket_name": "Kas Umum",
    "description": "Pembelian peralatan masjid dan honor pengurus",
    "expense_date": "2026-01-18",
    "status": "pending",
    "total_amount": 5000000,
    "items": [
      {
        "id": "item-333",
        "category_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
        "category_name": "Operasional",
        "amount": 3000000,
        "description": "Operasional - Listrik dan air"
      },
      {
        "id": "item-444",
        "category_id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
        "category_name": "Pemeliharaan",
        "amount": 2000000,
        "description": "Pemeliharaan - Cat dan perbaikan"
      }
    ],
    "approved_by": null,
    "created_at": "2026-01-18T14:15:00Z"
  },
  "message": "Expense created successfully"
}
```

## Authentication Flow

### Registration Flow
1. User submits registration form (email, password, full_name)
2. API validates input data with Zod schema
3. API calls Supabase Auth `signUp()` to create auth user
4. API creates user_profile record with default 'viewer' role
5. API returns success message

### Login Flow
1. User submits login credentials (email, password)
2. API calls Supabase Auth `signInWithPassword()`
3. Supabase validates credentials and returns JWT access token + refresh token
4. API fetches user_profile from database (includes role, is_active status)
5. API returns tokens + user profile to frontend
6. Frontend stores tokens (access token in memory, refresh token securely)

### Authenticated Request Flow
1. Frontend includes access token in Authorization header: `Bearer <token>`
2. Express middleware validates token using Supabase client `getUser()`
3. Middleware extracts user ID from validated token
4. Middleware queries user_profiles table for role and is_active status
5. Middleware attaches user info to `req.user` (AuthRequest type)
6. Authorization middleware checks if user role is allowed
7. Request proceeds if authorized, otherwise returns 401/403

### Token Refresh Flow
1. Frontend detects access token expiration
2. Frontend sends refresh token to `/api/v1/auth/refresh`
3. API calls Supabase Auth `refreshSession()`
4. Supabase validates refresh token and returns new access token
5. API returns new tokens to frontend

### Password Reset Flow
1. User requests password reset with email at `/api/v1/auth/forgot-password`
2. API calls Supabase Auth `resetPasswordForEmail()`
3. Supabase sends reset email with magic link
4. User clicks link and submits new password at `/api/v1/auth/reset-password`
5. API calls Supabase Auth `updateUser()` to set new password
6. API returns success message

### Logout Flow
1. User clicks logout
2. Frontend calls `/api/v1/auth/logout`
3. API calls Supabase Auth `signOut()`
4. Frontend clears stored tokens
5. User redirected to login page

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
          pocket_id: string
          donor_name: string | null
          is_anonymous: boolean
          payment_method: string
          receipt_url: string | null
          notes: string | null
          donation_date: string
          recorded_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pocket_id: string
          donor_name?: string | null
          is_anonymous: boolean
          payment_method: string
          receipt_url?: string | null
          notes?: string | null
          donation_date: string
          recorded_by: string
        }
        Update: {
          pocket_id?: string
          donor_name?: string | null
          is_anonymous?: boolean
          payment_method?: string
          receipt_url?: string | null
          notes?: string | null
          donation_date?: string
        }
      }
      donation_items: {
        Row: {
          id: string
          donation_id: string
          category_id: string
          amount: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          category_id: string
          amount: number
          description?: string | null
        }
        Update: {
          category_id?: string
          amount?: number
          description?: string | null
        }
      }
      expenses: {
        Row: {
          id: string
          pocket_id: string
          description: string
          receipt_url: string | null
          expense_date: string
          approved_by: string | null
          recorded_by: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pocket_id: string
          description: string
          receipt_url?: string | null
          expense_date: string
          recorded_by: string
          status?: string
          notes?: string | null
        }
        Update: {
          pocket_id?: string
          description?: string
          receipt_url?: string | null
          expense_date?: string
          approved_by?: string | null
          status?: string
          notes?: string | null
        }
      }
      expense_items: {
        Row: {
          id: string
          expense_id: string
          category_id: string
          amount: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          expense_id: string
          category_id: string
          amount: number
          description?: string | null
        }
        Update: {
          category_id?: string
          amount?: number
          description?: string | null
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

export interface DonationItem {
  category_id: string
  amount: number
  description?: string
}

export interface DonationItemResponse {
  id: string
  category_id: string
  category_name: string
  amount: number
  description: string | null
}

export interface CreateDonationRequest {
  pocket_id: string
  donor_name?: string
  is_anonymous: boolean
  payment_method: string
  notes?: string
  donation_date: string
  items: DonationItem[]  // Array of donation items with category and amount
}

export interface DonationResponse {
  id: string
  pocket_id: string
  pocket_name: string
  donor_name: string | null
  is_anonymous: boolean
  payment_method: string
  donation_date: string
  total_amount: number  // Sum of all items
  items: DonationItemResponse[]
  created_at: string
}

export interface ExpenseItem {
  category_id: string
  amount: number
  description?: string
}

export interface ExpenseItemResponse {
  id: string
  category_id: string
  category_name: string
  amount: number
  description: string | null
}

export interface CreateExpenseRequest {
  pocket_id: string
  description: string
  expense_date: string
  receipt_url?: string
  notes?: string
  items: ExpenseItem[]  // Array of expense items with category and amount
}

export interface ExpenseResponse {
  id: string
  pocket_id: string
  pocket_name: string
  description: string
  expense_date: string
  status: string
  total_amount: number  // Sum of all items
  items: ExpenseItemResponse[]
  approved_by: string | null
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
  created_at: string
  updated_at: string
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

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: AuthUser
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
  }
}

export interface UpdateProfileRequest {
  full_name?: string
  phone?: string
}
```

#### 4. Validation Schemas
Zod schemas for runtime validation:
```typescript
// validators/donation.schema.ts
import { z } from 'zod'

export const donationItemSchema = z.object({
  category_id: z.string().uuid('Category ID must be a valid UUID'),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().max(500).optional(),
})

export const createDonationSchema = z.object({
  pocket_id: z.string().uuid('Pocket ID must be a valid UUID'),
  donor_name: z.string().min(1).max(255).optional(),
  is_anonymous: z.boolean(),
  payment_method: z.enum(['cash', 'transfer', 'qris']),
  notes: z.string().max(1000).optional(),
  donation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  items: z.array(donationItemSchema).min(1, 'At least one item is required'),
})

export type CreateDonationInput = z.infer<typeof createDonationSchema>

// validators/expense.schema.ts
export const expenseItemSchema = z.object({
  category_id: z.string().uuid('Category ID must be a valid UUID'),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().max(500).optional(),
})

export const createExpenseSchema = z.object({
  pocket_id: z.string().uuid('Pocket ID must be a valid UUID'),
  description: z.string().min(1, 'Description is required'),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  receipt_url: z.string().url('Receipt URL must be a valid URL').optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(expenseItemSchema).min(1, 'At least one item is required'),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
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

### Decision 4: Line Items for Donations and Expenses
**Chosen:** Separate `donation_items` and `expense_items` tables
**Rationale:**
- **Flexibility**: Allows a single transaction to be split across multiple categories
  - Example: A 100,000 donation can be allocated as 70,000 for "Infaq Umum" and 30,000 for "Zakat"
  - Example: A 500,000 expense can be split as 300,000 for "Operasional" and 200,000 for "Pemeliharaan"
- **Accuracy**: More accurately reflects real-world accounting where transactions often span multiple categories
- **Reporting**: Easier to generate category-wise reports by querying items directly
- **Audit Trail**: Individual line items can have their own descriptions and tracking
- **Data Integrity**: Total amounts are calculated from items, ensuring consistency

**Trade-off:**
- Slightly more complex data model and API structure
- Requires nested transaction handling (parent record + child items)
- Additional validation needed to ensure at least one item exists per transaction

**Alternative Considered:** Single category per transaction
- Rejected because it would require creating multiple transactions for split allocations
- Would make reporting more complex as related transactions need manual grouping

### Decision 5: Migration Tool
**Chosen:** Plain SQL migration files + Supabase CLI
**Rationale:**
- Simple and transparent
- No additional dependencies
- Supabase CLI supports migrations natively
- Easy to version control

## Performance Considerations

1. **Database Indexing**: Create indexes on frequently queried columns
   - `donations`: `pocket_id`, `donation_date`, `recorded_by`
   - `donation_items`: `donation_id` (FK), `category_id`, composite index on `(donation_id, category_id)`
   - `expenses`: `pocket_id`, `expense_date`, `status`, `recorded_by`
   - `expense_items`: `expense_id` (FK), `category_id`, composite index on `(expense_id, category_id)`
   - Category tables: `is_active` for filtering
   - Pockets: `is_active` for filtering

2. **Query Optimization**:
   - Use JOINs to fetch donations/expenses with their items in a single query
   - Avoid N+1 queries by using Supabase's foreign table syntax or explicit joins
   - Calculate total amounts in database using SUM aggregation where possible

3. **Pagination**: Implement cursor-based pagination for large datasets

4. **Caching**: Consider Redis for frequently accessed data in future
   - Category lists (rarely change)
   - Pocket lists and balances
   - User profiles and permissions

5. **Connection Pooling**: Supabase handles this automatically

6. **Transaction Handling**: Use database transactions when creating/updating parent records with items to maintain data integrity

## Future Extensions

1. Real-time updates using Supabase subscriptions
2. Advanced filtering and search capabilities
3. Bulk import/export functionality
4. Audit log for all financial transactions
5. Report generation endpoints
6. File upload optimization
