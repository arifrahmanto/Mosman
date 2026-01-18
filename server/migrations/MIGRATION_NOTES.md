# Database Migration Notes - Line Items Architecture

## Overview

Migrations 005-007 implement the line items architecture for donations and expenses. This is a **breaking change** that restructures how financial transactions are stored.

## What Changed

### Before (Single Category per Transaction)
```
donations table:
- id, pocket_id, category_id, amount, donor_name, ...

expenses table:
- id, pocket_id, category_id, amount, description, ...
```

### After (Multiple Line Items per Transaction)
```
donations table:
- id, pocket_id, donor_name, ... (NO category_id, NO amount)

donation_items table:
- id, donation_id, category_id, amount, description, ...

expenses table:
- id, pocket_id, description, ... (NO category_id, NO amount)

expense_items table:
- id, expense_id, category_id, amount, description, ...
```

## Benefits

1. **Flexibility**: One donation/expense can be split across multiple categories
   - Example: 1,000,000 donation → 700,000 Infaq + 300,000 Zakat
2. **Accuracy**: Better reflects real-world accounting practices
3. **Reporting**: Easier category-wise reporting
4. **Audit Trail**: Each line item has its own description

## Migration Steps

### Migration 005: `005_add_line_items.sql`
1. Creates `donation_items` table
2. Creates `expense_items` table
3. Migrates existing donation data to `donation_items`
4. Migrates existing expense data to `expense_items`
5. Drops `category_id` and `amount` columns from `donations`
6. Drops `category_id` and `amount` columns from `expenses`
7. Creates indexes for performance

### Migration 006: `006_line_items_rls.sql`
1. Enables RLS on `donation_items`
2. Enables RLS on `expense_items`
3. Creates SELECT policies (all authenticated users)
4. Creates INSERT/UPDATE policies (admin + treasurer)
5. Creates DELETE policies (admin for expenses, admin+treasurer for donations)

### Migration 007: `007_line_items_triggers.sql`
1. Adds `updated_at` trigger for `donation_items`
2. Adds `updated_at` trigger for `expense_items`

## Data Migration Safety

- Existing donation records are preserved
- Existing expense records are preserved
- Each existing transaction gets one corresponding item
- Data is copied before columns are dropped
- Foreign key CASCADE ensures items are deleted when parent is deleted

## How to Run

### Option 1: Individual Migrations
```bash
# Run each migration in order
psql -h <host> -U <user> -d <database> -f migrations/005_add_line_items.sql
psql -h <host> -U <user> -d <database> -f migrations/006_line_items_rls.sql
psql -h <host> -U <user> -d <database> -f migrations/007_line_items_triggers.sql
```

### Option 2: Via Supabase Dashboard
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of each migration file
3. Run in order: 005 → 006 → 007

### Option 3: All at Once (update 000_run_all_migrations.sql)
Update the master migration file to include new migrations.

## Rollback Plan

⚠️ **Warning**: Rollback requires backup because we drop columns.

If you need to rollback:
1. Restore from backup taken before migration
2. OR manually recreate old structure and aggregate items back

Rollback script (if no backup):
```sql
-- Add columns back
ALTER TABLE donations ADD COLUMN category_id UUID;
ALTER TABLE donations ADD COLUMN amount NUMERIC(15,2);
ALTER TABLE expenses ADD COLUMN category_id UUID;
ALTER TABLE expenses ADD COLUMN amount NUMERIC(15,2);

-- Aggregate first item back (LOSES multi-category data!)
UPDATE donations d
SET category_id = di.category_id,
    amount = di.amount
FROM donation_items di
WHERE d.id = di.donation_id
AND di.id = (
  SELECT id FROM donation_items
  WHERE donation_id = d.id
  ORDER BY created_at LIMIT 1
);

-- Similar for expenses...

-- Drop items tables
DROP TABLE donation_items CASCADE;
DROP TABLE expense_items CASCADE;
```

## Testing Checklist

After running migrations:

- [ ] Verify `donation_items` table exists
- [ ] Verify `expense_items` table exists
- [ ] Verify `category_id` and `amount` removed from `donations`
- [ ] Verify `category_id` and `amount` removed from `expenses`
- [ ] Verify existing data migrated to items tables
- [ ] Verify RLS policies working (SELECT as viewer, INSERT as treasurer)
- [ ] Verify CASCADE delete (delete donation → items deleted)
- [ ] Verify indexes created
- [ ] Verify triggers working (updated_at auto-updates)

## API Changes Required

After running these migrations, the API must be updated to:

1. **Create Donation**: Accept `items` array instead of `category_id` and `amount`
2. **Create Expense**: Accept `items` array instead of `category_id` and `amount`
3. **List Donations**: Include joined `items` data with calculated `total_amount`
4. **List Expenses**: Include joined `items` data with calculated `total_amount`
5. **Update**: Handle updating items (delete old + insert new)

See `server/src/types/donation.types.ts` and `server/src/types/expense.types.ts` for the new interfaces.

## Current Status

✅ Database migrations created (005, 006, 007)
✅ TypeScript types updated
✅ Validation schemas updated
⏳ Services need to be updated for line items handling
⏳ Controllers compatible but need testing
⏳ Documentation needs update

## Next Steps

1. Run migrations on development database
2. Update donationService.ts to handle items
3. Update expenseService.ts to handle items
4. Test API endpoints with new structure
5. Update Swagger documentation
6. Update seed data to use items format
