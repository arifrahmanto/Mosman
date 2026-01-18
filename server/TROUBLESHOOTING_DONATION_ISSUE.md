# Troubleshooting: Donation Creation Issue

## Masalah yang Dilaporkan

1. ❌ Tabel `donations` tidak ada penambahan record ketika POST /api/v1/donations
2. ✅ Tabel `donation_items` ada penambahan record (tapi donation parent tidak ada)
3. ❌ `current_balance` pada pocket tidak update

## Root Cause Analysis

### 1. Test Database Insert

Saya sudah membuat test script dan hasilnya:
```bash
node test-donation-insert.js
```

✅ **Result**: Test BERHASIL!
- Donation ter-insert dengan benar
- Donation items ter-insert dengan benar
- Data bisa di-query dengan relasi

**Kesimpulan**: Database dan migration sudah benar.

### 2. Kemungkinan Penyebab

#### A. Transaction/Rollback Issue
Jika ada error setelah items di-insert tapi sebelum response, donation mungkin ter-rollback.

**Check**: Lihat error di API response atau server logs

#### B. RLS (Row Level Security) Policy
User yang akses mungkin tidak punya permission untuk read donations tapi punya untuk read donation_items.

**Check**: Pastikan user memiliki role `admin` atau `treasurer`

#### C. Pocket Balance Tidak Update
Ini **CONFIRMED** - belum ada trigger untuk auto-update balance.

**Solution**: Jalankan migration 008_pocket_balance_triggers.sql

---

## Solutions

### Solution 1: Check API Error Response

Ketika POST /api/v1/donations, check response lengkap:

```bash
curl -X POST http://localhost:3000/api/v1/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pocket_id": "uuid",
    "donor_name": "Test",
    "is_anonymous": false,
    "payment_method": "cash",
    "donation_date": "2026-01-18",
    "items": [
      {
        "category_id": "uuid",
        "amount": 100000,
        "description": "Test"
      }
    ]
  }' \
  -v
```

Check:
- Status code (should be 201)
- Response body (should have donation.id)
- Any error messages

### Solution 2: Check Server Logs

Jalankan server dengan logging:

```bash
npm run dev
```

Lihat console untuk error messages saat POST donation.

### Solution 3: Check Database Directly

Query donations yang baru saja dibuat:

```sql
-- Get latest donations with items
SELECT
  d.id,
  d.donor_name,
  d.donation_date,
  d.created_at,
  json_agg(json_build_object(
    'id', di.id,
    'amount', di.amount,
    'description', di.description
  )) as items
FROM donations d
LEFT JOIN donation_items di ON di.donation_id = d.id
WHERE d.created_at > NOW() - INTERVAL '1 hour'
GROUP BY d.id
ORDER BY d.created_at DESC;
```

### Solution 4: Fix Pocket Balance (WAJIB!)

Pocket balance tidak auto-update karena belum ada trigger.

**Langkah:**

1. Jalankan migration untuk pocket balance triggers:

```bash
# Via Supabase Dashboard
# 1. Go to: https://supabase.com/dashboard/project/qwubypmzeafooowuxgnu/sql
# 2. Copy contents of: server/migrations/008_pocket_balance_triggers.sql
# 3. Paste and run in SQL Editor
```

2. Atau via psql:

```bash
psql "your-connection-string" -f migrations/008_pocket_balance_triggers.sql
```

3. Verify triggers created:

```sql
-- Check if triggers exist
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('donation_items', 'expense_items', 'donations', 'expenses')
ORDER BY event_object_table, trigger_name;
```

4. Verify pocket balances updated:

```sql
-- Check pocket balances
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
  -- This should match current_balance
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

Jika `current_balance` != `calculated_balance`, ada masalah.

### Solution 5: Check RLS Policies

Pastikan user bisa read donations:

```sql
-- Check current user's role
SELECT id, email, role, is_active
FROM user_profiles
WHERE id = auth.uid();

-- Should return role = 'admin' or 'treasurer' with is_active = true
```

Jika user tidak punya permission:
1. Update user role ke `admin` atau `treasurer`
2. Pastikan `is_active = true`

### Solution 6: Manual Debugging

Gunakan test script untuk debug:

```bash
# Test donation insert directly
node test-donation-insert.js
```

Jika ini berhasil tapi API gagal, masalahnya di application layer (service/controller).

---

## Quick Fix Checklist

- [ ] Run migration 008 untuk pocket balance triggers
- [ ] Check API error response saat POST donation
- [ ] Verify user memiliki role admin/treasurer
- [ ] Check server logs untuk error messages
- [ ] Query database langsung untuk verify data
- [ ] Test dengan script test-donation-insert.js

---

## Expected Behavior After Fix

1. ✅ POST /api/v1/donations creates donation + items
2. ✅ Pocket `current_balance` auto-updates
3. ✅ GET /api/v1/donations/:id returns donation dengan items
4. ✅ GET /api/v1/pockets/:id returns pocket dengan balance yang benar

---

## Migration 008 Features

Setelah migration 008 dijalankan:

### Auto-Update Triggers

1. **Donation Items**:
   - INSERT → Balance bertambah
   - UPDATE → Balance adjust (kurangi old, tambah new)
   - DELETE → Balance berkurang

2. **Expense Items**:
   - INSERT → Balance berkurang (jika expense approved)
   - UPDATE → Balance adjust
   - DELETE → Balance bertambah (jika expense approved)

3. **Expense Status Change**:
   - PENDING → APPROVED: Balance berkurang
   - APPROVED → REJECTED: Balance bertambah kembali

4. **Pocket Change**:
   - Jika donation/expense pindah pocket → Both pockets di-update

### Function Available

```sql
-- Manual recalculate pocket balance
SELECT update_pocket_balance('pocket-uuid');
```

---

## Contact

Jika masalah masih terjadi, provide:
1. API error response (full JSON)
2. Server console logs
3. User role dan permissions
4. Output dari test-donation-insert.js
