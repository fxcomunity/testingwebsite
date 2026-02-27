import { NextRequest, NextResponse } from 'next/server'
import { initDB } from '@/lib/db'
import { seedPDFs } from '@/lib/seed'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    await initDB()
    await seedPDFs()
    // Create default owner if not exists
    const exist = await query("SELECT id FROM users WHERE email='owner@fxcomunity.com'")
    if (!exist.rows.length) {
      const h = await bcrypt.hash('owner123', 12)
      await query(`INSERT INTO users (username,email,password,role,status,email_verified) VALUES ('owner','owner@fxcomunity.com',$1,'Owner','Aktif',true)`, [h])
    }
    return NextResponse.json({
      success: true,
      message: 'Database initialized & seeded!',
      defaultOwner: { email: 'owner@fxcomunity.com', password: 'owner123' }
    })
  } catch (e) { console.error(e); return NextResponse.json({ error: String(e) }, { status: 500 }) }
}
