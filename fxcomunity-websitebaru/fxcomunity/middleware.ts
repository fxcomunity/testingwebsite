import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PUBLIC = ['/','/login','/register','/forgot-password','/reset-password',
  '/api/auth/login','/api/auth/register','/api/auth/request-otp','/api/auth/reset-password','/api/init']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC.some(p => pathname === p || pathname.startsWith('/api/auth/'))) return NextResponse.next()
  if (pathname.startsWith('/api/') || pathname.startsWith('/library') || pathname.startsWith('/admin') || pathname.startsWith('/profile')) {
    const token = req.cookies.get('token')?.value
    if (!token) {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
      return NextResponse.redirect(new URL('/login', req.url))
    }
    const user = verifyToken(token)
    if (!user) {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
      const res = NextResponse.redirect(new URL('/login', req.url))
      res.cookies.delete('token')
      return res
    }
    if (pathname.startsWith('/admin') && !['Owner','Admin'].includes(user.role)) {
      return NextResponse.redirect(new URL('/library', req.url))
    }
  }
  return NextResponse.next()
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
