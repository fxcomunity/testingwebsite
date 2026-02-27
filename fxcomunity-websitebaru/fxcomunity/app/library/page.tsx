'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface PDF {
  id: number; name: string; url: string; category: string
  thumbnail: string; views: number; downloads: number
  is_active: boolean; is_fav: boolean
}
interface User { id: number; username: string; email: string; role: string }

const CATS = [
  { key: 'semua', label: 'Semua', icon: '📚' },
  { key: 'favorit', label: 'Favorit', icon: '❤️' },
  { key: 'fx-basic', label: 'Basic FX', icon: '🎓' },
  { key: 'fx-advanced', label: 'Advanced FX', icon: '🚀' },
  { key: 'fx-technical', label: 'Technical', icon: '📊' },
  { key: 'fx-psychology', label: 'Psychology', icon: '🧠' },
]

const MUSIC = [
  { title: 'Lo-fi Study Beats', artist: 'ChillVibes', url: '' },
  { title: 'Trading Focus Music', artist: 'DeepWork', url: '' },
]

const LINKS = [
  { label: 'WhatsApp', icon: '💬', url: 'https://wa.me/62895404147521', color: '#25D366' },
  { label: 'Instagram', icon: '📸', url: 'https://instagram.com/si.palingjack', color: '#E1306C' },
  { label: 'TikTok', icon: '🎵', url: 'https://tiktok.com/@uciii0106', color: '#FF0050' },
]

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const show = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }
  return { toast, show }
}

export default function LibraryPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('semua')
  const [viewPdf, setViewPdf] = useState<PDF | null>(null)
  const [sharePdf, setSharePdf] = useState<PDF | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [showLinktree, setShowLinktree] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const { toast, show: showToast } = useToast()

  // Auth check
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.data) setUser(d.data)
      else router.push('/login')
    }).catch(() => router.push('/login'))
  }, [router])

  const fetchPDFs = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (activeCat !== 'semua') {
      if (activeCat === 'favorit') params.set('favorites', '1')
      else params.set('category', activeCat)
    }
    try {
      const res = await fetch(`/api/pdfs?${params}`)
      const data = await res.json()
      if (data.success) setPdfs(data.data)
    } catch {}
    setLoading(false)
  }, [user, search, activeCat])

  useEffect(() => { const t = setTimeout(fetchPDFs, 200); return () => clearTimeout(t) }, [fetchPDFs])

  // QR generation
  useEffect(() => {
    if (showQR && sharePdf && qrRef.current && typeof window !== 'undefined') {
      qrRef.current.innerHTML = ''
      const url = `${window.location.origin}/library?pdf=${sharePdf.id}`
      if ((window as any).QRCode) {
        new (window as any).QRCode(qrRef.current, { text: url, width: 200, height: 200, colorDark: '#C720E6', colorLight: '#0d0d1a' })
      }
    }
  }, [showQR, sharePdf])

  async function toggleFav(pdf: PDF) {
    if (!user) return
    const action = pdf.is_fav ? 'remove' : 'add'
    const res = await fetch('/api/favorites', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdf_id: pdf.id, action })
    })
    if (res.ok) {
      setPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, is_fav: !p.is_fav } : p))
      showToast(action === 'add' ? '❤️ Ditambahkan ke favorit' : '💔 Dihapus dari favorit')
    }
  }

  async function handleDownload(pdf: PDF) {
    await fetch(`/api/pdfs/${pdf.id}/download`, { method: 'POST' })
    setPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, downloads: p.downloads + 1 } : p))
    window.open(pdf.url, '_blank')
    showToast('📥 Membuka PDF...')
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  function getShareUrl(pdf: PDF) {
    return typeof window !== 'undefined' ? `${window.location.origin}/library?pdf=${pdf.id}` : pdf.url
  }

  function copyLink(pdf: PDF) {
    navigator.clipboard.writeText(getShareUrl(pdf)).then(() => showToast('🔗 Link disalin!'))
  }

  function shareWA(pdf: PDF) {
    const text = `📚 *${pdf.name}*\nMakalah trading tersedia di FX Comunity!\n${getShareUrl(pdf)}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  async function nativeShare(pdf: PDF) {
    if (navigator.share) {
      await navigator.share({ title: pdf.name, text: 'Materi trading dari FX Comunity', url: getShareUrl(pdf) })
    } else copyLink(pdf)
  }

  const isAdmin = user && ['Owner', 'Admin'].includes(user.role)

  if (!user) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }} className="spin">⚙️</div>
        <p style={{ color: 'var(--text2)' }}>Loading...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '80px' }}>
      {/* Toast */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* HEADER */}
      <header style={{ background: 'rgba(10,10,26,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>📚</span>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }} className="grad-text">FX COMUNITY</span>
              <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '1px' }}>TRADING LIBRARY</div>
            </div>
          </div>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hide-mobile">
            {isAdmin && (
              <a href="/admin" style={{ textDecoration: 'none' }}>
                <button className="btn btn-ghost btn-sm">⚙️ Admin</button>
              </a>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => setShowLinktree(true)}>🔗 Links</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsPlaying(v => !v)}>
              {isPlaying ? '⏸ Musik' : '🎵 Musik'}
            </button>
            <button onClick={() => setShowProfile(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(31,71,136,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: 'var(--text)' }}>
              <span style={{ fontSize: '18px' }}>👤</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{user.username}</span>
            </button>
          </div>

          {/* Mobile menu */}
          <button className="hide-desktop btn btn-ghost btn-icon" onClick={() => setMenuOpen(v => !v)}>☰</button>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div style={{ background: 'var(--bg3)', borderTop: '1px solid var(--border)', padding: '12px' }} className="hide-desktop">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg4)', borderRadius: '10px' }}>
                <span style={{ fontSize: '24px' }}>👤</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '14px' }}>{user.username}</p>
                  <p style={{ color: 'var(--text3)', fontSize: '12px' }}>{user.email}</p>
                </div>
                <span className={`badge ${user.role === 'Owner' ? 'badge-orange' : user.role === 'Admin' ? 'badge-purple' : 'badge-blue'}`} style={{ marginLeft: 'auto' }}>{user.role}</span>
              </div>
              {isAdmin && <a href="/admin" style={{ textDecoration: 'none' }}><button className="btn btn-ghost" style={{ width: '100%' }}>⚙️ Admin Panel</button></a>}
              <button className="btn btn-ghost" onClick={() => { setShowLinktree(true); setMenuOpen(false) }}>🔗 Social Links</button>
              <button className="btn btn-ghost" onClick={() => setIsPlaying(v => !v)}>{isPlaying ? '⏸' : '🎵'} Musik Fokus</button>
              <button className="btn btn-danger" onClick={handleLogout}>🚪 Logout</button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(180deg, rgba(31,71,136,0.15) 0%, transparent 100%)', padding: '40px 16px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 900, marginBottom: '10px', lineHeight: 1.2 }}>
          <span className="grad-text">Koleksi PDF Trading</span>
          <br />
          <span style={{ color: 'var(--text)', fontSize: '0.75em', fontWeight: 500 }}>Terlengkap & Gratis</span>
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 24px' }}>
          Ratusan materi trading forex premium — mulai dari basic sampai advanced, semuanya bisa kamu akses gratis. 🚀
        </p>

        {/* Search */}
        <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔍</span>
          <input className="input" placeholder="Cari materi trading..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '44px', borderRadius: '50px', border: '1px solid var(--border2)', fontSize: '15px' }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text3)' }}>✕</button>
          )}
        </div>
      </div>

      {/* CATEGORY PILLS */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 20px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {CATS.map(cat => (
            <button key={cat.key} onClick={() => setActiveCat(cat.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                borderRadius: '50px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                whiteSpace: 'nowrap', border: 'none', transition: 'all 0.2s ease',
                background: activeCat === cat.key ? 'var(--gradient)' : 'rgba(255,255,255,0.05)',
                color: activeCat === cat.key ? '#fff' : 'var(--text2)',
                boxShadow: activeCat === cat.key ? 'var(--shadow)' : 'none',
                transform: activeCat === cat.key ? 'scale(1.05)' : 'scale(1)',
              }}>
              {cat.icon} {cat.label}
              {cat.key !== 'semua' && cat.key !== 'favorit' && (
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '1px 6px', fontSize: '11px' }}>
                  {pdfs.filter(p => p.category === cat.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* PDF GRID */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ borderRadius: '14px', overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: '140px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ height: '14px', marginBottom: '6px' }} />
                <div className="skeleton" style={{ height: '10px', width: '60%' }} />
              </div>
            ))}
          </div>
        ) : pdfs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ color: 'var(--text2)', marginBottom: '8px' }}>Tidak ada PDF ditemukan</h3>
            <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Coba kata kunci lain atau pilih kategori berbeda</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '16px' }}>{pdfs.length} materi ditemukan</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '14px' }}>
              {pdfs.map(pdf => (
                <PDFCard
                  key={pdf.id} pdf={pdf}
                  onView={() => setViewPdf(pdf)}
                  onDownload={() => handleDownload(pdf)}
                  onShare={() => setSharePdf(pdf)}
                  onFav={() => toggleFav(pdf)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '40px 20px 20px', color: 'var(--text3)', fontSize: '13px', borderTop: '1px solid var(--border)', marginTop: '40px' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
        <p style={{ fontWeight: 700, color: 'var(--text2)', marginBottom: '4px' }}>FX Comunity</p>
        <p>Trading Knowledge Platform — Untuk Edukasi Saja ⚠️</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
          {LINKS.map(l => (
            <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
              style={{ color: l.color, textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {l.icon} {l.label}
            </a>
          ))}
        </div>
      </footer>

      {/* PDF VIEWER MODAL */}
      {viewPdf && (
        <div className="modal-overlay" onClick={() => setViewPdf(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '18px', width: '100%', maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{viewPdf.thumbnail}</span>
                <div style={{ overflow: 'hidden' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{viewPdf.name}</h3>
                  <span className={`badge ${viewPdf.category.includes('basic') ? 'badge-blue' : viewPdf.category.includes('advanced') ? 'badge-purple' : viewPdf.category.includes('psychology') ? 'badge-orange' : 'badge-green'}`}>{viewPdf.category}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { handleDownload(viewPdf); }}>📥 Download</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setSharePdf(viewPdf); setViewPdf(null) }}>📤 Share</button>
                <button className="btn btn-ghost btn-icon" onClick={() => setViewPdf(null)}>✕</button>
              </div>
            </div>
            <iframe
              src={viewPdf.url.replace('/view', '/preview')}
              style={{ flex: 1, border: 'none', width: '100%' }}
              title={viewPdf.name}
            />
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {sharePdf && (
        <div className="modal-overlay" onClick={() => { setSharePdf(null); setShowQR(false) }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>📤 Bagikan PDF</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => { setSharePdf(null); setShowQR(false) }}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg4)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
              <span style={{ fontSize: '32px' }}>{sharePdf.thumbnail}</span>
              <div><p style={{ fontWeight: 600, fontSize: '14px' }}>{sharePdf.name}</p>
                <span className="badge badge-blue">{sharePdf.category}</span></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { icon: '🔗', label: 'Salin Link', action: () => { copyLink(sharePdf); setSharePdf(null) } },
                { icon: '💬', label: 'WhatsApp', action: () => shareWA(sharePdf) },
                { icon: '📱', label: 'Share Native', action: () => nativeShare(sharePdf) },
                { icon: '📷', label: showQR ? 'Sembunyikan QR' : 'QR Code', action: () => setShowQR(v => !v) },
              ].map(b => (
                <button key={b.label} className="btn btn-secondary" onClick={b.action}
                  style={{ padding: '12px', borderRadius: '12px', flexDirection: 'column', gap: '4px', height: '70px' }}>
                  <span style={{ fontSize: '24px' }}>{b.icon}</span>
                  <span style={{ fontSize: '12px' }}>{b.label}</span>
                </button>
              ))}
            </div>
            {showQR && (
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg4)', borderRadius: '12px' }}>
                <div ref={qrRef} style={{ display: 'inline-block', background: '#0d0d1a', padding: '12px', borderRadius: '8px' }} />
                <p style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '8px' }}>Scan untuk membuka PDF</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LINKTREE MODAL */}
      {showLinktree && (
        <div className="modal-overlay" onClick={() => setShowLinktree(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🌐</div>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }} className="grad-text">FX Comunity</h3>
              <p style={{ color: 'var(--text2)', fontSize: '13px' }}>Ikuti kami di sosial media</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {LINKS.map(l => (
                <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'var(--bg4)', borderRadius: '12px', textDecoration: 'none', border: '1px solid var(--border)', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = l.color)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <span style={{ fontSize: '28px' }}>{l.icon}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '15px' }}>{l.label}</span>
                  <span style={{ marginLeft: 'auto', color: l.color, fontSize: '13px' }}>→</span>
                </a>
              ))}
            </div>
            <button className="btn btn-ghost" onClick={() => setShowLinktree(false)} style={{ width: '100%', marginTop: '16px' }}>Tutup</button>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 12px' }}>
                {user.username[0].toUpperCase()}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{user.username}</h3>
              <p style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '8px' }}>{user.email}</p>
              <span className={`badge ${user.role === 'Owner' ? 'badge-orange' : user.role === 'Admin' ? 'badge-purple' : 'badge-blue'}`}>{user.role}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {isAdmin && (
                <a href="/admin" style={{ textDecoration: 'none' }}>
                  <button className="btn btn-secondary" style={{ width: '100%' }}>⚙️ Admin Panel</button>
                </a>
              )}
              <button className="btn btn-danger" onClick={handleLogout} style={{ width: '100%' }}>🚪 Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcut: ESC to close */}
      <EscHandler onEsc={() => { setViewPdf(null); setSharePdf(null); setShowLinktree(false); setShowProfile(false); setShowQR(false) }} />
    </div>
  )
}

// PDF Card component
function PDFCard({ pdf, onView, onDownload, onShare, onFav }: {
  pdf: PDF; onView: () => void; onDownload: () => void; onShare: () => void; onFav: () => void
}) {
  const catColor = pdf.category.includes('basic') ? '#4488ff' : pdf.category.includes('advanced') ? '#C720E6' : pdf.category.includes('psychology') ? '#FF6B35' : '#28c864'

  return (
    <div className="card" style={{ padding: '14px', position: 'relative', cursor: 'pointer', background: 'var(--card)' }}>
      {/* Fav button */}
      <button onClick={e => { e.stopPropagation(); onFav() }}
        style={{ position: 'absolute', top: '10px', right: '10px', background: pdf.is_fav ? 'rgba(255,50,80,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${pdf.is_fav ? 'rgba(255,50,80,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', padding: '4px 6px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', zIndex: 1 }}>
        {pdf.is_fav ? '❤️' : '🤍'}
      </button>

      {/* Thumbnail */}
      <div onClick={onView} style={{ fontSize: '44px', textAlign: 'center', margin: '4px 0 10px', lineHeight: 1 }}>{pdf.thumbnail}</div>

      {/* Category badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44` }}>
          {pdf.category.replace('fx-', '').toUpperCase()}
        </span>
      </div>

      {/* Name */}
      <p onClick={onView} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', textAlign: 'center', marginBottom: '10px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {pdf.name}
      </p>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text3)' }}>👁 {pdf.views}</span>
        <span style={{ fontSize: '10px', color: 'var(--text3)' }}>📥 {pdf.downloads}</span>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button onClick={onView} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '11px', padding: '5px 4px' }}>👁 Lihat</button>
        <button onClick={onDownload} className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: '11px', padding: '5px 4px' }}>📥</button>
        <button onClick={onShare} className="btn btn-ghost btn-sm" style={{ fontSize: '11px', padding: '5px 8px' }}>📤</button>
      </div>
    </div>
  )
}

function EscHandler({ onEsc }: { onEsc: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onEsc() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onEsc])
  return null
}
