# Swagger Example Values - Update Documentation

## Ringkasan

Semua example values pada Swagger API routes telah diperbarui untuk mencerminkan arsitektur line items yang baru.

**Tanggal**: 2026-01-18
**Status**: ✅ Selesai

---

## Donation Routes Updates

### 1. POST /v1/donations - Create Donation

**Request Example (Updated):**
```yaml
pocket_id: "11111111-1111-1111-1111-111111111111"
donor_name: "Ahmad Yusuf"
is_anonymous: false
payment_method: "transfer"
donation_date: "2026-01-18"
notes: "Donasi dari Ahmad Yusuf"
items:
  - category_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
    amount: 300000
    description: "Zakat Fitrah"
  - category_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
    amount: 200000
    description: "Infaq Masjid"
```

**Response Example (Added):**
- Menampilkan complete response dengan `total_amount: 500000`
- Menampilkan array `items` dengan 2 items
- Setiap item memiliki `id`, `category_name`, timestamps

**Perubahan:**
- ❌ Removed: `category_id` dan `amount` dari request
- ✅ Added: `items` array dengan multiple categories
- ✅ Added: Complete response example dengan line items

### 2. PUT /v1/donations/{id} - Update Donation

**Schema Updated:**
- Menggunakan `$ref: '#/components/schemas/UpdateDonation'` instead of inline schema

**Multiple Examples Added:**
```yaml
examples:
  updateBasicInfo:
    summary: Update basic information only
    value:
      donor_name: "Ahmad Yusuf (Updated)"
      notes: "Updated donor information"

  updateWithItems:
    summary: Update with new line items
    value:
      donor_name: "Ahmad Yusuf"
      notes: "Updated donation with new items"
      items:
        - category_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
          amount: 400000
          description: "Zakat Mal"
        - category_id: "cccccccc-cccc-cccc-cccc-cccccccccccc"
          amount: 100000
          description: "Sedekah"
```

**Response Example (Added):**
- Complete response dengan updated items
- Menunjukkan perubahan `total_amount: 500000`
- Timestamps `updated_at` berubah

**Perubahan:**
- ❌ Removed: Inline schema dengan `category_id` dan `amount`
- ✅ Added: Reference ke `UpdateDonation` schema
- ✅ Added: Multiple examples (basic info vs with items)
- ✅ Added: Complete response example

---

## Expense Routes Updates

### 1. POST /v1/expenses - Create Expense

**Request Example (Updated):**
```yaml
pocket_id: "11111111-1111-1111-1111-111111111111"
description: "Biaya operasional masjid bulan Januari"
expense_date: "2026-01-18"
notes: "Pengeluaran untuk operasional rutin"
items:
  - category_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"
    amount: 500000
    description: "Tagihan listrik"
  - category_id: "ffffffff-ffff-ffff-ffff-ffffffffffff"
    amount: 300000
    description: "Tagihan air"
  - category_id: "gggggggg-gggg-gggg-gggg-gggggggggggg"
    amount: 200000
    description: "Perlengkapan kebersihan"
```

**Response Example (Added):**
- Status default: `"pending"`
- Total amount: `1000000` (sum of 500000 + 300000 + 200000)
- Array items dengan 3 line items
- Fields: `approved_by: null` (belum diapprove)

**Perubahan:**
- ❌ Removed: `category_id` dan `amount` dari request
- ✅ Added: `items` array dengan 3 categories berbeda
- ✅ Added: Complete response dengan status "pending"
- ✅ Added: Realistic operational expense scenario

### 2. PUT /v1/expenses/{id} - Update Expense

**Schema Updated:**
- Menggunakan `$ref: '#/components/schemas/UpdateExpense'` instead of inline schema

**Multiple Examples Added:**
```yaml
examples:
  updateBasicInfo:
    summary: Update basic information only
    value:
      description: "Biaya operasional masjid bulan Januari (Updated)"
      notes: "Catatan diperbarui"

  updateWithItems:
    summary: Update with new line items
    value:
      description: "Biaya renovasi masjid"
      notes: "Perubahan kategori pengeluaran"
      items:
        - category_id: "hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh"
          amount: 3000000
          description: "Material bangunan"
        - category_id: "iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii"
          amount: 2000000
          description: "Upah tukang"
```

**Response Example (Added):**
- Menunjukkan perubahan dari "operasional" ke "renovasi"
- Total amount berubah menjadi `5000000`
- Items diganti dengan 2 items baru (renovation scenario)

**Perubahan:**
- ❌ Removed: Inline schema dengan `category_id` dan `amount`
- ✅ Added: Reference ke `UpdateExpense` schema
- ✅ Added: Multiple examples (basic update vs items replacement)
- ✅ Added: Realistic renovation expense scenario

### 3. PUT /v1/expenses/{id}/approve - Approve/Reject Expense

**Schema Updated:**
- Menggunakan `$ref: '#/components/schemas/ApproveExpense'` instead of inline schema

**Multiple Examples Added:**
```yaml
examples:
  approve:
    summary: Approve expense
    value:
      status: "approved"

  reject:
    summary: Reject expense
    value:
      status: "rejected"
```

**Response Example (Added):**
- Status berubah menjadi `"approved"`
- Field `approved_by: "admin-uuid"` terisi
- Timestamp `updated_at` berubah
- Menampilkan complete expense dengan all items

**Perubahan:**
- ✅ Updated: Schema menggunakan reference
- ✅ Added: Separate examples untuk approve dan reject
- ✅ Added: Complete response showing approved expense dengan items

---

## Key Improvements

### 1. Realistic Scenarios
Semua examples menggunakan skenario realistis:
- **Donations**: Zakat Fitrah + Infaq, atau Zakat Mal + Sedekah
- **Expenses**: Tagihan listrik + air + kebersihan, atau renovasi masjid

### 2. Complete Responses
Semua endpoints sekarang memiliki complete response examples:
- Menampilkan struktur data lengkap
- Termasuk `total_amount` (calculated field)
- Termasuk array `items` dengan semua fields
- Timestamps yang realistis

### 3. Multiple Examples
Update endpoints memiliki multiple examples:
- **Basic update**: Hanya update info dasar (tanpa items)
- **With items**: Update termasuk replacement items
- Membantu developer understand both use cases

### 4. Schema References
Semua inline schemas diganti dengan references:
- `$ref: '#/components/schemas/CreateDonation'`
- `$ref: '#/components/schemas/UpdateDonation'`
- `$ref: '#/components/schemas/CreateExpense'`
- `$ref: '#/components/schemas/UpdateExpense'`
- `$ref: '#/components/schemas/ApproveExpense'`

Benefit: Consistency dan easier maintenance

---

## Files Modified

- ✅ `src/routes/donations.ts`
  - POST /v1/donations: Updated request + added response example
  - PUT /v1/donations/{id}: Schema reference + multiple examples + response

- ✅ `src/routes/expenses.ts`
  - POST /v1/expenses: Updated request + added response example
  - PUT /v1/expenses/{id}: Schema reference + multiple examples + response
  - PUT /v1/expenses/{id}/approve: Schema reference + multiple examples + response

---

## Testing in Swagger UI

Setelah server berjalan, buka Swagger UI:
- Development: http://localhost:3000/api-docs
- Production: https://api.mosman.app/api-docs

**What to check:**
1. ✅ Request examples menampilkan format baru dengan `items` array
2. ✅ Response examples menampilkan `total_amount` dan `items` array
3. ✅ Update endpoints memiliki dropdown untuk pilih example
4. ✅ Semua schema references ter-resolve dengan benar
5. ✅ Try It Out feature berfungsi dengan example values

---

## Breaking Changes Summary

⚠️ **Old Format (DEPRECATED):**
```json
{
  "pocket_id": "uuid",
  "category_id": "uuid",
  "amount": 100000
}
```

✅ **New Format (REQUIRED):**
```json
{
  "pocket_id": "uuid",
  "items": [
    {
      "category_id": "uuid",
      "amount": 100000,
      "description": "optional"
    }
  ]
}
```

---

## Next Steps

1. ✅ Swagger examples updated
2. ⏳ Run database migrations
3. ⏳ Test API with Swagger UI
4. ⏳ Update frontend/client code to use new format
5. ⏳ Update API documentation/guides if any

---

## Compilation Status

```bash
npm run build
```

✅ **Build successful** - All TypeScript compilation passed
