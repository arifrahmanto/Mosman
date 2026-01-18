# Mosman API Server

Backend API server for mosque financial management system built with TypeScript, Express.js, and Supabase.

## Features

- **TypeScript**: Fully typed codebase with strict mode enabled
- **Express.js**: REST API with standardized response formats
- **Supabase**: PostgreSQL database with Row Level Security (RLS)
- **Authentication**: JWT-based auth with role-based access control
- **Validation**: Runtime validation using Zod schemas
- **Security**: Helmet, CORS, rate limiting, and RLS policies
- **API Documentation**: Interactive Swagger/OpenAPI documentation

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Supabase account and project

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Setup

### 1. Run Migrations

Execute the migration files in Supabase SQL Editor in this order:

1. `migrations/001_initial_schema.sql` - Create tables
2. `migrations/002_indexes.sql` - Create indexes
3. `migrations/003_rls_policies.sql` - Set up Row Level Security
4. `migrations/004_triggers.sql` - Create triggers

### 2. Seed Data

Run the seed file in Supabase SQL Editor:

```sql
-- seeds/001_seed_pockets_and_categories.sql
```

This creates initial pockets and categories.

### 3. Generate TypeScript Types

Generate Supabase TypeScript types:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Generate types
supabase gen types typescript --linked > src/types/database.types.ts
```

Note: Replace `your-project-ref` with your Supabase project reference ID.

## Development

Start the development server:

```bash
npm run dev
```

The server will run on `http://localhost:3000` with auto-reload enabled.

### API Documentation

Interactive API documentation is available via Swagger UI:

**URL**: `http://localhost:3000/api/docs`

The Swagger UI provides:
- 📖 Complete API endpoint documentation
- 🧪 Interactive API testing (try it out)
- 📝 Request/response schemas
- 🔐 Authentication support (add your Bearer token)
- 📋 Request examples

**Quick Start with Swagger:**
1. Start the server: `npm run dev`
2. Open browser: `http://localhost:3000/api/docs`
3. Click "Authorize" and enter your JWT token
4. Try out any endpoint by clicking "Try it out"

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Check TypeScript types without emitting files

## API Endpoints

### Documentation

- `GET /api/docs` - **Interactive Swagger UI Documentation** 📚
- `GET /api/v1` - API information and endpoints list

### Health Check

- `GET /api/health` - Server health status

### Authentication

All endpoints except `/api/health` require authentication via Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

### Donations

- `GET /api/v1/donations` - List donations (filters: pocket_id, category_id, start_date, end_date, payment_method, page, page_size)
- `GET /api/v1/donations/:id` - Get donation by ID
- `POST /api/v1/donations` - Create donation (Admin, Treasurer)
- `PUT /api/v1/donations/:id` - Update donation (Admin, Treasurer)
- `DELETE /api/v1/donations/:id` - Delete donation (Admin only)

### Expenses

- `GET /api/v1/expenses` - List expenses (filters: pocket_id, category_id, status, start_date, end_date, page, page_size)
- `GET /api/v1/expenses/:id` - Get expense by ID
- `POST /api/v1/expenses` - Create expense (Admin, Treasurer)
- `PUT /api/v1/expenses/:id` - Update expense (Admin, Treasurer)
- `PUT /api/v1/expenses/:id/approve` - Approve/reject expense (Admin only)
- `DELETE /api/v1/expenses/:id` - Delete expense (Admin only)

### Pockets

- `GET /api/v1/pockets` - List all pockets
- `GET /api/v1/pockets/:id` - Get pocket details
- `GET /api/v1/pockets/:id/summary` - Get pocket summary (totals, balance)
- `GET /api/v1/pockets/:pocketId/donations` - List donations for pocket
- `GET /api/v1/pockets/:pocketId/expenses` - List expenses for pocket

### Categories

- `GET /api/v1/categories/donations` - List donation categories
- `GET /api/v1/categories/expenses` - List expense categories

## User Roles

- **Admin**: Full access to all operations
- **Treasurer**: Can create/update donations and expenses
- **Viewer**: Read-only access

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration (env, supabase)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── validators/      # Zod validation schemas
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── migrations/          # Database migrations
├── seeds/               # Seed data
├── dist/                # Compiled JavaScript
├── .env                 # Environment variables
├── .env.example         # Environment template
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies
```

## Environment Variables

```env
# Server Configuration
NODE_ENV=development        # development, production, or test
PORT=3000                   # Server port
API_VERSION=v1              # API version

# Supabase Configuration
SUPABASE_URL=               # Your Supabase project URL
SUPABASE_ANON_KEY=          # Supabase anon (public) key
SUPABASE_SERVICE_ROLE_KEY=  # Supabase service role key (secret!)

# CORS Configuration
CORS_ORIGIN=http://localhost:5173  # Allowed origin for CORS

# Security
RATE_LIMIT_WINDOW=15        # Rate limit window in minutes
RATE_LIMIT_MAX_REQUESTS=100 # Max requests per window
```

## Security Features

1. **Row Level Security (RLS)**: Database-level access control
2. **JWT Authentication**: Supabase JWT token validation
3. **Role-Based Access**: Admin, Treasurer, and Viewer roles
4. **Input Validation**: Zod schemas for request validation
5. **Rate Limiting**: Prevents API abuse
6. **Helmet**: Security headers
7. **CORS**: Cross-origin request control

## Testing

To test the API manually:

1. Start the server: `npm run dev`
2. Check health: `curl http://localhost:3000/api/health`
3. Use a tool like Postman or Insomnia to test authenticated endpoints

## Troubleshooting

### Server won't start

- Check that all environment variables are set correctly
- Verify Supabase credentials are valid
- Ensure port 3000 is not in use (or change PORT in .env)

### Database connection fails

- Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Check that database tables have been created via migrations
- Ensure your Supabase project is active

### TypeScript errors

- Run `npm run type-check` to see all type errors
- Ensure all dependencies are installed
- Check that generated database types exist

## Production Deployment

1. Build the project:
```bash
npm run build
```

2. Set NODE_ENV to production:
```env
NODE_ENV=production
```

3. Start the server:
```bash
npm start
```

## Contributing

1. Follow TypeScript strict mode guidelines
2. Use Zod for all input validation
3. Add proper error handling
4. Document new endpoints
5. Run type-check before committing

## License

ISC
