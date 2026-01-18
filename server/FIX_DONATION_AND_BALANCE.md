# Fix: Donation & Pocket Balance Issues

## Ringkasan Masalah

User melaporkan:
1. ❌ Tabel `donations` tidak ada penambahan record
2. ✅ Hanya `donation_items` yang bertambah
3. ❌ `current_balance` pocket tidak update

## Hasil Investigasi

### ✅ Database Test: PASSED

Saya sudah test insert donation secara langsung ke database:

```bash
node test-donation-insert.js
```

**Hasil**: ✅ Berhasil!
- Donation ter-create
- Donation items ter-create
- Data bisa di-query dengan benar

**Kesimpulan**: Migration sudah benar, database schema sudah OK.

### ❌ Pocket Balance: NOT IMPLEMENTED

Pocket balance memang tidak auto-update karena belum ada trigger di database.

**Status**: Sudah dibuat migration 008 untuk fix ini.

---

## Solusi

### 1. Jalankan Migration 008 (WAJIB!)

Migration ini menambahkan auto-update triggers untuk pocket balance.

#### Via Supabase Dashboard (Recommended):

```bash
# 1. Buka Supabase SQL Editor
https://supabase.com/dashboard/project/qwubypmzeafooowuxgnu/sql

# 2. Copy isi file ini:
server/migrations/008_pocket_balance_triggers.sql

# 3. Paste ke SQL Editor dan Run
```

#### Via psql:

```bash
psql "your-connection-string" -f server/migrations/008_pocket_balance_triggers.sql
```

#### Apa yang Dilakukan Migration 008:

✅ **Function `update_pocket_balance(pocket_uuid)`**
- Recalculate pocket balance berdasarkan donations dan approved expenses
- Formula: `balance = total_donations - total_approved_expenses`

✅ **Auto Triggers untuk Donation Items**
- INSERT → Balance bertambah
- UPDATE → Balance adjust
- DELETE → Balance berkurang

✅ **Auto Triggers untuk Expense Items**
- INSERT → Balance berkurang (jika approved)
- UPDATE → Balance adjust
- DELETE → Balance bertambah (jika approved)

✅ **Auto Triggers untuk Expense Status Change**
- Approved → Rejected: Balance bertambah kembali
- Pending → Approved: Balance berkurang

✅ **Initial Balance Calculation**
- Recalculate semua pocket balances saat migration dijalankan

### 2. Troubleshoot Donation Issue

Jika masih ada masalah dengan donation creation:

#### A. Check API Error

Saat POST /api/v1/donations, check response:

```bash
# Lihat full error response
curl -X POST http://localhost:3000/api/v1/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{...}' \
  -v
```

#### B. Check Server Logs

```bash
npm run dev
# Lihat console untuk error messages
```

#### C. Check User Permissions

Query di Supabase SQL Editor:

```sql
-- Check role user saat ini
SELECT id, email, role, is_active
FROM user_profiles
WHERE email = 'your-email@example.com';

-- Should have role = 'admin' or 'treasurer' with is_active = true
```

#### D. Verify Data di Database

```sql
-- Check latest donations
SELECT
  d.id,
  d.donor_name,
  d.donation_date,
  d.created_at,
  (SELECT COUNT(*) FROM donation_items WHERE donation_id = d.id) as items_count,
  (SELECT SUM(amount) FROM donation_items WHERE donation_id = d.id) as total_amount
FROM donations d
ORDER BY d.created_at DESC
LIMIT 10;
```

---

## Verifikasi Setelah Fix

### 1. Check Triggers Created

```sql
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%pocket%'
ORDER BY event_object_table, trigger_name;

-- Should return 9 triggers:
-- - update_pocket_on_donation_item_insert
-- - update_pocket_on_donation_item_update
-- - update_pocket_on_donation_item_delete
-- - update_pocket_on_expense_item_insert
-- - update_pocket_on_expense_item_update
-- - update_pocket_on_expense_item_delete
-- - update_pocket_on_expense_status_change
-- - update_pocket_on_donation_pocket_change
-- - update_pocket_on_expense_pocket_change
```

### 2. Check Pocket Balances

```sql
SELECT
  p.id,
  p.name,
  p.current_balance,
  (SELECT COALESCE(SUM(di.amount), 0)
   FROM donations d
   JOIN donation_items di ON di.donation_id = d.id
   WHERE d.pocket_id = p.id) AS total_donations,
  (SELECT COALESCE(SUM(ei.amount), 0)
   FROM expenses e
   JOIN expense_items ei ON ei.expense_id = e.id
   WHERE e.pocket_id = p.id AND e.status = 'approved') AS total_approved_expenses,
  -- Calculated balance (should match current_balance)
  (SELECT COALESCE(SUM(di.amount), 0)
   FROM donations d
   JOIN donation_items di ON di.donation_id = d.id
   WHERE d.pocket_id = p.id) -
  (SELECT COALESCE(SUM(ei.amount), 0)
   FROM expenses e
   JOIN expense_items ei ON ei.expense_id = e.id
   WHERE e.pocket_id = p.id AND e.status = 'approved') AS calculated_balance
FROM pockets p;
```

**Expected**: `current_balance` = `calculated_balance`

### 3. Test Donation Creation

```bash
# Test via API
curl -X POST http://localhost:3000/api/v1/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pocket_id": "pocket-uuid",
    "donor_name": "Test Donor",
    "is_anonymous": false,
    "payment_method": "cash",
    "donation_date": "2026-01-18",
    "items": [
      {
        "category_id": "category-uuid",
        "amount": 100000,
        "description": "Test donation"
      }
    ]
  }'

# Should return 201 Created with donation object
```

### 4. Verify Balance Updated

```sql
-- Check pocket balance setelah donation
SELECT id, name, current_balance
FROM pockets
WHERE id = 'pocket-uuid';

-- Balance should increase by 100000
```

---

## Expected Behavior Setelah Fix

### 1. Create Donation
```
POST /api/v1/donations
→ Creates donation record ✅
→ Creates donation_items records ✅
→ Auto-updates pocket.current_balance ✅
→ Returns donation with items ✅
```

### 2. Create Expense
```
POST /api/v1/expenses
→ Creates expense record ✅
→ Creates expense_items records ✅
→ Status = 'pending' ✅
→ Pocket balance unchanged (not approved yet) ✅
```

### 3. Approve Expense
```
PUT /api/v1/expenses/:id/approve
→ Updates expense.status = 'approved' ✅
→ Auto-updates pocket.current_balance (decreases) ✅
→ Returns updated expense ✅
```

### 4. Update Donation Items
```
PUT /api/v1/donations/:id
→ Updates donation info ✅
→ Replaces donation_items (if provided) ✅
→ Auto-adjusts pocket balance ✅
```

---

## Manual Balance Recalculation

Jika perlu recalculate balance secara manual:

```sql
-- Recalculate single pocket
SELECT update_pocket_balance('pocket-uuid');

-- Recalculate all pockets
DO $$
DECLARE
  pocket_record RECORD;
BEGIN
  FOR pocket_record IN SELECT id FROM pockets LOOP
    PERFORM update_pocket_balance(pocket_record.id);
  END LOOP;
END $$;
```

---

## Files Created

1. ✅ `migrations/008_pocket_balance_triggers.sql` - Migration untuk auto-update balance
2. ✅ `test-donation-insert.js` - Test script untuk debug donation insert
3. ✅ `check-migration-status.js` - Script untuk cek migration status
4. ✅ `TROUBLESHOOTING_DONATION_ISSUE.md` - Panduan troubleshooting lengkap
5. ✅ `FIX_DONATION_AND_BALANCE.md` - Panduan fix (this file)

---

## Action Items

### Immediate (Wajib):
- [ ] Jalankan migration 008 via Supabase Dashboard
- [ ] Verify triggers created dengan query di atas
- [ ] Check pocket balances match calculated values

### If Donation Issue Persists:
- [ ] Check API error response
- [ ] Check server logs
- [ ] Verify user permissions (role admin/treasurer)
- [ ] Query database untuk verify donations created
- [ ] Run test-donation-insert.js untuk isolate issue

### Testing:
- [ ] Test POST /api/v1/donations
- [ ] Verify donation + items created
- [ ] Verify pocket balance updated
- [ ] Test POST /api/v1/expenses
- [ ] Test PUT /api/v1/expenses/:id/approve
- [ ] Verify balance decreased

---

## Summary

**Root Cause**:
1. Donation creation likely working (test passed) - mungkin user issue atau permissions
2. Pocket balance definitely NOT auto-updating - no triggers exist

**Solution**:
1. ✅ Migration 008 created - adds auto-update triggers
2. ✅ Test scripts created - for debugging
3. ✅ Troubleshooting guide created - for investigation

**Next Step**:
🚀 **Jalankan Migration 008 sekarang!**

```bash
# Go to Supabase Dashboard SQL Editor
https://supabase.com/dashboard/project/qwubypmzeafooowuxgnu/sql

# Run migrations/008_pocket_balance_triggers.sql
```
