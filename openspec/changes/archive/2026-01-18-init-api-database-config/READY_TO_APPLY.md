# ✅ Ready to Apply Checklist

**Quick checklist sebelum run `openspec apply init-api-database-config`**

Print atau bookmark halaman ini dan centang satu per satu! 📋

---

## 1️⃣ Software Installed

```bash
# Run commands ini untuk verify:

node --version
# ✅ Expected: v18.0.0 atau lebih tinggi

npm --version
# ✅ Expected: v9.0.0 atau lebih tinggi

git --version
# ✅ Expected: git version 2.x.x atau lebih tinggi
```

- [ ] Node.js v18+ installed
- [ ] npm v9+ installed
- [ ] Git installed
- [ ] Code editor ready (VS Code recommended)

---

## 2️⃣ Supabase Account & Project

- [ ] Supabase account created di https://supabase.com
- [ ] Email verified (check inbox!)
- [ ] Supabase project created dengan nama "mosman" atau sejenisnya
- [ ] Project status **"Active"** (icon ✅ hijau)
- [ ] Region dipilih: Southeast Asia (Singapore) atau terdekat

---

## 3️⃣ Supabase Credentials Ready

Buka Supabase Dashboard → Settings (⚙️) → API

- [ ] **SUPABASE_URL** sudah dicopy
  ```
  Format: https://xxxxxxxxxxxxx.supabase.co
  Lokasi: Configuration > URL
  ```

- [ ] **SUPABASE_ANON_KEY** sudah dicopy
  ```
  Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Lokasi: Project API keys > anon public
  ```

- [ ] **SUPABASE_SERVICE_ROLE_KEY** sudah dicopy
  ```
  Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Lokasi: Project API keys > service_role (klik "Reveal")
  ⚠️  RAHASIA - Jangan share!
  ```

- [ ] Credentials disimpan di tempat aman (password manager atau secure notes)

---

## 4️⃣ Working Directory Ready

```bash
# Pastikan Anda di root project mosman
pwd
# Expected: /Users/[username]/Research/mosman atau path project Anda

# Check struktur folder
ls -la
# Expected output harus include:
# - openspec/
# - CLAUDE.md atau AGENTS.md
```

- [ ] Terminal dibuka di working directory yang benar
- [ ] Folder `openspec/` exists
- [ ] Proposal `init-api-database-config` validated (lihat output sebelumnya)

---

## 5️⃣ Git Status Clean (Recommended)

```bash
# Check git status
git status

# Jika ada uncommitted changes, commit dulu:
git add .
git commit -m "chore: prepare for api and database setup"
```

- [ ] No uncommitted changes (atau sudah di-commit)
- [ ] Working directory clean

**Kenapa?** Supaya mudah rollback jika ada masalah saat apply.

---

## 6️⃣ Credentials Template Ready

Siapkan file ini (akan digunakan di Task 1.2):

**Create:** `server/.env.example` (nanti saat apply, atau siapkan sekarang)

```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

- [ ] Template credentials siap untuk di-copy paste

---

## 7️⃣ Optional but Recommended

- [ ] Supabase CLI installed
  ```bash
  npm install -g supabase
  # atau
  brew install supabase/tap/supabase

  # Verify:
  supabase --version
  ```

- [ ] TypeScript extension installed di VS Code
- [ ] ESLint extension installed di VS Code

---

## 🎯 Final Check

### ✅ ALL READY?

Jika SEMUA checklist sudah ✅, Anda siap untuk:

```bash
openspec apply init-api-database-config
```

### ⚠️ NOT READY?

Jika ada yang belum ✅:

1. **Software belum installed?**
   → Baca: `PREREQUISITES.md`

2. **Supabase belum setup?**
   → Baca: `SUPABASE_SETUP.md` (step-by-step guide)

3. **Credentials belum dicopy?**
   → Buka Supabase Dashboard → Settings → API

4. **Masih bingung?**
   → Tanyakan sebelum apply!

---

## 📝 During Apply - What to Expect

Setelah run `openspec apply`, akan terjadi:

1. **Phase 1: Project Setup (5-10 menit)**
   - Create folder structure
   - Install dependencies (~50 packages)
   - Setup TypeScript config

2. **Phase 2: Core Server (10 menit)**
   - Setup Express server
   - Create middleware
   - Setup error handling

3. **Phase 3: Authentication (10 menit)**
   - Setup auth middleware
   - Role-based authorization

4. **Phase 4: Database Schema (15 menit)**
   - Create migrations
   - Run migrations di Supabase
   - Generate TypeScript types
   - Setup RLS policies
   - Seed data

5. **Phase 5-8: API Endpoints (20-30 menit)**
   - Health check
   - Pockets endpoints
   - Donations endpoints
   - Expenses endpoints
   - Categories endpoints

6. **Phase 9: Documentation (5 menit)**
   - API docs
   - Testing guide
   - Setup guide

**Total waktu estimasi:** ~60-90 menit (tergantung koneksi internet untuk npm install)

---

## 🚨 Common Issues & Quick Fix

### Issue: npm install gagal
```bash
# Clear cache dan retry
npm cache clean --force
npm install
```

### Issue: Supabase migration gagal
```bash
# Check credentials di .env
cat server/.env

# Test connection
curl https://your-project.supabase.co/rest/v1/
```

### Issue: TypeScript compilation error
```bash
# Check tsconfig.json
cat server/tsconfig.json

# Run type check
cd server && npm run type-check
```

### Issue: Port 3000 already in use
```bash
# Change PORT di .env
PORT=3001

# Atau kill process di port 3000
lsof -ti:3000 | xargs kill -9
```

---

## 📞 Support

Jika ada error atau masalah saat apply:

1. **STOP** jangan lanjut
2. **COPY** error message
3. **SCREENSHOT** jika perlu
4. **TANYA** dengan detail:
   - Di phase/task berapa stuck?
   - Apa error message lengkapnya?
   - Apa yang sudah dicoba?

---

## 🎉 After Successful Apply

Setelah apply berhasil, Anda akan punya:

```
mosman/
├── server/               ✅ Created
│   ├── src/             ✅ Full TypeScript code
│   ├── migrations/      ✅ Database migrations
│   ├── seeds/           ✅ Seed data
│   ├── .env             ✅ With your credentials
│   ├── tsconfig.json    ✅ TypeScript config
│   └── package.json     ✅ Dependencies installed
└── openspec/
    └── changes/
        └── init-api-database-config/
            └── status: ✅ APPLIED
```

Test the server:
```bash
cd server
npm run dev

# Should see:
# Server running on port 3000
# Health check: http://localhost:3000/api/health
```

---

**Ready? Let's go! 🚀**

```bash
openspec apply init-api-database-config
```
