# Line Items Implementation - Summary

## Overview

This document summarizes the implementation of the line items architecture for donations and expenses. This breaking change allows a single transaction to be split across multiple categories.

**Date**: 2026-01-18
**Status**: ✅ Code Complete - Ready for Migration

---

## What Changed

### Database Schema

**Before:**
```sql
-- Donations had category and amount directly
CREATE TABLE donations (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES donation_categories(id),
  amount NUMERIC(15,2),
  -- other fields
);

-- Expenses had category and amount directly
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES expense_categories(id),
  amount NUMERIC(15,2),
  -- other fields
);
```

**After:**
```sql
-- Donations no longer have category_id and amount
CREATE TABLE donations (
  id UUID PRIMARY KEY,
  -- category_id removed
  -- amount removed
  -- other fields
);

-- New donation_items table
CREATE TABLE donation_items (
  id UUID PRIMARY KEY,
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES donation_categories(id),
  amount NUMERIC(15,2),
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Expenses no longer have category_id and amount
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  -- category_id removed
  -- amount removed
  -- other fields
);

-- New expense_items table
CREATE TABLE expense_items (
  id UUID PRIMARY KEY,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id),
  amount NUMERIC(15,2),
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### TypeScript Types

**Donation Types (`src/types/donation.types.ts`):**
- Added `DonationItem` interface
- Added `DonationItemResponse` interface
- Updated `CreateDonationRequest` to include `items: DonationItem[]`
- Updated `UpdateDonationRequest` to include `items?: DonationItem[]`
- Updated `DonationResponse` to include `items: DonationItemResponse[]` and `total_amount`
- Removed `category_id` and `amount` from main interfaces

**Expense Types (`src/types/expense.types.ts`):**
- Added `ExpenseItem` interface
- Added `ExpenseItemResponse` interface
- Updated `CreateExpenseRequest` to include `items: ExpenseItem[]`
- Updated `UpdateExpenseRequest` to include `items?: ExpenseItem[]`
- Updated `ExpenseResponse` to include `items: ExpenseItemResponse[]` and `total_amount`
- Removed `category_id` and `amount` from main interfaces

### Validation Schemas

**Donation Schema (`src/validators/donation.schema.ts`):**
```typescript
export const donationItemSchema = z.object({
  category_id: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().max(500).optional(),
});

export const createDonationSchema = z.object({
  // ... other fields
  items: z.array(donationItemSchema).min(1, 'At least one item is required'),
});
```

**Expense Schema (`src/validators/expense.schema.ts`):**
```typescript
export const expenseItemSchema = z.object({
  category_id: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().max(500).optional(),
});

export const createExpenseSchema = z.object({
  // ... other fields
  items: z.array(expenseItemSchema).min(1, 'At least one item is required'),
});
```

### Service Layer

Both `donationService.ts` and `expenseService.ts` were completely rewritten to:

1. **Fetch Operations**: Get parent record and items separately, then combine
2. **Create Operations**: Create parent record first, then create all items (with rollback on failure)
3. **Update Operations**: Replace all items if items array is provided
4. **Calculate Total**: Sum all item amounts to get `total_amount`

**Key Pattern:**
```typescript
// Create parent
const { data: donation } = await supabase
  .from('donations')
  .insert({ /* no category_id, no amount */ });

// Create items
const itemsToInsert = donationData.items.map(item => ({
  donation_id: donation.id,
  category_id: item.category_id,
  amount: item.amount,
  description: item.description,
}));

const { data: createdItems, error: itemsError } = await supabase
  .from('donation_items')
  .insert(itemsToInsert);

// Rollback on failure
if (itemsError) {
  await supabase.from('donations').delete().eq('id', donation.id);
  throw new DatabaseError('Failed to create donation items');
}
```

### Controller Layer

**Fixed `expenseController.ts`:**
- Corrected parameter order in `approveExpense()` call
- Added type casting: `status as ExpenseStatus`

---

## API Changes

### Before (Single Category)

**Create Donation Request:**
```json
{
  "pocket_id": "uuid",
  "donor_name": "John Doe",
  "category_id": "uuid",
  "amount": 100000,
  "donation_date": "2026-01-18"
}
```

**Response:**
```json
{
  "id": "uuid",
  "category_id": "uuid",
  "category_name": "Zakat",
  "amount": 100000,
  "total_amount": 100000
}
```

### After (Multiple Line Items)

**Create Donation Request:**
```json
{
  "pocket_id": "uuid",
  "donor_name": "John Doe",
  "donation_date": "2026-01-18",
  "items": [
    {
      "category_id": "zakat-uuid",
      "amount": 60000,
      "description": "Zakat Fitrah"
    },
    {
      "category_id": "infaq-uuid",
      "amount": 40000,
      "description": "Infaq Pembangunan Masjid"
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "total_amount": 100000,
  "items": [
    {
      "id": "item-uuid-1",
      "category_id": "zakat-uuid",
      "category_name": "Zakat",
      "amount": 60000,
      "description": "Zakat Fitrah"
    },
    {
      "id": "item-uuid-2",
      "category_id": "infaq-uuid",
      "category_name": "Infaq",
      "amount": 40000,
      "description": "Infaq Pembangunan Masjid"
    }
  ]
}
```

---

## Migration Files

All migration files are in `server/migrations/`:

1. **`005_add_line_items.sql`**
   - Creates `donation_items` and `expense_items` tables
   - Migrates existing data to new tables
   - Drops old `category_id` and `amount` columns
   - Creates indexes for performance

2. **`006_line_items_rls.sql`**
   - Enables Row Level Security on new tables
   - Creates policies for authenticated users

3. **`007_line_items_triggers.sql`**
   - Adds `updated_at` triggers

4. **`RUN_LINE_ITEMS_MIGRATIONS.sql`**
   - Combined migration file with all three in a transaction
   - Ready to run via Supabase Dashboard

5. **Documentation:**
   - `HOW_TO_RUN_MIGRATIONS.md` - Step-by-step instructions
   - `MIGRATION_NOTES.md` - Technical details and rationale

---

## Files Modified

### Type Definitions
- ✅ `src/types/donation.types.ts` - Complete rewrite
- ✅ `src/types/expense.types.ts` - Complete rewrite

### Validation Schemas
- ✅ `src/validators/donation.schema.ts` - Added item schema, updated create/update
- ✅ `src/validators/expense.schema.ts` - Added item schema, updated create/update

### Service Layer
- ✅ `src/services/donationService.ts` - Complete rewrite (462 lines)
- ✅ `src/services/expenseService.ts` - Complete rewrite (499 lines)

### Controller Layer
- ✅ `src/controllers/expenseController.ts` - Fixed parameter order and type casting

### Database Migrations
- ✅ `migrations/005_add_line_items.sql` - New
- ✅ `migrations/006_line_items_rls.sql` - New
- ✅ `migrations/007_line_items_triggers.sql` - New
- ✅ `migrations/RUN_LINE_ITEMS_MIGRATIONS.sql` - New
- ✅ `migrations/HOW_TO_RUN_MIGRATIONS.md` - New
- ✅ `migrations/MIGRATION_NOTES.md` - New

### Design Documentation
- ✅ `openspec/changes/init-api-database-config/design.md` - Updated schema
- ✅ `openspec/changes/init-api-database-config/proposal.md` - Updated scope
- ✅ `openspec/changes/init-api-database-config/specs/database-schema/spec.md` - Updated requirements

---

## Next Steps

### 1. Run Database Migrations ⏳

**Via Supabase Dashboard (Recommended):**
```bash
# 1. Go to: https://supabase.com/dashboard/project/qwubypmzeafooowuxgnu/sql
# 2. Copy contents of: server/migrations/RUN_LINE_ITEMS_MIGRATIONS.sql
# 3. Paste and run in SQL Editor
```

**Via psql:**
```bash
psql "your-connection-string" -f server/migrations/RUN_LINE_ITEMS_MIGRATIONS.sql
```

See `migrations/HOW_TO_RUN_MIGRATIONS.md` for detailed instructions.

### 2. Regenerate TypeScript Types ⏳

After migrations run successfully:
```bash
cd server
npx supabase gen types typescript --project-id qwubypmzeafooowuxgnu > src/types/database.types.ts
```

### 3. Test the API ⏳

Test endpoints with new request format:

**Create Donation with Multiple Items:**
```bash
curl -X POST http://localhost:3000/api/v1/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "pocket_id": "uuid",
    "donor_name": "Test Donor",
    "is_anonymous": false,
    "payment_method": "cash",
    "donation_date": "2026-01-18",
    "items": [
      {"category_id": "zakat-uuid", "amount": 50000},
      {"category_id": "infaq-uuid", "amount": 25000}
    ]
  }'
```

**Create Expense with Multiple Items:**
```bash
curl -X POST http://localhost:3000/api/v1/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "pocket_id": "uuid",
    "description": "Mixed operational costs",
    "expense_date": "2026-01-18",
    "items": [
      {"category_id": "utilities-uuid", "amount": 30000, "description": "Electricity"},
      {"category_id": "supplies-uuid", "amount": 20000, "description": "Office supplies"}
    ]
  }'
```

### 4. Update Swagger Documentation ⏳

Update API documentation in `src/config/swagger.ts` to reflect:
- New request schema with `items` array
- New response schema with `items` and `total_amount`
- Removal of `category_id` and `amount` from parent objects

### 5. Update Client Applications ⏳

Any frontend or client applications need to:
- Send `items` array instead of `category_id` and `amount`
- Handle `items` array in responses
- Update UI to support multiple line items per transaction

---

## Benefits

✅ **Multi-Category Support**: A single donation/expense can span multiple categories
✅ **Better Granularity**: Track individual line items with descriptions
✅ **Accurate Reporting**: Category-based reports are more accurate
✅ **Data Integrity**: CASCADE delete ensures no orphaned items
✅ **Type Safety**: Full TypeScript coverage with runtime validation

---

## Rollback Plan

⚠️ **Warning**: Rollback loses multi-category data!

If you need to rollback:
1. **Restore from backup** (recommended)
2. Run rollback script (see `MIGRATION_NOTES.md`)

Before running migration, consider creating a database backup via Supabase Dashboard.

---

## Validation

All changes validated with OpenSpec:
```bash
openspec validate --strict
```
✅ All specs passed validation

TypeScript compilation:
```bash
npm run build
```
✅ Build successful with no errors

---

## Support

For issues or questions:
- See `migrations/HOW_TO_RUN_MIGRATIONS.md` for migration troubleshooting
- See `migrations/MIGRATION_NOTES.md` for technical details
- Review `openspec/changes/init-api-database-config/design.md` for architecture decisions

---

**Status**: ✅ Ready for Migration
**Next Action**: Run database migrations via Supabase Dashboard
