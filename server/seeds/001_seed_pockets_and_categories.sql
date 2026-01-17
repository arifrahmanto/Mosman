-- =====================================================
-- Seed Data: 001_seed_pockets_and_categories.sql
-- Description: Initial seed data for pockets and categories
-- Author: System
-- Date: 2026-01-17
-- =====================================================

-- =====================================================
-- Seed: Pockets
-- =====================================================

INSERT INTO pockets (id, name, description, current_balance, is_active) VALUES
  (
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Kas Umum',
    'Kas untuk operasional dan kegiatan umum masjid',
    0,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222'::UUID,
    'Kas Pembangunan',
    'Kas untuk pembangunan dan renovasi masjid',
    0,
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333'::UUID,
    'Kas Sawah',
    'Kas dari hasil pengelolaan sawah masjid',
    0,
    true
  ),
  (
    '44444444-4444-4444-4444-444444444444'::UUID,
    'Kas Anggota',
    'Kas iuran dan kontribusi anggota masjid',
    0,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Seed: Donation Categories
-- =====================================================

INSERT INTO donation_categories (id, name, description, is_active) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
    'Infaq Umum',
    'Sumbangan umum untuk operasional masjid',
    true
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID,
    'Zakat',
    'Zakat mal dan fitrah',
    true
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID,
    'Sedekah',
    'Sedekah sukarela',
    true
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::UUID,
    'Wakaf',
    'Wakaf tunai atau barang',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Seed: Expense Categories
-- =====================================================

INSERT INTO expense_categories (id, name, description, is_active) VALUES
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::UUID,
    'Operasional',
    'Biaya operasional harian masjid',
    true
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::UUID,
    'Pemeliharaan Gedung',
    'Perbaikan dan pemeliharaan bangunan',
    true
  ),
  (
    '10101010-1010-1010-1010-101010101010'::UUID,
    'Gaji Pegawai',
    'Gaji imam, marbot, dan pegawai masjid',
    true
  ),
  (
    '20202020-2020-2020-2020-202020202020'::UUID,
    'Kegiatan Keagamaan',
    'Biaya kajian, pengajian, dan kegiatan islami',
    true
  ),
  (
    '30303030-3030-3030-3030-303030303030'::UUID,
    'Utilitas',
    'Listrik, air, dan kebutuhan utilitas lainnya',
    true
  )
ON CONFLICT (id) DO NOTHING;
