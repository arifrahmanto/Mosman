-- =====================================================
-- Migration: 005_add_line_items.sql
-- Description: Add line items tables for donations and expenses
-- Author: System
-- Date: 2026-01-18
-- =====================================================

-- This migration implements the line items architecture where:
-- - Donations can have multiple line items with different categories
-- - Expenses can have multiple line items with different categories
-- - Total amounts are calculated from the sum of all items

-- =====================================================
-- Table: donation_items
-- Description: Line items for donations with categories and amounts
-- =====================================================
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
COMMENT ON COLUMN donation_items.donation_id IS 'Reference to parent donation (CASCADE delete)';
COMMENT ON COLUMN donation_items.category_id IS 'Category for this line item';
COMMENT ON COLUMN donation_items.amount IS 'Amount for this line item';
COMMENT ON COLUMN donation_items.description IS 'Optional description for this line item';

-- =====================================================
-- Table: expense_items
-- Description: Line items for expenses with categories and amounts
-- =====================================================
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
COMMENT ON COLUMN expense_items.expense_id IS 'Reference to parent expense (CASCADE delete)';
COMMENT ON COLUMN expense_items.category_id IS 'Category for this line item';
COMMENT ON COLUMN expense_items.amount IS 'Amount for this line item';
COMMENT ON COLUMN expense_items.description IS 'Optional description for this line item';

-- =====================================================
-- Data Migration: Move existing donation data to items
-- =====================================================
-- For each existing donation, create a corresponding donation_item
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

-- =====================================================
-- Data Migration: Move existing expense data to items
-- =====================================================
-- For each existing expense, create a corresponding expense_item
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

-- =====================================================
-- Schema Update: Remove category_id and amount from donations
-- =====================================================
-- Drop the columns that are now in the items tables
ALTER TABLE donations DROP COLUMN IF EXISTS category_id;
ALTER TABLE donations DROP COLUMN IF EXISTS amount;

-- =====================================================
-- Schema Update: Remove category_id and amount from expenses
-- =====================================================
-- Drop the columns that are now in the items tables
ALTER TABLE expenses DROP COLUMN IF EXISTS category_id;
ALTER TABLE expenses DROP COLUMN IF EXISTS amount;

-- =====================================================
-- Indexes for performance
-- =====================================================
-- Indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_donation_items_donation_id ON donation_items(donation_id);
CREATE INDEX IF NOT EXISTS idx_donation_items_category_id ON donation_items(category_id);
CREATE INDEX IF NOT EXISTS idx_expense_items_expense_id ON expense_items(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_items_category_id ON expense_items(category_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_donation_items_donation_category ON donation_items(donation_id, category_id);
CREATE INDEX IF NOT EXISTS idx_expense_items_expense_category ON expense_items(expense_id, category_id);

COMMENT ON INDEX idx_donation_items_donation_id IS 'Fast lookup of items by donation';
COMMENT ON INDEX idx_donation_items_category_id IS 'Fast lookup of items by category';
COMMENT ON INDEX idx_expense_items_expense_id IS 'Fast lookup of items by expense';
COMMENT ON INDEX idx_expense_items_category_id IS 'Fast lookup of items by category';
