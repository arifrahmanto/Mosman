-- =====================================================
-- ALL MIGRATIONS COMBINED
-- Run this single file in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- MIGRATION 001: Initial Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: pockets
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

-- Table: donation_categories
CREATE TABLE IF NOT EXISTS donation_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE donation_categories IS 'Categories for donations (Infaq Umum, Zakat, Sedekah, Wakaf)';

-- Table: expense_categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE expense_categories IS 'Categories for expenses (Operasional, Pemeliharaan, Gaji, etc.)';

-- Table: user_profiles
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

-- Table: donations
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

-- Table: expenses
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

-- =====================================================
-- MIGRATION 002: Indexes
-- =====================================================

-- Donations indexes
CREATE INDEX IF NOT EXISTS idx_donations_pocket_id ON donations(pocket_id);
CREATE INDEX IF NOT EXISTS idx_donations_category_id ON donations(category_id);
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(donation_date DESC);
CREATE INDEX IF NOT EXISTS idx_donations_recorded_by ON donations(recorded_by);
CREATE INDEX IF NOT EXISTS idx_donations_pocket_date ON donations(pocket_id, donation_date DESC);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_pocket_id ON expenses(pocket_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_recorded_by ON expenses(recorded_by);
CREATE INDEX IF NOT EXISTS idx_expenses_approved_by ON expenses(approved_by) WHERE approved_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_pocket_date ON expenses(pocket_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_status_date ON expenses(status, expense_date DESC);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active) WHERE is_active = true;

-- Pockets and categories indexes
CREATE INDEX IF NOT EXISTS idx_pockets_active ON pockets(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_donation_categories_active ON donation_categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_expense_categories_active ON expense_categories(is_active) WHERE is_active = true;

-- =====================================================
-- MIGRATION 003: RLS Policies
-- =====================================================

-- Enable RLS
ALTER TABLE pockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM user_profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Pockets policies
CREATE POLICY "pockets_select_policy" ON pockets FOR SELECT TO authenticated USING (true);
CREATE POLICY "pockets_insert_policy" ON pockets FOR INSERT TO authenticated WITH CHECK (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "pockets_update_policy" ON pockets FOR UPDATE TO authenticated USING (get_user_role(auth.uid()) = 'admin') WITH CHECK (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "pockets_delete_policy" ON pockets FOR DELETE TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- Donation categories policies
CREATE POLICY "donation_categories_select_policy" ON donation_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "donation_categories_insert_policy" ON donation_categories FOR INSERT TO authenticated WITH CHECK (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "donation_categories_update_policy" ON donation_categories FOR UPDATE TO authenticated USING (get_user_role(auth.uid()) = 'admin') WITH CHECK (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "donation_categories_delete_policy" ON donation_categories FOR DELETE TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- Expense categories policies
CREATE POLICY "expense_categories_select_policy" ON expense_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "expense_categories_insert_policy" ON expense_categories FOR INSERT TO authenticated WITH CHECK (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "expense_categories_update_policy" ON expense_categories FOR UPDATE TO authenticated USING (get_user_role(auth.uid()) = 'admin') WITH CHECK (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "expense_categories_delete_policy" ON expense_categories FOR DELETE TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- User profiles policies
CREATE POLICY "user_profiles_select_policy" ON user_profiles FOR SELECT TO authenticated USING (id = auth.uid() OR get_user_role(auth.uid()) = 'admin');
CREATE POLICY "user_profiles_update_policy" ON user_profiles FOR UPDATE TO authenticated USING (get_user_role(auth.uid()) = 'admin') WITH CHECK (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "user_profiles_delete_policy" ON user_profiles FOR DELETE TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- Donations policies
CREATE POLICY "donations_select_policy" ON donations FOR SELECT TO authenticated USING (true);
CREATE POLICY "donations_insert_policy" ON donations FOR INSERT TO authenticated WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'treasurer'));
CREATE POLICY "donations_update_policy" ON donations FOR UPDATE TO authenticated USING (get_user_role(auth.uid()) IN ('admin', 'treasurer')) WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'treasurer'));
CREATE POLICY "donations_delete_policy" ON donations FOR DELETE TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- Expenses policies
CREATE POLICY "expenses_select_policy" ON expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "expenses_insert_policy" ON expenses FOR INSERT TO authenticated WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'treasurer'));
CREATE POLICY "expenses_update_policy" ON expenses FOR UPDATE TO authenticated USING (get_user_role(auth.uid()) IN ('admin', 'treasurer')) WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'treasurer'));
CREATE POLICY "expenses_delete_policy" ON expenses FOR DELETE TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- =====================================================
-- MIGRATION 004: Triggers
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for all tables
CREATE TRIGGER update_pockets_updated_at BEFORE UPDATE ON pockets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donation_categories_updated_at BEFORE UPDATE ON donation_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expense_categories_updated_at BEFORE UPDATE ON expense_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Seed pockets
INSERT INTO pockets (id, name, description, current_balance, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111'::UUID, 'Kas Umum', 'Kas untuk operasional dan kegiatan umum masjid', 0, true),
  ('22222222-2222-2222-2222-222222222222'::UUID, 'Kas Pembangunan', 'Kas untuk pembangunan dan renovasi masjid', 0, true),
  ('33333333-3333-3333-3333-333333333333'::UUID, 'Kas Sawah', 'Kas dari hasil pengelolaan sawah masjid', 0, true),
  ('44444444-4444-4444-4444-444444444444'::UUID, 'Kas Anggota', 'Kas iuran dan kontribusi anggota masjid', 0, true)
ON CONFLICT (id) DO NOTHING;

-- Seed donation categories
INSERT INTO donation_categories (id, name, description, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 'Infaq Umum', 'Sumbangan umum untuk operasional masjid', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID, 'Zakat', 'Zakat mal dan fitrah', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID, 'Sedekah', 'Sedekah sukarela', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd'::UUID, 'Wakaf', 'Wakaf tunai atau barang', true)
ON CONFLICT (id) DO NOTHING;

-- Seed expense categories
INSERT INTO expense_categories (id, name, description, is_active) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::UUID, 'Operasional', 'Biaya operasional harian masjid', true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff'::UUID, 'Pemeliharaan Gedung', 'Perbaikan dan pemeliharaan bangunan', true),
  ('10101010-1010-1010-1010-101010101010'::UUID, 'Gaji Pegawai', 'Gaji imam, marbot, dan pegawai masjid', true),
  ('20202020-2020-2020-2020-202020202020'::UUID, 'Kegiatan Keagamaan', 'Biaya kajian, pengajian, dan kegiatan islami', true),
  ('30303030-3030-3030-3030-303030303030'::UUID, 'Utilitas', 'Listrik, air, dan kebutuhan utilitas lainnya', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- DONE!
-- =====================================================
