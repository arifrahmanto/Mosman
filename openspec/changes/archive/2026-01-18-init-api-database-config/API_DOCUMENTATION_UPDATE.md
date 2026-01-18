# API Documentation Update - Swagger/OpenAPI Implementation

**Date**: 2026-01-18
**Change ID**: init-api-database-config
**Update Type**: Enhancement - Complete API Documentation

## Overview

Menambahkan dokumentasi API lengkap menggunakan Swagger UI dan OpenAPI 3.0 specification untuk semua endpoint yang ada di Mosman API.

## What Was Added

### 1. Dependencies Installed
```json
{
  "dependencies": {
    "swagger-ui-express": "^5.x",
    "swagger-jsdoc": "^6.x"
  },
  "devDependencies": {
    "@types/swagger-ui-express": "^4.x",
    "@types/swagger-jsdoc": "^4.x"
  }
}
```

### 2. New Files Created

#### `src/config/swagger.ts`
OpenAPI 3.0 specification configuration dengan:
- **Server definitions**: Development dan Production URLs
- **Security schemes**: Bearer JWT authentication
- **Schemas**: Semua data models (Donation, Expense, Pocket, Category, dll)
- **Reusable components**:
  - Responses (UnauthorizedError, ForbiddenError, NotFoundError, ValidationError)
  - Parameters (page, pageSize, pocketId, categoryId, startDate, endDate, idParam)
- **Tags**: Grouping endpoints (Health, Donations, Expenses, Pockets, Categories)

#### `SWAGGER_DOCUMENTATION.md`
Panduan lengkap penggunaan Swagger UI:
- Cara mengakses dokumentasi interaktif
- Tutorial step-by-step
- Cara mendapatkan JWT token
- Cara menggunakan "Try it out" feature
- Troubleshooting guide
- Best practices

### 3. Modified Files

#### `src/routes/index.ts`
- Added Swagger UI middleware
- Mounted at `/api/docs`
- Custom configuration (site title, hidden topbar)

#### All Route Files (Complete OpenAPI Annotations)

**`src/routes/health.ts`**:
- ✅ `GET /health` - Health check dengan database status

**`src/routes/donations.ts`** (5 endpoints):
- ✅ `GET /v1/donations` - List donations dengan filters
- ✅ `GET /v1/donations/{id}` - Get donation by ID
- ✅ `POST /v1/donations` - Create donation
- ✅ `PUT /v1/donations/{id}` - Update donation
- ✅ `DELETE /v1/donations/{id}` - Delete donation

**`src/routes/expenses.ts`** (6 endpoints):
- ✅ `GET /v1/expenses` - List expenses dengan filters
- ✅ `GET /v1/expenses/{id}` - Get expense by ID
- ✅ `POST /v1/expenses` - Create expense
- ✅ `PUT /v1/expenses/{id}` - Update expense
- ✅ `PUT /v1/expenses/{id}/approve` - Approve/reject expense
- ✅ `DELETE /v1/expenses/{id}` - Delete expense

**`src/routes/pockets.ts`** (5 endpoints):
- ✅ `GET /v1/pockets` - List all pockets
- ✅ `GET /v1/pockets/{id}` - Get pocket details
- ✅ `GET /v1/pockets/{id}/summary` - Get pocket financial summary
- ✅ `GET /v1/pockets/{pocketId}/donations` - List donations by pocket
- ✅ `GET /v1/pockets/{pocketId}/expenses` - List expenses by pocket

**`src/routes/categories.ts`** (2 endpoints):
- ✅ `GET /v1/categories/donations` - List donation categories
- ✅ `GET /v1/categories/expenses` - List expense categories

**Total**: **19 endpoints** fully documented

#### `README.md`
- Added Swagger to Features list
- Added "API Documentation" section dengan quick start guide
- Updated endpoints list dengan `/api/docs`

## Features Provided

### 📖 Interactive Documentation
- Browse semua endpoint dalam satu tempat
- Clear descriptions untuk setiap endpoint
- Request/response schemas yang lengkap
- Parameter descriptions
- HTTP status codes dan error responses

### 🧪 Built-in Testing
- "Try it out" feature untuk setiap endpoint
- Test API calls langsung dari browser
- Real request/response examples
- Tidak perlu tools external (Postman, Insomnia, dll)

### 🔐 Authentication Support
- Built-in authentication interface
- Click "Authorize" untuk add Bearer token
- Token persists across all requests
- Easy switching antara different users

### 📝 Request Examples
- Pre-filled example values untuk all fields
- Valid UUIDs untuk pocket_id dan category_id (dari seed data)
- Proper date formats (YYYY-MM-DD)
- Realistic sample data dalam Bahasa Indonesia

### 📋 Complete Schemas
Semua data models ter-dokumentasi lengkap:
- **Donation**: pocket_id, category_id, donor_name, amount, payment_method, dll
- **Expense**: pocket_id, category_id, description, amount, status, dll
- **Pocket**: name, description, current_balance, dll
- **PocketSummary**: total_donations, total_expenses, balance, counts
- **Category**: name, description, is_active

## How to Access

### Development
```bash
npm run dev
```
Navigate to: **http://localhost:3000/api/docs**

### Production
```bash
npm run build
npm start
```
Navigate to: **https://your-domain.com/api/docs**

## Usage Example

### 1. Authenticate
1. Open http://localhost:3000/api/docs
2. Click **"Authorize"** button (🔓 lock icon)
3. Enter JWT token: `your-supabase-jwt-token`
4. Click "Authorize" then "Close"

### 2. Test Create Donation
1. Expand **POST /v1/donations**
2. Click **"Try it out"**
3. See pre-filled example:
```json
{
  "pocket_id": "11111111-1111-1111-1111-111111111111",
  "category_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "donor_name": "Ahmad Yusuf",
  "amount": 500000,
  "is_anonymous": false,
  "payment_method": "transfer",
  "donation_date": "2026-01-18",
  "notes": "Infaq Jumat"
}
```
4. Click **"Execute"**
5. See response with status 201 Created

### 3. View Pocket Summary
1. Expand **GET /v1/pockets/{id}/summary**
2. Click **"Try it out"**
3. Enter pocket ID: `11111111-1111-1111-1111-111111111111`
4. Click **"Execute"**
5. See financial summary dengan total donations, expenses, balance

## Benefits

### For Backend Developers
- ✅ Faster development - test endpoints tanpa Postman
- ✅ Clear contracts - lihat exact data structures
- ✅ Easy debugging - full request/response inspection
- ✅ Documentation always up-to-date (lives with code)

### For Frontend Developers
- ✅ API discovery - browse all available endpoints
- ✅ Type information - tahu exact data structures
- ✅ Test integration - verify endpoints sebelum coding
- ✅ Understanding auth flow - lihat how authentication works

### For Team Collaboration
- ✅ Self-service - explore dan test API independently
- ✅ Examples - lihat working examples for every endpoint
- ✅ Error handling - understand error codes and responses
- ✅ Onboarding - new team members can explore easily

## Technical Implementation

### OpenAPI Annotations
Menggunakan JSDoc comments dengan `@openapi` tag:

```typescript
/**
 * @openapi
 * /v1/donations:
 *   post:
 *     summary: Create Donation
 *     description: Create a new donation record
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDonation'
 *     responses:
 *       201:
 *         description: Donation created successfully
 */
```

### Swagger Configuration
```typescript
{
  openapi: '3.0.0',
  info: {
    title: 'Mosman API',
    version: '1.0.0',
    description: 'REST API for Mosque Financial Management System'
  },
  servers: [
    { url: 'http://localhost:3000/api', description: 'Development' },
    { url: 'https://api.mosman.app/api', description: 'Production' }
  ]
}
```

## Validation

✅ **TypeScript Compilation**: PASSING (npm run type-check)
✅ **Server Startup**: WORKING
✅ **Swagger UI Accessible**: http://localhost:3000/api/docs
✅ **All Endpoints Documented**: 19/19 endpoints
✅ **Examples Working**: Valid UUIDs from seed data
✅ **Authentication Flow**: Bearer token support

## Documentation Files

1. **SWAGGER_DOCUMENTATION.md** - Complete user guide
2. **README.md** - Updated dengan Swagger info
3. **API_DOCUMENTATION_UPDATE.md** - This file (proposal update)

## Maintenance

### Adding New Endpoints
Untuk menambah dokumentasi endpoint baru:

1. Add OpenAPI annotation di route file:
```typescript
/**
 * @openapi
 * /v1/your-endpoint:
 *   get:
 *     summary: Your endpoint summary
 *     tags: [YourTag]
 *     ...
 */
router.get('/your-endpoint', controller.method);
```

2. Restart server untuk reload annotations

### Updating Schemas
Edit `src/config/swagger.ts` di section `components.schemas`

### Adding New Tags
Edit `src/config/swagger.ts` di section `tags`

## Production Considerations

### Option 1: Keep Swagger in Production
```typescript
// No changes needed - accessible at /api/docs
```

### Option 2: Development Only
```typescript
if (env.NODE_ENV === 'development') {
  router.use('/docs', swaggerUi.serve);
  router.get('/docs', swaggerUi.setup(swaggerSpec));
}
```

### Option 3: Protected Swagger
```typescript
router.use('/docs', authenticate, swaggerUi.serve);
router.get('/docs', authenticate, swaggerUi.setup(swaggerSpec));
```

## Migration Impact

✅ **No Breaking Changes**: Semua existing endpoints tetap sama
✅ **Backward Compatible**: API behavior tidak berubah
✅ **New Endpoint**: `/api/docs` untuk documentation only
✅ **Dependencies**: 4 new packages (swagger-ui-express, swagger-jsdoc + types)

## Testing Checklist

- [x] Server starts successfully dengan Swagger
- [x] Swagger UI accessible at /api/docs
- [x] All 19 endpoints appear in documentation
- [x] Request examples are valid
- [x] Authorization button works
- [x] "Try it out" executes requests correctly
- [x] Error responses documented correctly
- [x] TypeScript compiles without errors
- [x] No runtime errors

## Summary

Implementasi Swagger/OpenAPI documentation memberikan:
- **Professional-grade** interactive API documentation
- **Developer-friendly** testing interface
- **Self-documenting** API dengan examples
- **Better collaboration** between frontend & backend teams
- **Faster onboarding** untuk new team members

Total **19 endpoints** sekarang fully documented dengan interactive testing capability!

## Next Steps

1. ✅ Start server: `npm run dev`
2. ✅ Open browser: http://localhost:3000/api/docs
3. ✅ Explore interactive documentation
4. ✅ Test endpoints dengan "Try it out"
5. ✅ Share docs URL dengan team!
