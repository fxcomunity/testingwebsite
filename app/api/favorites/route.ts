import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = getToken(req)
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { pdf_id, action } = await req.json()
  if (action === 'remove') {
    await query('DELETE FROM user_favorites WHERE user_id=$1 AND pdf_id=$2', [user.id, pdf_id])
    return NextResponse.json({ success: true, action: 'removed' })
  }
  await query('INSERT INTO user_favorites (user_id,pdf_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [user.id, pdf_id])
  return NextResponse.json({ success: true, action: 'added' })
}
