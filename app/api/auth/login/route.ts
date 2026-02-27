import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken } from '@/lib/auth'

const getIP = (req: NextRequest) => req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'

export async function POST(req: NextRequest) {
  const ip = getIP(req)
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 })
    const r = await query('SELECT * FROM users WHERE email=$1', [email])
    const user = r.rows[0]
    if (!user) {
      await query(`INSERT INTO login_logs (email,ip_address,status,keterangan) VALUES ($1,$2,'Failed','User tidak ditemukan')`, [email, ip])
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }
    if (user.status === 'Tidak Aktif') {
      await query(`INSERT INTO login_logs (user_id,email,ip_address,status,keterangan) VALUES ($1,$2,$3,'Failed','Akun nonaktif')`, [user.id, email, ip])
      return NextResponse.json({ error: 'Akun kamu dinonaktifkan. Hubungi admin.' }, { status: 403 })
    }
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      await query(`INSERT INTO login_logs (user_id,email,ip_address,status,keterangan) VALUES ($1,$2,$3,'Failed','Password salah')`, [user.id, email, ip])
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }
    const token = signToken({ id: user.id, username: user.username, email: user.email, role: user.role })
    await query(`INSERT INTO login_logs (user_id,email,ip_address,status,keterangan) VALUES ($1,$2,$3,'Success','Login berhasil')`, [user.id, email, ip])
    const res = NextResponse.json({ success: true, data: { id: user.id, username: user.username, email: user.email, role: user.role } })
    res.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })
    return res
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
