'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Password tidak cocok'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password })
      })
      const data = await res.json()
      if (data.success) { setSuccess(data.message); setTimeout(() => router.push('/login'), 2000) }
      else setError(data.error || 'Registrasi gagal')
    } catch { setError('Koneksi gagal') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,32,230,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(31,71,136,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎓</div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '6px' }}><span className="grad-text">Daftar Gratis</span></h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Bergabung dengan komunitas trader Indonesia</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow2)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Buat Akun Baru</h2>

          {error && <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#ff8080', fontSize: '14px' }}>⚠️ {error}</div>}
          {success && <div style={{ background: 'rgba(40,200,100,0.1)', border: '1px solid rgba(40,200,100,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#60d090', fontSize: '14px' }}>✅ {success}</div>}

          <form onSubmit={handleSubmit}>
            {[
              { key: 'username', label: 'USERNAME', type: 'text', placeholder: 'nama_pengguna', min: 3 },
              { key: 'email', label: 'EMAIL', type: 'email', placeholder: 'email@example.com' },
              { key: 'password', label: 'PASSWORD', type: 'password', placeholder: 'Min 6 karakter', min: 6 },
              { key: 'confirm', label: 'KONFIRMASI PASSWORD', type: 'password', placeholder: 'Ulangi password' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--text2)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>{f.label}</label>
                <input className="input" type={f.type} placeholder={f.placeholder} minLength={f.min}
                  value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required />
              </div>
            ))}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700, borderRadius: '12px', marginTop: '8px' }}>
              {loading ? <><span className="spin">⚙️</span> Mendaftar...</> : '✨ Daftar Sekarang'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
              Sudah punya akun?{' '}
              <Link href="/login" style={{ color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}>Masuk →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
