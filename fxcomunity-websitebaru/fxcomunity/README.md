# 📚 FX Comunity — WebsiteBaru (Full Stack)

Clone lengkap dari WebsiteBaru dengan sistem auth database penuh.

## Tech Stack
- Next.js 14 App Router + TypeScript
- PostgreSQL (Neon/Supabase)
- bcryptjs + JWT cookies
- Nodemailer (Gmail OTP)

## Setup

```bash
npm install
cp .env.example .env.local
# Isi semua ENV variables
npm run dev
```

## ENV Variables
```
DATABASE_URL=postgresql://...
JWT_SECRET=secret-panjang-min-32-karakter
GMAIL_USER=email@gmail.com
GMAIL_PASS=app-password-gmail
NEXT_PUBLIC_BASE_URL=https://domain-kamu.vercel.app
```

## Init Database (jalankan 1x setelah deploy)
```
GET /api/init
```
Ini akan:
- Buat semua tabel (users, pdfs, otp_resets, dll)
- Seed 38 PDF data
- Buat akun owner default: owner@fxcomunity.com / owner123

## Halaman
- `/login` - Login
- `/register` - Daftar akun
- `/forgot-password` - Minta OTP
- `/reset-password` - Reset password dengan OTP
- `/library` - Halaman utama (butuh login)
- `/admin` - Admin panel (Owner/Admin only)

## Deploy ke Vercel
1. Push ke GitHub
2. Import repo di Vercel
3. Set semua ENV variables
4. Deploy
5. Buka `https://domain.vercel.app/api/init`
