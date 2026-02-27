import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendOTP } from '@/lib/mail'
const getIP = (req: NextRequest) => req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
export async function POST(req: NextRequest) {
  const ip = getIP(req)
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
    const user = await query('SELECT id,username FROM users WHERE email=$1', [email])
    const recent = await query(`SELECT COUNT(*) cnt FROM otp_resets WHERE email=$1 AND created_at > NOW()-INTERVAL '15 minutes'`, [email])
    if (parseInt(recent.rows[0].cnt) >= 3) return NextResponse.json({ error: 'Terlalu banyak permintaan. Tunggu 15 menit.' }, { status: 429 })
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const exp = new Date(Date.now() + 5 * 60 * 1000)
    await query('INSERT INTO otp_resets (email,otp_code,expired_at,ip_address) VALUES ($1,$2,$3,$4)', [email, otp, exp, ip])
    if (user.rows.length) await sendOTP(email, otp, user.rows[0].username)
    return NextResponse.json({ success: true, message: 'Kode OTP dikirim ke email kamu' })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Gagal kirim OTP' }, { status: 500 }) }
}
