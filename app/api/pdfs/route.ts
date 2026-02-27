import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const fav = searchParams.get('favorites') === '1'

    const token = getToken(req)
    const user = token ? verifyToken(token) : null
    const isAdmin = user && ['Owner', 'Admin'].includes(user.role)

    let where = isAdmin ? 'WHERE 1=1' : 'WHERE p.is_active=true'
    const params: any[] = []
    let i = 1

    if (search) { where += ` AND p.name ILIKE $${i++}`; params.push(`%${search}%`) }
    if (category && category !== 'semua' && category !== 'favorit') { where += ` AND p.category=$${i++}`; params.push(category) }

    let sql: string
    if (fav && user) {
      sql = `SELECT p.*, CASE WHEN uf.id IS NOT NULL THEN true ELSE false END as is_fav
        FROM pdfs p LEFT JOIN user_favorites uf ON p.id=uf.pdf_id AND uf.user_id=${user.id}
        INNER JOIN user_favorites uf2 ON p.id=uf2.pdf_id AND uf2.user_id=${user.id}
        ${where} ORDER BY p.created_at DESC`
    } else if (user) {
      sql = `SELECT p.*, CASE WHEN uf.id IS NOT NULL THEN true ELSE false END as is_fav
        FROM pdfs p LEFT JOIN user_favorites uf ON p.id=uf.pdf_id AND uf.user_id=${user.id}
        ${where} ORDER BY p.created_at DESC`
    } else {
      sql = `SELECT p.*, false as is_fav FROM pdfs p ${where} ORDER BY p.created_at DESC`
    }

    const r = await query(sql, params)
    return NextResponse.json({ success: true, data: r.rows, total: r.rows.length })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const token = getToken(req)
    const user = token ? verifyToken(token) : null
    if (!user || !['Owner', 'Admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { name, url, category, thumbnail } = await req.json()
    if (!name || !url) return NextResponse.json({ error: 'Name dan URL wajib diisi' }, { status: 400 })
    const r = await query('INSERT INTO pdfs (name,url,category,thumbnail) VALUES ($1,$2,$3,$4) RETURNING *', [name, url, category || 'fx-basic', thumbnail || '📄'])
    return NextResponse.json({ success: true, data: r.rows[0] }, { status: 201 })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
