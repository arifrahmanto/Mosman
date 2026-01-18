-- =====================================================
-- Migration: 007_line_items_triggers.sql
-- Description: Triggers for line items tables (updated_at)
-- Author: System
-- Date: 2026-01-18
-- =====================================================

-- The update_updated_at_column function is already created in 004_triggers.sql
-- We just need to add triggers for the new tables

-- =====================================================
-- Trigger: donation_items updated_at
-- =====================================================
CREATE TRIGGER update_donation_items_updated_at
  BEFORE UPDATE ON donation_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_donation_items_updated_at ON donation_items IS
  'Automatically updates updated_at timestamp on row update';

-- =====================================================
-- Trigger: expense_items updated_at
-- =====================================================
CREATE TRIGGER update_expense_items_updated_at
  BEFORE UPDATE ON expense_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_expense_items_updated_at ON expense_items IS
  'Automatically updates updated_at timestamp on row update';
