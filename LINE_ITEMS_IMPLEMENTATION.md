# Line Items Architecture - Implementation Status

## Overview

The donation and expense system has been redesigned to support **line items architecture**, allowing a single transaction to be split across multiple categories.

### Example Use Case
Before:
- Donation of 1,000,000 → Must create 2 separate donations (700,000 Infaq + 300,000 Zakat)

After:
- Donation of 1,000,000 → 1 donation with 2 items:
  - Item 1: 700,000 Infaq Umum
  - Item 2: 300,000 Zakat

## Current Implementation Status

### ✅ Completed

#### 1. Design & Specification
- [x] `openspec/changes/init-api-database-config/design.md` - Complete architecture documentation
- [x] `openspec/changes/init-api-database-config/proposal.md` - Updated scope
- [x] `openspec/changes/init-api-database-config/specs/database-schema/spec.md` - Updated requirements

#### 2. Database Migrations
- [x] `server/migrations/005_add_line_items.sql` - Creates items tables and migrates data
- [x] `server/migrations/006_line_items_rls.sql` - RLS policies for items
- [x] `server/migrations/007_line_items_triggers.sql` - Triggers for items
- [x] `server/migrations/MIGRATION_NOTES.md` - Migration documentation

#### 3. TypeScript Types
- [x] `server/src/types/donation.types.ts` - Updated with DonationItem interfaces
- [x] `server/src/types/expense.types.ts` - Updated with ExpenseItem interfaces

#### 4. Validation Schemas
- [x] `server/src/validators/donation.schema.ts` - Updated with items array validation
- [x] `server/src/validators/expense.schema.ts` - Updated with items array validation

### ⏳ Pending (Not Yet Implemented)

#### 1. Service Layer
- [ ] `server/src/services/donationService.ts` - Needs update to handle line items
- [ ] `server/src/services/expenseService.ts` - Needs update to handle line items

#### 2. Testing & Documentation
- [ ] Update API documentation with line items examples
- [ ] Test endpoints with new structure
- [ ] Update Swagger schemas
- [ ] Update seed data format

## Database Schema

### New Tables

#### donation_items
```sql
CREATE TABLE donation_items (
  id UUID PRIMARY KEY,
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES donation_categories(id),
  amount NUMERIC(15,2) CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### expense_items
```sql
CREATE TABLE expense_items (
  id UUID PRIMARY KEY,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id),
  amount NUMERIC(15,2) CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Modified Tables

#### donations (columns removed)
- ❌ `category_id` - Moved to donation_items
- ❌ `amount` - Moved to donation_items

#### expenses (columns removed)
- ❌ `category_id` - Moved to expense_items
- ❌ `amount` - Moved to expense_items

## API Changes

### Before (Old Structure)
```json
POST /api/v1/donations
{
  "pocket_id": "uuid",
  "category_id": "uuid",
  "amount": 1000000,
  "donor_name": "Ahmad",
  "donation_date": "2026-01-18"
}
```

### After (New Structure with Line Items)
```json
POST /api/v1/donations
{
  "pocket_id": "uuid",
  "donor_name": "Ahmad",
  "donation_date": "2026-01-18",
  "items": [
    {
      "category_id": "uuid-infaq",
      "amount": 700000,
      "description": "Infaq Umum"
    },
    {
      "category_id": "uuid-zakat",
      "amount": 300000,
      "description": "Zakat Mal"
    }
  ]
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "pocket_id": "uuid",
    "pocket_name": "Kas Umum",
    "donor_name": "Ahmad",
    "donation_date": "2026-01-18",
    "total_amount": 1000000,
    "items": [
      {
        "id": "item-uuid-1",
        "category_id": "uuid-infaq",
        "category_name": "Infaq Umum",
        "amount": 700000,
        "description": "Infaq Umum"
      },
      {
        "id": "item-uuid-2",
        "category_id": "uuid-zakat",
        "category_name": "Zakat",
        "amount": 300000,
        "description": "Zakat Mal"
      }
    ],
    "created_at": "2026-01-18T10:00:00Z"
  }
}
```

## How to Apply Migrations

### Option 1: Supabase Dashboard
1. Open Supabase Dashboard → SQL Editor
2. Run migrations in order:
   - Copy/paste `005_add_line_items.sql` → Run
   - Copy/paste `006_line_items_rls.sql` → Run
   - Copy/paste `007_line_items_triggers.sql` → Run

### Option 2: Supabase CLI
```bash
supabase db push --file server/migrations/005_add_line_items.sql
supabase db push --file server/migrations/006_line_items_rls.sql
supabase db push --file server/migrations/007_line_items_triggers.sql
```

### Option 3: psql
```bash
cd server/migrations
psql -h <host> -U <user> -d <database> -f 005_add_line_items.sql
psql -h <host> -U <user> -d <database> -f 006_line_items_rls.sql
psql -h <host> -U <user> -d <database> -f 007_line_items_triggers.sql
```

## Next Steps for Complete Implementation

1. **Run Database Migrations**
   ```bash
   # Apply migrations 005, 006, 007 to your Supabase database
   ```

2. **Regenerate TypeScript Types from Database**
   ```bash
   cd server
   supabase gen types typescript --project-id <your-project-id> > src/types/database.types.ts
   ```

3. **Update Services** (Currently NOT implemented)
   - Update `donationService.ts` to:
     - Create donation + items in transaction
     - Fetch donation with joined items
     - Calculate total_amount from items
     - Handle update by replacing items
   - Update `expenseService.ts` similarly

4. **Test the API**
   - Test create donation with multiple items
   - Test create expense with multiple items
   - Test list donations includes items and total_amount
   - Test delete donation cascades to items

5. **Update Documentation**
   - Update Swagger schemas
   - Update API examples
   - Update postman/curl examples

## Validation

### Validation Rules (Already Implemented in Schemas)
- ✅ At least 1 item required per transaction
- ✅ Each item amount must be > 0
- ✅ Each item must have valid category_id (UUID)
- ✅ Item description is optional (max 500 chars)

### Database Constraints (Already in Migration)
- ✅ Foreign key CASCADE on parent delete
- ✅ CHECK amount > 0
- ✅ Indexes on donation_id, expense_id, category_id
- ✅ Composite indexes for (parent_id, category_id)

## Breaking Changes

⚠️ **This is a breaking change!**

- Old API requests with `category_id` and `amount` will fail validation
- Must use new `items` array format
- Existing data is migrated automatically by migration script
- Total amounts are now calculated (not stored) from sum of items

## Rollback

See `server/migrations/MIGRATION_NOTES.md` for rollback procedure.

⚠️ **Warning**: Rollback loses multi-category data! Only first item is preserved per transaction.

## Benefits

1. ✅ **Flexibility**: Split one transaction across multiple categories
2. ✅ **Accuracy**: Reflects real-world accounting (one receipt, multiple allocations)
3. ✅ **Reporting**: Easy category-wise reports (query items directly)
4. ✅ **Audit**: Each line item has its own description
5. ✅ **Integrity**: Total always equals sum of items

## References

- Design Document: `openspec/changes/init-api-database-config/design.md`
- Migration Notes: `server/migrations/MIGRATION_NOTES.md`
- OpenSpec Validation: `openspec validate init-api-database-config --strict` ✅
