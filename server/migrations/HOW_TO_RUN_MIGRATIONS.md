# How to Run Line Items Migrations

## ⚠️ Important Warning

This migration is a **BREAKING CHANGE** that will:
- Create new `donation_items` and `expense_items` tables
- Migrate existing data to the new tables
- **DROP** `category_id` and `amount` columns from `donations` and `expenses` tables

**Make sure you understand the changes before running!**

## Option 1: Via Supabase Dashboard (Recommended)

This is the easiest and most reliable method.

### Steps:

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/qwubypmzeafooowuxgnu/sql
   - Or: Dashboard → Your Project → SQL Editor

2. **Open the Migration File**
   - Open `server/migrations/RUN_LINE_ITEMS_MIGRATIONS.sql` in your code editor
   - Copy the entire contents (Ctrl/Cmd + A, then Ctrl/Cmd + C)

3. **Paste and Run**
   - Paste into the SQL Editor in Supabase Dashboard
   - Click "Run" or press Ctrl/Cmd + Enter
   - Wait for execution to complete

4. **Verify Success**
   - Check for "Success" message
   - Should see confirmation that tables were created
   - No error messages should appear

### Expected Output:
```
Success. No rows returned

# or

Success. Migration completed
```

## Option 2: Via psql (Advanced)

If you have database credentials:

```bash
# Get connection string from Supabase Dashboard → Settings → Database
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

psql "your-connection-string" -f server/migrations/RUN_LINE_ITEMS_MIGRATIONS.sql
```

## Option 3: Run Individual Migrations

If you prefer to run migrations one by one:

```bash
# Via Supabase Dashboard, run these in order:
1. 005_add_line_items.sql
2. 006_line_items_rls.sql
3. 007_line_items_triggers.sql
```

## After Running Migrations

### 1. Verify Tables Created

Run this in SQL Editor:
```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('donation_items', 'expense_items');

-- Should return 2 rows
```

### 2. Verify Data Migrated

```sql
-- Check donation items
SELECT COUNT(*) FROM donation_items;

-- Check expense items
SELECT COUNT(*) FROM expense_items;

-- Should match count of donations and expenses
```

### 3. Verify Columns Removed

```sql
-- Check donations table structure
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'donations';

-- Should NOT see 'category_id' or 'amount'
```

### 4. Regenerate TypeScript Types

```bash
cd server
npx supabase gen types typescript --project-id qwubypmzeafooowuxgnu > src/types/database.types.ts
```

Or use the full command:
```bash
cd server
supabase gen types typescript --project-id qwubypmzeafooowuxgnu --schema public > src/types/database.types.ts
```

## Troubleshooting

### Error: "column does not exist"
- Make sure migrations 001-004 were run first
- Check that base tables (donations, expenses) exist

### Error: "table already exists"
- Safe to ignore if using CREATE TABLE IF NOT EXISTS
- Or: migrations were already run

### Error: "relation does not exist"
- Missing base tables
- Run 000_run_all_migrations.sql first

### Data Loss
- The migration preserves all existing data
- Each donation/expense gets one corresponding item
- If you have concerns, backup your database first via Supabase Dashboard

## Rollback

⚠️ **Warning**: Rollback loses multi-category data!

If you need to rollback:
1. Restore from backup (recommended)
2. Or run rollback script (see MIGRATION_NOTES.md)

## Next Steps

After successful migration:
1. ✅ Verify tables and data
2. ✅ Regenerate TypeScript types
3. ⏳ Update services (donationService.ts, expenseService.ts)
4. ⏳ Test API endpoints
5. ⏳ Update documentation

See `LINE_ITEMS_IMPLEMENTATION.md` for full implementation guide.
