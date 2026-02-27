import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = getToken(req)
  const user = token ? verifyToken(token) : null
  if (!user || !['Owner', 'Admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const r = await query('SELECT id,username,email,role,status,created_at FROM users ORDER BY created_at DESC')
  return NextResponse.json({ success: true, data: r.rows })
}

export async function PUT(req: NextRequest) {
  const token = getToken(req)
  const user = token ? verifyToken(token) : null
  if (!user || !['Owner', 'Admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, status, role } = await req.json()
  if (role && user.role !== 'Owner') return NextResponse.json({ error: 'Hanya Owner yang bisa ubah role' }, { status: 403 })
  const r = await query(
    'UPDATE users SET status=COALESCE($1,status), role=COALESCE($2,role) WHERE id=$3 RETURNING id,username,email,role,status',
    [status, role, id]
  )
  return NextResponse.json({ success: true, data: r.rows[0] })
}
