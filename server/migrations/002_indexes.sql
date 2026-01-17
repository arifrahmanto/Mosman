-- =====================================================
-- Migration: 002_indexes.sql
-- Description: Create indexes for performance optimization
-- Author: System
-- Date: 2026-01-17
-- =====================================================

-- =====================================================
-- Indexes for donations table
-- =====================================================

-- Index on pocket_id for filtering donations by pocket
CREATE INDEX IF NOT EXISTS idx_donations_pocket_id
ON donations(pocket_id);

-- Index on category_id for filtering donations by category
CREATE INDEX IF NOT EXISTS idx_donations_category_id
ON donations(category_id);

-- Index on donation_date for date-based queries and sorting
CREATE INDEX IF NOT EXISTS idx_donations_date
ON donations(donation_date DESC);

-- Index on recorded_by for tracking who recorded donations
CREATE INDEX IF NOT EXISTS idx_donations_recorded_by
ON donations(recorded_by);

-- Composite index for common query pattern: pocket + date
CREATE INDEX IF NOT EXISTS idx_donations_pocket_date
ON donations(pocket_id, donation_date DESC);

-- =====================================================
-- Indexes for expenses table
-- =====================================================

-- Index on pocket_id for filtering expenses by pocket
CREATE INDEX IF NOT EXISTS idx_expenses_pocket_id
ON expenses(pocket_id);

-- Index on category_id for filtering expenses by category
CREATE INDEX IF NOT EXISTS idx_expenses_category_id
ON expenses(category_id);

-- Index on expense_date for date-based queries and sorting
CREATE INDEX IF NOT EXISTS idx_expenses_date
ON expenses(expense_date DESC);

-- Index on status for filtering pending/approved expenses
CREATE INDEX IF NOT EXISTS idx_expenses_status
ON expenses(status);

-- Index on recorded_by for tracking who recorded expenses
CREATE INDEX IF NOT EXISTS idx_expenses_recorded_by
ON expenses(recorded_by);

-- Index on approved_by for tracking who approved expenses
CREATE INDEX IF NOT EXISTS idx_expenses_approved_by
ON expenses(approved_by) WHERE approved_by IS NOT NULL;

-- Composite index for common query pattern: pocket + date
CREATE INDEX IF NOT EXISTS idx_expenses_pocket_date
ON expenses(pocket_id, expense_date DESC);

-- Composite index for approval workflow: status + date
CREATE INDEX IF NOT EXISTS idx_expenses_status_date
ON expenses(status, expense_date DESC);

-- =====================================================
-- Indexes for user_profiles table
-- =====================================================

-- Index on role for role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role
ON user_profiles(role);

-- Index on is_active for filtering active users
CREATE INDEX IF NOT EXISTS idx_user_profiles_active
ON user_profiles(is_active) WHERE is_active = true;

-- =====================================================
-- Indexes for pockets table
-- =====================================================

-- Index on is_active for filtering active pockets
CREATE INDEX IF NOT EXISTS idx_pockets_active
ON pockets(is_active) WHERE is_active = true;

-- =====================================================
-- Indexes for categories tables
-- =====================================================

-- Index on is_active for donation_categories
CREATE INDEX IF NOT EXISTS idx_donation_categories_active
ON donation_categories(is_active) WHERE is_active = true;

-- Index on is_active for expense_categories
CREATE INDEX IF NOT EXISTS idx_expense_categories_active
ON expense_categories(is_active) WHERE is_active = true;
