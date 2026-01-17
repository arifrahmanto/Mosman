# Prerequisites - Sebelum Apply Proposal

**PENTING:** Dokumen ini berisi semua yang HARUS disiapkan SEBELUM Anda apply proposal `init-api-database-config`.

## ✅ Checklist Prerequisites

### 1. Software Requirements

- [ ] **Node.js** (v18 atau lebih tinggi)
  ```bash
  node --version  # Harus v18.0.0 atau lebih tinggi
  ```
  Download: https://nodejs.org/

- [ ] **npm** atau **yarn** package manager
  ```bash
  npm --version   # Harus v9.0.0 atau lebih tinggi
  ```

- [ ] **Git** untuk version control
  ```bash
  git --version
  ```

- [ ] **Code Editor** (Disarankan: VS Code dengan TypeScript extension)

### 2. Supabase Account dan Project

#### 2.1. Buat Supabase Account (GRATIS)

1. Kunjungi https://supabase.com/
2. Klik "Start your project" atau "Sign Up"
3. Daftar menggunakan email atau GitHub account
4. Verifikasi email Anda

#### 2.2. Buat Supabase Project Baru

1. Login ke Supabase Dashboard: https://app.supabase.com/
2. Klik "New Project"
3. Pilih Organization (atau buat baru)
4. Isi detail project:
   - **Name**: `mosman` atau `masjid-finance`
   - **Database Password**: Buat password yang kuat (SIMPAN password ini!)
   - **Region**: Pilih yang terdekat (e.g., `Southeast Asia (Singapore)`)
   - **Pricing Plan**: Pilih "Free" untuk development
5. Klik "Create new project"
6. Tunggu ~2 menit sampai project siap

#### 2.3. Dapatkan Credentials Supabase

Setelah project siap, ambil credentials berikut:

1. Di Supabase Dashboard, buka project Anda
2. Klik **Settings** (icon gear di sidebar kiri)
3. Klik **API** di menu Settings

**Ambil 3 credentials ini:**

```
┌─────────────────────────────────────────────────────────┐
│ Project URL                                             │
├─────────────────────────────────────────────────────────┤
│ https://xxxxxxxxxxxxx.supabase.co                       │
│                                                         │
│ ► Salin ini untuk SUPABASE_URL                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Project API keys                                        │
├─────────────────────────────────────────────────────────┤
│ anon public                                             │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXB... │
│                                                         │
│ ► Salin ini untuk SUPABASE_ANON_KEY                    │
├─────────────────────────────────────────────────────────┤
│ service_role secret                                     │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXB... │
│                                                         │
│ ► Salin ini untuk SUPABASE_SERVICE_ROLE_KEY            │
│ ⚠️  RAHASIA! Jangan share atau commit ke Git!         │
└─────────────────────────────────────────────────────────┘
```

**PENTING:**
- ✅ `anon public` key AMAN untuk frontend
- ⚠️ `service_role` key RAHASIA - hanya untuk backend server
- ❌ JANGAN commit service_role key ke Git!

### 3. Install Supabase CLI (Opsional tapi Disarankan)

```bash
# macOS/Linux
npm install -g supabase

# Atau dengan Homebrew (macOS)
brew install supabase/tap/supabase

# Verifikasi instalasi
supabase --version
```

**Kegunaan:** Untuk generate TypeScript types dari database schema

### 4. Persiapan Environment Variables

Siapkan credentials dalam format ini (akan digunakan saat implementasi):

```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

**SIMPAN template ini** - Anda akan membutuhkannya saat Task 1.2 (Environment Configuration Setup)

## 📝 Yang TIDAK Perlu Dilakukan Sekarang

❌ **JANGAN buat database tables** - Ini akan dilakukan via migrations di Task 4.1
❌ **JANGAN install npm packages** - Ini akan dilakukan di Task 1.1
❌ **JANGAN buat folder structure** - Ini akan dilakukan di Task 1.1
❌ **JANGAN setup TypeScript config** - Ini akan dilakukan di Task 1.1

## ✅ Verifikasi Prerequisites

Sebelum apply proposal, pastikan Anda punya:

```bash
# 1. Check Node.js version
node --version
# Output: v18.x.x atau lebih tinggi ✅

# 2. Check npm version
npm --version
# Output: v9.x.x atau lebih tinggi ✅

# 3. Check Git
git --version
# Output: git version x.x.x ✅
```

Dan sudah punya:
- ✅ Supabase Account
- ✅ Supabase Project yang sudah siap
- ✅ SUPABASE_URL (dari Project Settings > API)
- ✅ SUPABASE_ANON_KEY (dari Project Settings > API)
- ✅ SUPABASE_SERVICE_ROLE_KEY (dari Project Settings > API)

## 🎯 Ready to Apply?

Jika semua checklist sudah ✅, Anda siap untuk:

```bash
openspec apply init-api-database-config
```

Proses apply akan:
1. Membuat folder structure (`server/`, `server/src/`, dll)
2. Install dependencies (TypeScript, Express, Supabase client, dll)
3. Setup TypeScript configuration
4. Membuat database migrations
5. Generate TypeScript types dari Supabase
6. Implement authentication, API endpoints, dll.

## ❓ FAQ

### Q: Apakah Supabase gratis?
**A:** Ya! Supabase memiliki Free tier yang cukup untuk development dan aplikasi kecil. Limits:
- Database: 500 MB
- Bandwidth: 5 GB
- Row Level Security enabled
- Cukup untuk aplikasi masjid

### Q: Apakah harus install Supabase CLI?
**A:** Tidak wajib, tapi SANGAT disarankan untuk:
- Generate TypeScript types otomatis dari database schema
- Run migrations locally
- Better development experience

### Q: Database password Supabase untuk apa?
**A:** Password database biasanya tidak digunakan langsung di aplikasi. Kita akan menggunakan API keys (SUPABASE_ANON_KEY dan SUPABASE_SERVICE_ROLE_KEY) untuk koneksi.

### Q: Bagaimana jika saya lupa SUPABASE_SERVICE_ROLE_KEY?
**A:** Bisa di-reset di Supabase Dashboard > Settings > API > Service Role Secret > Reset. **HATI-HATI:** Mereset akan invalidate key lama.

### Q: Region mana yang harus dipilih?
**A:** Pilih yang terdekat dengan lokasi user Anda:
- Indonesia → Singapore (Southeast Asia)
- Malaysia → Singapore (Southeast Asia)
- Untuk performa terbaik

## 📞 Butuh Bantuan?

Jika ada masalah dengan setup Supabase atau prerequisites lainnya, tanyakan sebelum apply proposal!
