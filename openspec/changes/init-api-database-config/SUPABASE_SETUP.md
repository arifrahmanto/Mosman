# Panduan Setup Supabase - Step by Step

Panduan praktis untuk setup Supabase project untuk aplikasi Mosman (Mosque Financial Management).

## 🎯 Goal

Mendapatkan 3 credentials penting:
1. `SUPABASE_URL`
2. `SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`

## 📋 Step-by-Step Guide

### Step 1: Buat Supabase Account (5 menit)

1. Buka browser, kunjungi: **https://supabase.com/**

2. Klik tombol **"Start your project"** atau **"Sign Up"**

3. Pilih metode signup:
   - Dengan GitHub (disarankan - lebih cepat)
   - Dengan Email

4. Jika dengan Email:
   - Masukkan email dan password
   - Cek inbox email untuk verifikasi
   - Klik link verifikasi

5. Login ke Supabase Dashboard

✅ **Checkpoint:** Anda sekarang di https://app.supabase.com/

---

### Step 2: Buat Organization (Opsional)

Jika ini pertama kali:

1. Anda akan diminta buat Organization
2. Isi **Organization name**: `Masjid` atau `MyOrg`
3. Pilih **Plan**: Free
4. Klik **Create Organization**

✅ **Checkpoint:** Anda sekarang melihat halaman "Create a new project"

---

### Step 3: Buat Project Baru (2 menit)

1. Klik tombol **"New Project"** (jika belum ada)

2. Isi form:
   ```
   Name:              mosman
   Database Password: [Buat password kuat, SIMPAN di tempat aman!]
   Region:            Southeast Asia (Singapore)
   Pricing Plan:      Free
   ```

   **Contoh Database Password yang kuat:**
   ```
   M0sm@n2024!Secure
   ```
   ⚠️ **PENTING:** Simpan password ini di password manager atau catatan aman!

3. Klik **"Create new project"**

4. Tunggu ~1-2 menit (ada progress bar)

✅ **Checkpoint:** Project status berubah jadi "Active" dengan icon ✅ hijau

---

### Step 4: Dapatkan API Credentials (1 menit)

Ini bagian PALING PENTING! 🔑

1. Di sidebar kiri, klik icon **⚙️ Settings**

2. Di menu Settings, klik **API**

3. Anda akan lihat section **"Project API keys"**

#### Copy 3 Values Ini:

**A. Project URL**
```
Lokasi: Section "Configuration" > "URL"
Contoh: https://abcdefghijklmnop.supabase.co

➜ SIMPAN sebagai SUPABASE_URL
```

**B. anon public Key**
```
Lokasi: Section "Project API keys" > "anon public"
Tampilan: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...

➜ Klik icon 📋 untuk copy
➜ SIMPAN sebagai SUPABASE_ANON_KEY
```

**C. service_role secret Key**
```
Lokasi: Section "Project API keys" > "service_role" > Klik "Reveal"
Tampilan: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...

⚠️  PENTING: Klik tombol "Reveal" dulu untuk melihat key
➜ Klik icon 📋 untuk copy
➜ SIMPAN sebagai SUPABASE_SERVICE_ROLE_KEY

🔴 RAHASIA! Jangan share atau commit ke Git!
```

---

### Step 5: Simpan Credentials (PENTING!)

Buat file temporary untuk simpan credentials (JANGAN commit ke Git):

**Buat file:** `mosman-credentials.txt` atau simpan di password manager

```env
# Mosman Supabase Credentials
# Created: 2026-01-17
# Project: mosman

SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwNjI5ODAwMCwiZXhwIjoyMDIxODc0MDAwfQ.xxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzA2Mjk4MDAwLCJleHAiOjIwMjE4NzQwMDB9.yyyyyyyyyyyyyyyyyyyy

# Database Password (untuk referensi)
DB_PASSWORD=M0sm@n2024!Secure
```

**Simpan file ini di:**
- ✅ Password manager (1Password, Bitwarden, LastPass)
- ✅ Secure notes (Apple Notes dengan password, Google Keep)
- ✅ Encrypted file di komputer lokal
- ❌ JANGAN commit ke Git repository!

---

### Step 6: Verifikasi Credentials (1 menit)

Test apakah credentials benar:

1. Buka browser
2. Kunjungi: `https://[your-project-ref].supabase.co/rest/v1/`

   Ganti `[your-project-ref]` dengan bagian sebelum `.supabase.co` dari SUPABASE_URL Anda

   Contoh: https://abcdefghijklmnop.supabase.co/rest/v1/

3. Anda akan lihat error "JWT expired" atau "Missing API key" - **INI NORMAL!** ✅

4. Jika URL tidak bisa diakses sama sekali → Check SUPABASE_URL Anda

✅ **Checkpoint:** Credentials sudah tersimpan dengan aman

---

## 🎉 Selesai!

Anda sudah berhasil setup Supabase! Sekarang Anda punya:

- ✅ Supabase Account
- ✅ Supabase Project "mosman" yang active
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY

## 🚀 Next Steps

1. **SIMPAN credentials dengan aman**
2. Lanjut ke **apply proposal:**
   ```bash
   openspec apply init-api-database-config
   ```
3. Saat Task 1.2 (Environment Configuration), gunakan credentials ini

---

## 📸 Visual Reference

### Tampilan Supabase Dashboard - API Settings

```
┌────────────────────────────────────────────────────────────┐
│ Settings > API                                             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Configuration                                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ URL                                                  │  │
│ │ https://abcdefghijklmnop.supabase.co         [Copy] │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ Project API keys                                           │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ anon public                                          │  │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...     [Copy] │  │
│ │                                                      │  │
│ │ service_role secret                     [Reveal]    │  │
│ │ ••••••••••••••••••••••••••••••••••••••              │  │
│ └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

Klik **[Reveal]** untuk melihat service_role key!

---

## ❓ Troubleshooting

### Problem: Tidak bisa create project
**Solution:**
- Pastikan email sudah diverifikasi
- Coba logout dan login lagi
- Clear browser cache
- Coba browser berbeda (Chrome/Firefox)

### Problem: Project creation stuck/gagal
**Solution:**
- Tunggu 5 menit dan refresh halaman
- Jika masih stuck, delete project dan buat baru
- Pastikan koneksi internet stabil

### Problem: Lupa Database Password
**Solution:**
- Database password jarang digunakan di development
- Untuk reset: Settings > Database > Reset Database Password
- **HATI-HATI:** Reset akan disconnect semua koneksi aktif

### Problem: Service role key tidak muncul
**Solution:**
- Klik tombol "Reveal" dulu
- Jika masih tidak muncul, klik "Reset" untuk generate baru
- Copy immediately setelah reset

### Problem: SUPABASE_URL tidak bisa diakses
**Solution:**
- Pastikan project status "Active" (hijau)
- Tunggu 1-2 menit setelah project creation
- Check tidak ada typo di URL

---

## 🔒 Security Best Practices

1. **JANGAN** share `service_role` key dengan siapa pun
2. **JANGAN** commit credentials ke Git
3. **GUNAKAN** `.env` file dengan `.gitignore`
4. **ROTATE** keys secara berkala (setiap 3-6 bulan)
5. **ENABLE** Row Level Security (RLS) di semua tables

---

## 📞 Butuh Bantuan?

Jika stuck di step manapun, tanyakan dengan menyertakan:
- Screenshot error (sensor credentials!)
- Step mana yang bermasalah
- Pesan error yang muncul
