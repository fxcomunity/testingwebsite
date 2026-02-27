import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query('UPDATE pdfs SET downloads=downloads+1 WHERE id=$1', [params.id])
    const token = getToken(req)
    const user = token ? verifyToken(token) : null
    if (user) await query('INSERT INTO user_downloads (user_id,pdf_id) VALUES ($1,$2)', [user.id, params.id])
    // Also increment view
    await query('UPDATE pdfs SET views=views+1 WHERE id=$1', [params.id])
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
