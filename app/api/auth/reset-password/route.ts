import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
export async function POST(req: NextRequest) {
  try {
    const { email, otp, password } = await req.json()
    if (!email || !otp || !password) return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    const r = await query('SELECT * FROM otp_resets WHERE email=$1 AND otp_code=$2 AND is_used=false ORDER BY created_at DESC LIMIT 1', [email, otp])
    if (!r.rows.length) return NextResponse.json({ error: 'Kode OTP tidak valid' }, { status: 400 })
    const rec = r.rows[0]
    if (rec.attempt >= 5) return NextResponse.json({ error: 'Terlalu banyak percobaan. Minta OTP baru.' }, { status: 400 })
    if (new Date() > new Date(rec.expired_at)) {
      await query('UPDATE otp_resets SET attempt=attempt+1 WHERE id=$1', [rec.id])
      return NextResponse.json({ error: 'OTP sudah kadaluarsa. Minta kode baru.' }, { status: 400 })
    }
    const hashed = await bcrypt.hash(password, 12)
    await query('UPDATE users SET password=$1 WHERE email=$2', [hashed, email])
    await query('UPDATE otp_resets SET is_used=true WHERE id=$1', [rec.id])
    return NextResponse.json({ success: true, message: 'Password berhasil direset! Silakan login.' })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
