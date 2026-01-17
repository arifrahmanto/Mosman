-- =====================================================
-- Migration: 001_initial_schema.sql
-- Description: Create core database tables for Mosman
-- Author: System
-- Date: 2026-01-17
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: pockets
-- Description: Financial pockets/accounts for mosque
-- =====================================================
CREATE TABLE IF NOT EXISTS pockets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  current_balance NUMERIC(15,2) DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE pockets IS 'Financial pockets/accounts (Kas Umum, Kas Pembangunan, etc.)';
COMMENT ON COLUMN pockets.current_balance IS 'Current balance calculated from donations minus expenses';

-- =====================================================
-- Table: donation_categories
-- Description: Categories for donations (Infaq, Zakat, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS donation_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE donation_categories IS 'Categories for donations (Infaq Umum, Zakat, Sedekah, Wakaf)';

-- =====================================================
-- Table: expense_categories
-- Description: Categories for expenses (Operasional, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE expense_categories IS 'Categories for expenses (Operasional, Pemeliharaan, Gaji, etc.)';

-- =====================================================
-- Table: user_profiles
-- Description: Extended user profiles with roles
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'treasurer', 'viewer')),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE user_profiles IS 'Extended user profiles with role-based access';
COMMENT ON COLUMN user_profiles.role IS 'User role: admin, treasurer, or viewer';

-- =====================================================
-- Table: donations
-- Description: Records of all donations received
-- =====================================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pocket_id UUID NOT NULL REFERENCES pockets(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES donation_categories(id) ON DELETE RESTRICT,
  donor_name VARCHAR(255),
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  is_anonymous BOOLEAN DEFAULT false NOT NULL,
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'qris')),
  receipt_url TEXT,
  notes TEXT,
  donation_date DATE NOT NULL,
  recorded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE donations IS 'Records of all donations received by the mosque';
COMMENT ON COLUMN donations.pocket_id IS 'Which pocket this donation goes to';
COMMENT ON COLUMN donations.is_anonymous IS 'Whether donor name should be hidden';
COMMENT ON COLUMN donations.payment_method IS 'How donation was received: cash, transfer, or qris';

-- =====================================================
-- Table: expenses
-- Description: Records of all expenses made
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pocket_id UUID NOT NULL REFERENCES pockets(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  receipt_url TEXT,
  expense_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recorded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE expenses IS 'Records of all expenses made by the mosque';
COMMENT ON COLUMN expenses.pocket_id IS 'Which pocket this expense is deducted from';
COMMENT ON COLUMN expenses.status IS 'Approval status: pending, approved, or rejected';
COMMENT ON COLUMN expenses.approved_by IS 'User who approved the expense (admin only)';
