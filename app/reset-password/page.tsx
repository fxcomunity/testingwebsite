'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Password tidak cocok'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: form.otp, password: form.password })
      })
      const data = await res.json()
      if (data.success) { setSuccess(true); setTimeout(() => router.push('/login'), 3000) }
      else setError(data.error || 'Reset gagal')
    } catch { setError('Koneksi gagal') }
    finally { setLoading(false) }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#60d090', marginBottom: '10px' }}>Password Berhasil Direset!</h2>
        <p style={{ color: 'var(--text2)', marginBottom: '20px' }}>Kamu akan diarahkan ke halaman login...</p>
        <Link href="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Login Sekarang</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,32,230,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>🔐</div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '6px' }}><span className="grad-text">Reset Password</span></h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Masukkan kode OTP dari email kamu</p>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow2)' }}>
          {error && <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#ff8080', fontSize: '14px' }}>⚠️ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--text2)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>EMAIL</label>
              <input className="input" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--text2)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>KODE OTP</label>
              <input className="input" type="text" placeholder="000000" maxLength={6}
                style={{ textAlign: 'center', fontSize: '28px', letterSpacing: '10px', fontFamily: 'monospace', fontWeight: 700 }}
                value={form.otp} onChange={e => setForm(f => ({ ...f, otp: e.target.value.replace(/\D/g,'') }))} required />
              <p style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '6px', textAlign: 'center' }}>⏱ Berlaku 5 menit</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--text2)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>PASSWORD BARU</label>
              <input className="input" type="password" placeholder="Min 6 karakter" minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text2)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>KONFIRMASI PASSWORD</label>
              <input className="input" type="password" placeholder="Ulangi password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700, borderRadius: '12px' }}>
              {loading ? <><span className="spin">⚙️</span> Mereset...</> : '🔐 Reset Password'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <Link href="/forgot-password" style={{ color: 'var(--accent)', fontSize: '13px', textDecoration: 'none' }}>Kirim Ulang OTP</Link>
            <Link href="/login" style={{ color: 'var(--text3)', fontSize: '13px', textDecoration: 'none' }}>← Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
