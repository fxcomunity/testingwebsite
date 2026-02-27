import { NextRequest, NextResponse } from 'next/server'
import { getToken, verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'
export async function GET(req: NextRequest) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const r = await query('SELECT id,username,email,role,status,created_at FROM users WHERE id=$1', [payload.id])
  if (!r.rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: r.rows[0] })
}
