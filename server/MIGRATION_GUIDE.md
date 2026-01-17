# Database Migration Guide

This guide walks you through setting up the Supabase database for the Mosman API.

## Prerequisites

- Supabase account created
- Supabase project created
- SUPABASE_URL and keys copied to `.env`

## Step-by-Step Migration Process

### Step 1: Open Supabase SQL Editor

1. Go to https://app.supabase.com/
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "+ New query"

### Step 2: Run Migration 001 - Initial Schema

Copy and paste the entire contents of `migrations/001_initial_schema.sql` into the SQL editor and click "Run".

This creates:
- `pockets` table
- `donation_categories` table
- `expense_categories` table
- `user_profiles` table
- `donations` table
- `expenses` table

**Expected output**: "Success. No rows returned"

### Step 3: Run Migration 002 - Indexes

Copy and paste the entire contents of `migrations/002_indexes.sql` into the SQL editor and click "Run".

This creates indexes for:
- Donations (pocket_id, category_id, date, recorded_by)
- Expenses (pocket_id, category_id, date, status, recorded_by, approved_by)
- User profiles (role, is_active)
- Pockets and categories (is_active)

**Expected output**: "Success. No rows returned"

### Step 3: Run Migration 003 - RLS Policies

Copy and paste the entire contents of `migrations/003_rls_policies.sql` into the SQL editor and click "Run".

This:
- Enables Row Level Security on all tables
- Creates RLS policies for each table based on user roles
- Creates a helper function `get_user_role()`

**Expected output**: "Success. No rows returned"

### Step 4: Run Migration 004 - Triggers

Copy and paste the entire contents of `migrations/004_triggers.sql` into the SQL editor and click "Run".

This creates:
- `update_updated_at_column()` function
- Triggers to auto-update `updated_at` timestamps
- `handle_new_user()` function
- Trigger to auto-create user profiles when users sign up

**Expected output**: "Success. No rows returned"

### Step 5: Run Seed Data

Copy and paste the entire contents of `seeds/001_seed_pockets_and_categories.sql` into the SQL editor and click "Run".

This seeds:
- 4 pockets (Kas Umum, Kas Pembangunan, Kas Sawah, Kas Anggota)
- 4 donation categories (Infaq Umum, Zakat, Sedekah, Wakaf)
- 5 expense categories (Operasional, Pemeliharaan Gedung, Gaji Pegawai, Kegiatan Keagamaan, Utilitas)

**Expected output**: "Success. No rows returned" (or confirmation of inserts)

### Step 6: Verify Tables Were Created

Run this query to verify all tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected output**: You should see these tables:
- `donation_categories`
- `donations`
- `expense_categories`
- `expenses`
- `pockets`
- `user_profiles`

### Step 7: Verify Seed Data

Run these queries to verify seed data was inserted:

```sql
-- Check pockets
SELECT id, name, description FROM pockets ORDER BY name;

-- Check donation categories
SELECT id, name, description FROM donation_categories ORDER BY name;

-- Check expense categories
SELECT id, name, description FROM expense_categories ORDER BY name;
```

**Expected output**: You should see 4 pockets, 4 donation categories, and 5 expense categories.

### Step 8: Generate TypeScript Types

After all migrations are complete, generate TypeScript types for your database schema:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (replace with your project ref)
supabase link --project-ref your-project-ref

# Generate types
supabase gen types typescript --linked > src/types/database.types.ts
```

Find your project ref in Supabase Dashboard → Settings → General → Reference ID

### Step 9: Test the Database Connection

Start your server:

```bash
npm run dev
```

Check the health endpoint:

```bash
curl http://localhost:3000/api/health
```

**Expected response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-17T...",
    "version": "v1",
    "environment": "development",
    "database": {
      "connected": true,
      "message": "Connected successfully"
    }
  }
}
```

## Troubleshooting

### Error: "permission denied for schema public"

**Solution**: Make sure you're running the migrations in the SQL Editor as the database owner (your Supabase project user).

### Error: "relation already exists"

**Solution**: The migration has already been run. You can skip it or drop the table first (⚠️ this will delete data!).

### Error: "function get_user_role does not exist"

**Solution**: Make sure migration 003 (RLS policies) ran successfully. The function should be created in that migration.

### Trigger not working for new users

**Solution**:
1. Verify migration 004 ran successfully
2. Check that the trigger exists:
```sql
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'users';
```

### Seed data not inserted

**Solution**: Check for conflicts on the `id` or `name` columns. The seed script uses `ON CONFLICT DO NOTHING`, so if data already exists, it won't be inserted again.

## Rolling Back (⚠️ Destructive)

If you need to start over, you can drop all tables:

```sql
-- WARNING: This will delete ALL data!
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS donation_categories CASCADE;
DROP TABLE IF EXISTS expense_categories CASCADE;
DROP TABLE IF EXISTS pockets CASCADE;
DROP FUNCTION IF EXISTS get_user_role(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS handle_new_user();
```

Then re-run all migrations from Step 2.

## Next Steps

After successful migration:

1. ✅ Create a test user in Supabase Auth
2. ✅ Manually add them to `user_profiles` table with 'admin' role
3. ✅ Test authentication with the API
4. ✅ Start using the API endpoints

## Creating Your First Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password
4. Copy the user's UUID
5. In SQL Editor, run:

```sql
INSERT INTO user_profiles (id, full_name, role, is_active)
VALUES (
  'paste-user-uuid-here',
  'Admin Name',
  'admin',
  true
);
```

Now this user can authenticate and has admin access!

## Maintenance

### Checking RLS Policies

View all policies:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Checking Triggers

View all triggers:
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### Viewing Indexes

View all indexes:
```sql
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## Support

If you encounter issues not covered here, please check:
1. Supabase project logs (Dashboard → Logs)
2. Server logs (`npm run dev` output)
3. Browser console (if using frontend)
