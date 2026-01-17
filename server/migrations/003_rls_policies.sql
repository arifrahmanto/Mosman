-- =====================================================
-- Migration: 003_rls_policies.sql
-- Description: Row Level Security (RLS) policies
-- Author: System
-- Date: 2026-01-17
-- =====================================================

-- =====================================================
-- Enable RLS on all tables
-- =====================================================

ALTER TABLE pockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Helper function to get user role
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM user_profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =====================================================
-- Pockets Table Policies
-- =====================================================

-- SELECT: All authenticated users can read pockets
CREATE POLICY "pockets_select_policy" ON pockets
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only admin can create pockets
CREATE POLICY "pockets_insert_policy" ON pockets
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- UPDATE: Only admin can update pockets
CREATE POLICY "pockets_update_policy" ON pockets
  FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- DELETE: Only admin can delete pockets
CREATE POLICY "pockets_delete_policy" ON pockets
  FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- =====================================================
-- Donation Categories Table Policies
-- =====================================================

-- SELECT: All authenticated users can read donation categories
CREATE POLICY "donation_categories_select_policy" ON donation_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only admin can create donation categories
CREATE POLICY "donation_categories_insert_policy" ON donation_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- UPDATE: Only admin can update donation categories
CREATE POLICY "donation_categories_update_policy" ON donation_categories
  FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- DELETE: Only admin can delete donation categories
CREATE POLICY "donation_categories_delete_policy" ON donation_categories
  FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- =====================================================
-- Expense Categories Table Policies
-- =====================================================

-- SELECT: All authenticated users can read expense categories
CREATE POLICY "expense_categories_select_policy" ON expense_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only admin can create expense categories
CREATE POLICY "expense_categories_insert_policy" ON expense_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- UPDATE: Only admin can update expense categories
CREATE POLICY "expense_categories_update_policy" ON expense_categories
  FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- DELETE: Only admin can delete expense categories
CREATE POLICY "expense_categories_delete_policy" ON expense_categories
  FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- =====================================================
-- User Profiles Table Policies
-- =====================================================

-- SELECT: Users can read their own profile, admins can read all
CREATE POLICY "user_profiles_select_policy" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    get_user_role(auth.uid()) = 'admin'
  );

-- INSERT: Service role only (handled by trigger)
-- Users are created via auth trigger, not directly

-- UPDATE: Only admin can update user profiles
CREATE POLICY "user_profiles_update_policy" ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- DELETE: Only admin can delete user profiles
CREATE POLICY "user_profiles_delete_policy" ON user_profiles
  FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- =====================================================
-- Donations Table Policies
-- =====================================================

-- SELECT: All authenticated users can read donations
CREATE POLICY "donations_select_policy" ON donations
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Admin and treasurer can create donations
CREATE POLICY "donations_insert_policy" ON donations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'treasurer')
  );

-- UPDATE: Admin and treasurer can update donations
CREATE POLICY "donations_update_policy" ON donations
  FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin', 'treasurer'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'treasurer'));

-- DELETE: Only admin can delete donations
CREATE POLICY "donations_delete_policy" ON donations
  FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- =====================================================
-- Expenses Table Policies
-- =====================================================

-- SELECT: All authenticated users can read expenses
CREATE POLICY "expenses_select_policy" ON expenses
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Admin and treasurer can create expenses
CREATE POLICY "expenses_insert_policy" ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'treasurer')
  );

-- UPDATE: Admin and treasurer can update expenses
-- Admin can approve/reject (change status), treasurer can update details
CREATE POLICY "expenses_update_policy" ON expenses
  FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin', 'treasurer'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'treasurer'));

-- DELETE: Only admin can delete expenses
CREATE POLICY "expenses_delete_policy" ON expenses
  FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');
