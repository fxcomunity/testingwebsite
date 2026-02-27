import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json()
    if (!username||!email||!password) return NextResponse.json({ error:'Semua field wajib diisi' }, { status:400 })
    if (password.length < 6) return NextResponse.json({ error:'Password minimal 6 karakter' }, { status:400 })
    const exist = await query('SELECT id FROM users WHERE email=$1 OR username=$2', [email, username])
    if (exist.rows.length) return NextResponse.json({ error:'Email atau username sudah digunakan' }, { status:400 })
    const hashed = await bcrypt.hash(password, 12)
    const r = await query('INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING id,username,email,role', [username,email,hashed])
    return NextResponse.json({ success:true, message:'Registrasi berhasil! Silakan login.', data:r.rows[0] }, { status:201 })
  } catch(e) { console.error(e); return NextResponse.json({ error:'Server error' }, { status:500 }) }
}
