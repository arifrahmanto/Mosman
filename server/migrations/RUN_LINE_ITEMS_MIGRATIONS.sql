-- =====================================================
-- RUN LINE ITEMS MIGRATIONS
-- Description: Apply migrations 005, 006, 007 for line items architecture
-- Date: 2026-01-18
-- =====================================================

-- ⚠️ WARNING: This is a BREAKING CHANGE!
-- This migration will:
-- 1. Create donation_items and expense_items tables
-- 2. Migrate existing data to items tables
-- 3. DROP category_id and amount columns from donations and expenses
--
-- Make sure you understand the changes before running!
-- See MIGRATION_NOTES.md for details

BEGIN;

-- =====================================================
-- MIGRATION 005: Add Line Items Tables
-- =====================================================

-- Table: donation_items
CREATE TABLE IF NOT EXISTS donation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES donation_categories(id) ON DELETE RESTRICT,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE donation_items IS 'Line items for donations - allows splitting donations across multiple categories';

-- Table: expense_items
CREATE TABLE IF NOT EXISTS expense_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE expense_items IS 'Line items for expenses - allows splitting expenses across multiple categories';

-- Data Migration: Move existing donation data to items
INSERT INTO donation_items (donation_id, category_id, amount, description, created_at, updated_at)
SELECT
  id as donation_id,
  category_id,
  amount,
  NULL as description,
  created_at,
  updated_at
FROM donations
WHERE category_id IS NOT NULL AND amount IS NOT NULL;

-- Data Migration: Move existing expense data to items
INSERT INTO expense_items (expense_id, category_id, amount, description, created_at, updated_at)
SELECT
  id as expense_id,
  category_id,
  amount,
  description as description,
  created_at,
  updated_at
FROM expenses
WHERE category_id IS NOT NULL AND amount IS NOT NULL;

-- Schema Update: Remove old columns from donations
ALTER TABLE donations DROP COLUMN IF EXISTS category_id;
ALTER TABLE donations DROP COLUMN IF EXISTS amount;

-- Schema Update: Remove old columns from expenses
ALTER TABLE expenses DROP COLUMN IF EXISTS category_id;
ALTER TABLE expenses DROP COLUMN IF EXISTS amount;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_donation_items_donation_id ON donation_items(donation_id);
CREATE INDEX IF NOT EXISTS idx_donation_items_category_id ON donation_items(category_id);
CREATE INDEX IF NOT EXISTS idx_expense_items_expense_id ON expense_items(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_items_category_id ON expense_items(category_id);
CREATE INDEX IF NOT EXISTS idx_donation_items_donation_category ON donation_items(donation_id, category_id);
CREATE INDEX IF NOT EXISTS idx_expense_items_expense_category ON expense_items(expense_id, category_id);

-- =====================================================
-- MIGRATION 006: Line Items RLS Policies
-- =====================================================

-- Enable RLS
ALTER TABLE donation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;

-- Donation items policies
CREATE POLICY "Authenticated users can read donation items"
  ON donation_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and treasurer can insert donation items"
  ON donation_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'treasurer') AND is_active = true
    )
  );

CREATE POLICY "Admin and treasurer can update donation items"
  ON donation_items FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'treasurer') AND is_active = true
    )
  );

CREATE POLICY "Admin and treasurer can delete donation items"
  ON donation_items FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'treasurer') AND is_active = true
    )
  );

-- Expense items policies
CREATE POLICY "Authenticated users can read expense items"
  ON expense_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and treasurer can insert expense items"
  ON expense_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'treasurer') AND is_active = true
    )
  );

CREATE POLICY "Admin and treasurer can update expense items"
  ON expense_items FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'treasurer') AND is_active = true
    )
  );

CREATE POLICY "Admin can delete expense items"
  ON expense_items FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- =====================================================
-- MIGRATION 007: Line Items Triggers
-- =====================================================

-- Triggers for updated_at
CREATE TRIGGER update_donation_items_updated_at
  BEFORE UPDATE ON donation_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_items_updated_at
  BEFORE UPDATE ON expense_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- =====================================================
-- DONE! Line Items Migration Complete
-- =====================================================
-- Next steps:
-- 1. Regenerate TypeScript types: supabase gen types typescript
-- 2. Update services to handle line items
-- 3. Test the API with new structure
