-- =====================================================
-- Migration: 004_triggers.sql
-- Description: Database triggers for automated tasks
-- Author: System
-- Date: 2026-01-17
-- =====================================================

-- =====================================================
-- Function: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at timestamp on row update';

-- =====================================================
-- Triggers: Apply update_updated_at to all tables
-- =====================================================

-- Pockets table
CREATE TRIGGER update_pockets_updated_at
  BEFORE UPDATE ON pockets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Donation categories table
CREATE TRIGGER update_donation_categories_updated_at
  BEFORE UPDATE ON donation_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Expense categories table
CREATE TRIGGER update_expense_categories_updated_at
  BEFORE UPDATE ON expense_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- User profiles table
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Donations table
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Expenses table
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Function: Auto-create user profile on auth.users insert
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer', -- Default role
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates user_profiles entry when a new user signs up';

-- =====================================================
-- Trigger: Create user profile on new auth user
-- =====================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
