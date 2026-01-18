-- =====================================================
-- Migration: 006_line_items_rls.sql
-- Description: Row Level Security policies for line items tables
-- Author: System
-- Date: 2026-01-18
-- =====================================================

-- Enable RLS on line items tables
ALTER TABLE donation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies: donation_items
-- =====================================================

-- SELECT: All authenticated users can read donation items
CREATE POLICY "Authenticated users can read donation items"
  ON donation_items
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Admin and treasurer can insert donation items
CREATE POLICY "Admin and treasurer can insert donation items"
  ON donation_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'treasurer')
      AND is_active = true
    )
  );

-- UPDATE: Admin and treasurer can update donation items
CREATE POLICY "Admin and treasurer can update donation items"
  ON donation_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'treasurer')
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'treasurer')
      AND is_active = true
    )
  );

-- DELETE: Admin and treasurer can delete donation items
CREATE POLICY "Admin and treasurer can delete donation items"
  ON donation_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'treasurer')
      AND is_active = true
    )
  );

-- =====================================================
-- RLS Policies: expense_items
-- =====================================================

-- SELECT: All authenticated users can read expense items
CREATE POLICY "Authenticated users can read expense items"
  ON expense_items
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Admin and treasurer can insert expense items
CREATE POLICY "Admin and treasurer can insert expense items"
  ON expense_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'treasurer')
      AND is_active = true
    )
  );

-- UPDATE: Admin and treasurer can update expense items
CREATE POLICY "Admin and treasurer can update expense items"
  ON expense_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'treasurer')
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'treasurer')
      AND is_active = true
    )
  );

-- DELETE: Admin can delete expense items
CREATE POLICY "Admin can delete expense items"
  ON expense_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );
