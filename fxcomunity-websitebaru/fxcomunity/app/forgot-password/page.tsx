'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.success) setSent(true)
      else setError(data.error || 'Gagal kirim OTP')
    } catch { setError('Koneksi gagal') }
    finally { setLoading(false) }
  }

  const BgDeco = () => (
    <>
      <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(31,71,136,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,32,230,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
    </>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <BgDeco />
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>🔑</div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '6px' }}><span className="grad-text">Lupa Password</span></h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Kirim kode OTP ke email kamu</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow2)' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '52px', marginBottom: '16px' }}>📧</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#60d090' }}>OTP Terkirim!</h3>
              <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '24px' }}>
                Cek email <strong style={{ color: 'var(--secondary)' }}>{email}</strong> dan masukkan kode 6 digit yang kami kirim.
              </p>
              <Link href="/reset-password" className="btn btn-primary" style={{ display: 'inline-flex', width: '100%', padding: '14px', justifyContent: 'center', fontWeight: 700, borderRadius: '12px', textDecoration: 'none' }}>
                Masukkan Kode OTP →
              </Link>
              <button onClick={() => setSent(false)} style={{ marginTop: '12px', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '13px' }}>
                Kirim ulang
              </button>
            </div>
          ) : (
            <>
              {error && <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#ff8080', fontSize: '14px' }}>⚠️ {error}</div>}
              <form onSubmit={handleSend}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: 'var(--text2)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>ALAMAT EMAIL</label>
                  <input className="input" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700, borderRadius: '12px' }}>
                  {loading ? <><span className="spin">⚙️</span> Mengirim...</> : '📨 Kirim Kode OTP'}
                </button>
              </form>
            </>
          )}
          <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <Link href="/login" style={{ color: 'var(--text2)', fontSize: '13px', textDecoration: 'none' }}>← Kembali ke Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
