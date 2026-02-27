'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) router.push('/library')
      else setError(data.error || 'Login gagal')
    } catch { setError('Koneksi gagal') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      {/* BG decorations */}
      <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(31,71,136,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,32,230,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px', display: 'block', animation: 'float 3s ease-in-out infinite' }}>📚</div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '6px' }}>
            <span className="grad-text">FX COMUNITY</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Trading Knowledge Platform</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow2)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: 'var(--text)' }}>Masuk ke Akun</h2>

          {error && (
            <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#ff8080', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--text2)', fontSize: '13px', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px' }}>EMAIL</label>
              <input className="input" type="email" placeholder="email@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', color: 'var(--text2)', fontSize: '13px', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required style={{ paddingRight: '48px' }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text3)' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Link href="/forgot-password" style={{ color: 'var(--accent)', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>
                Lupa password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700, borderRadius: '12px' }}>
              {loading ? <><span className="spin">⚙️</span> Masuk...</> : '🚀 Masuk Sekarang'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
              Belum punya akun?{' '}
              <Link href="/register" style={{ color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}>
                Daftar Gratis →
              </Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text3)', fontSize: '12px' }}>
          ⚠️ Semua materi untuk tujuan edukasi saja
        </p>
      </div>
    </div>
  )
}
