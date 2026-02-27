import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getToken(req)
    const user = token ? verifyToken(token) : null
    if (!user || !['Owner', 'Admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = await req.json()
    const r = await query(
      `UPDATE pdfs SET name=COALESCE($1,name), url=COALESCE($2,url), category=COALESCE($3,category),
       thumbnail=COALESCE($4,thumbnail), is_active=COALESCE($5,is_active), updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [body.name, body.url, body.category, body.thumbnail, body.is_active, params.id]
    )
    if (!r.rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: r.rows[0] })
  } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getToken(req)
    const user = token ? verifyToken(token) : null
    if (!user || !['Owner', 'Admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await query('DELETE FROM user_favorites WHERE pdf_id=$1', [params.id])
    await query('DELETE FROM user_downloads WHERE pdf_id=$1', [params.id])
    await query('DELETE FROM pdfs WHERE id=$1', [params.id])
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
