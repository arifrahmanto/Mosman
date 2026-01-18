# Swagger API Documentation Updates

## Ringkasan Perubahan

Dokumentasi Swagger API telah diperbarui untuk mencerminkan arsitektur line items yang baru pada donations dan expenses.

**Tanggal**: 2026-01-18

---

## Perubahan Utama

### 1. Donation Schemas

#### Schema Baru Ditambahkan:

**`DonationItem`** - Schema untuk item donasi individual:
```json
{
  "category_id": "uuid",
  "amount": 50000,
  "description": "Zakat Fitrah"
}
```

**`DonationItemResponse`** - Schema response untuk item donasi:
```json
{
  "id": "uuid",
  "donation_id": "uuid",
  "category_id": "uuid",
  "category_name": "Zakat",
  "amount": 50000,
  "description": "Zakat Fitrah",
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T10:00:00Z"
}
```

#### Schema yang Diperbarui:

**`Donation`** (Response):
- ❌ Removed: `category_id`, `category_name`, `amount`
- ✅ Added: `total_amount` (sum of all items), `items` (array of DonationItemResponse)

**`CreateDonation`** (Request):
- ❌ Removed: `category_id`, `amount` dari required fields
- ✅ Added: `items` array (required, minimum 1 item)
- Required fields sekarang: `pocket_id`, `is_anonymous`, `payment_method`, `donation_date`, `items`

**`UpdateDonation`** (Request) - Schema baru:
- Semua field optional
- Jika `items` disediakan, akan mengganti semua items yang ada

### 2. Expense Schemas

#### Schema Baru Ditambahkan:

**`ExpenseItem`** - Schema untuk item pengeluaran individual:
```json
{
  "category_id": "uuid",
  "amount": 30000,
  "description": "Tagihan listrik"
}
```

**`ExpenseItemResponse`** - Schema response untuk item pengeluaran:
```json
{
  "id": "uuid",
  "expense_id": "uuid",
  "category_id": "uuid",
  "category_name": "Utilitas",
  "amount": 30000,
  "description": "Tagihan listrik",
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T10:00:00Z"
}
```

#### Schema yang Diperbarui:

**`Expense`** (Response):
- ❌ Removed: `category_id`, `category_name`, `amount`
- ✅ Added: `total_amount` (sum of all items), `items` (array of ExpenseItemResponse)

**`CreateExpense`** (Request):
- ❌ Removed: `category_id`, `amount` dari required fields
- ✅ Added: `items` array (required, minimum 1 item)
- Required fields sekarang: `pocket_id`, `description`, `expense_date`, `items`

**`UpdateExpense`** (Request) - Schema baru:
- Semua field optional
- Jika `items` disediakan, akan mengganti semua items yang ada

**`ApproveExpense`** (Request) - Schema baru:
- Untuk endpoint approve/reject expense
- Field: `status` (enum: 'approved' atau 'rejected')

---

## Contoh Request/Response Baru

### Create Donation

**Request:**
```json
POST /api/v1/donations
{
  "pocket_id": "pocket-uuid",
  "donor_name": "Ahmad",
  "is_anonymous": false,
  "payment_method": "cash",
  "donation_date": "2026-01-18",
  "items": [
    {
      "category_id": "zakat-uuid",
      "amount": 50000,
      "description": "Zakat Fitrah"
    },
    {
      "category_id": "infaq-uuid",
      "amount": 25000,
      "description": "Infaq Masjid"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "donation-uuid",
    "pocket_id": "pocket-uuid",
    "pocket_name": "Kas Masjid",
    "donor_name": "Ahmad",
    "is_anonymous": false,
    "payment_method": "cash",
    "donation_date": "2026-01-18",
    "total_amount": 75000,
    "items": [
      {
        "id": "item-uuid-1",
        "donation_id": "donation-uuid",
        "category_id": "zakat-uuid",
        "category_name": "Zakat",
        "amount": 50000,
        "description": "Zakat Fitrah",
        "created_at": "2026-01-18T10:00:00Z",
        "updated_at": "2026-01-18T10:00:00Z"
      },
      {
        "id": "item-uuid-2",
        "donation_id": "donation-uuid",
        "category_id": "infaq-uuid",
        "category_name": "Infaq",
        "amount": 25000,
        "description": "Infaq Masjid",
        "created_at": "2026-01-18T10:00:00Z",
        "updated_at": "2026-01-18T10:00:00Z"
      }
    ],
    "recorded_by": "user-uuid",
    "created_at": "2026-01-18T10:00:00Z",
    "updated_at": "2026-01-18T10:00:00Z"
  }
}
```

### Create Expense

**Request:**
```json
POST /api/v1/expenses
{
  "pocket_id": "pocket-uuid",
  "description": "Biaya operasional bulanan",
  "expense_date": "2026-01-18",
  "items": [
    {
      "category_id": "utilities-uuid",
      "amount": 30000,
      "description": "Tagihan listrik"
    },
    {
      "category_id": "supplies-uuid",
      "amount": 20000,
      "description": "Alat tulis"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "expense-uuid",
    "pocket_id": "pocket-uuid",
    "pocket_name": "Kas Masjid",
    "description": "Biaya operasional bulanan",
    "expense_date": "2026-01-18",
    "status": "pending",
    "total_amount": 50000,
    "items": [
      {
        "id": "item-uuid-1",
        "expense_id": "expense-uuid",
        "category_id": "utilities-uuid",
        "category_name": "Utilitas",
        "amount": 30000,
        "description": "Tagihan listrik",
        "created_at": "2026-01-18T10:00:00Z",
        "updated_at": "2026-01-18T10:00:00Z"
      },
      {
        "id": "item-uuid-2",
        "expense_id": "expense-uuid",
        "category_id": "supplies-uuid",
        "category_name": "Perlengkapan",
        "amount": 20000,
        "description": "Alat tulis",
        "created_at": "2026-01-18T10:00:00Z",
        "updated_at": "2026-01-18T10:00:00Z"
      }
    ],
    "approved_by": null,
    "recorded_by": "user-uuid",
    "notes": null,
    "created_at": "2026-01-18T10:00:00Z",
    "updated_at": "2026-01-18T10:00:00Z"
  }
}
```

### Update Donation/Expense

**Request untuk Update Items:**
```json
PUT /api/v1/donations/:id
{
  "items": [
    {
      "category_id": "new-category-uuid",
      "amount": 100000,
      "description": "Updated item"
    }
  ]
}
```

⚠️ **Catatan**: Jika field `items` disediakan, semua items yang ada akan dihapus dan diganti dengan items baru.

---

## Perubahan Validasi

### Donation
- **Required**: Minimal 1 item harus ada
- **Item Amount**: Harus > 0
- **Item Description**: Maksimal 500 karakter (optional)
- **Notes**: Maksimal 1000 karakter

### Expense
- **Required**: Minimal 1 item harus ada
- **Item Amount**: Harus > 0
- **Item Description**: Maksimal 500 karakter (optional)
- **Description**: Minimal 1 karakter, maksimal 1000 karakter
- **Notes**: Maksimal 1000 karakter

---

## Breaking Changes

⚠️ **Perhatian**: Ini adalah breaking changes!

### Request Format Lama (Tidak lagi didukung):
```json
{
  "pocket_id": "uuid",
  "category_id": "uuid",
  "amount": 100000
}
```

### Request Format Baru (Wajib):
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

## Mengakses Dokumentasi Swagger

Setelah server berjalan, dokumentasi Swagger dapat diakses di:

- **Development**: http://localhost:3000/api-docs
- **Production**: https://api.mosman.app/api-docs

Dokumentasi akan menampilkan semua schema yang telah diperbarui dengan contoh request/response yang sesuai.

---

## Files yang Dimodifikasi

- ✅ `src/config/swagger.ts` - Schema definitions updated
- ✅ `src/services/donationService.ts` - Removed unused userId parameter
- ✅ `src/services/expenseService.ts` - Removed unused userId parameter
- ✅ `src/controllers/donationController.ts` - Updated to match service signature
- ✅ `src/controllers/expenseController.ts` - Updated to match service signature

---

## Status

✅ **Swagger documentation updated**
✅ **TypeScript compilation successful**
✅ **Ready for use after database migration**

---

## Next Steps

1. Jalankan database migration (lihat `migrations/HOW_TO_RUN_MIGRATIONS.md`)
2. Restart server untuk melihat perubahan di Swagger UI
3. Test API endpoints dengan format baru
4. Update frontend/client applications untuk menggunakan format baru
