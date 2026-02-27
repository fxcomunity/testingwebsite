'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User { id: number; username: string; email: string; role: string; status: string; created_at: string }
interface PDF { id: number; name: string; url: string; category: string; thumbnail: string; views: number; downloads: number; is_active: boolean }

const CATS = ['fx-basic', 'fx-advanced', 'fx-technical', 'fx-psychology']
const THUMBS = ['📊','📈','📉','🧠','📚','💰','⚖️','🔧','🌍','⚠️','🎯','💧','✅','🔨','⚡','📦','🌊','🏗️','🎁','📍','🔐','🕯️','🎨','💼','📖','🚀','💎','📄']

export default function AdminPage() {
  const router = useRouter()
  const [me, setMe] = useState<any>(null)
  const [tab, setTab] = useState<'pdfs' | 'users'>('pdfs')
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'add' | 'edit'>(null)
  const [editTarget, setEditTarget] = useState<PDF | null>(null)
  const [form, setForm] = useState({ name: '', url: '', category: 'fx-basic', thumbnail: '📄' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.data || !['Owner', 'Admin'].includes(d.data.role)) router.push('/library')
      else { setMe(d.data); loadAll() }
    })
  }, [])

  async function loadAll() {
    setLoading(true)
    const [pRes, uRes] = await Promise.all([
      fetch('/api/pdfs').then(r => r.json()),
      fetch('/api/users').then(r => r.json()),
    ])
    if (pRes.success) setPdfs(pRes.data)
    if (uRes.success) setUsers(uRes.data)
    setLoading(false)
  }

  function openAdd() { setForm({ name: '', url: '', category: 'fx-basic', thumbnail: '📄' }); setEditTarget(null); setModal('add') }
  function openEdit(p: PDF) { setForm({ name: p.name, url: p.url, category: p.category, thumbnail: p.thumbnail }); setEditTarget(p); setModal('edit') }

  async function savePDF() {
    if (!form.name || !form.url) { showToast('⚠️ Nama dan URL wajib diisi'); return }
    setSaving(true)
    try {
      const res = await fetch(editTarget ? `/api/pdfs/${editTarget.id}` : '/api/pdfs', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) { setModal(null); loadAll(); showToast(editTarget ? '✅ PDF diperbarui' : '✅ PDF ditambahkan') }
      else showToast('⚠️ ' + data.error)
    } finally { setSaving(false) }
  }

  async function toggleActive(p: PDF) {
    await fetch(`/api/pdfs/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !p.is_active }) })
    loadAll(); showToast(`${!p.is_active ? '✅ Diaktifkan' : '🚫 Dinonaktifkan'}`)
  }

  async function deletePDF(p: PDF) {
    if (!confirm(`Hapus "${p.name}"?`)) return
    await fetch(`/api/pdfs/${p.id}`, { method: 'DELETE' })
    loadAll(); showToast('🗑️ PDF dihapus')
  }

  async function toggleUserStatus(u: User) {
    const newStatus = u.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif'
    await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, status: newStatus }) })
    loadAll(); showToast(`User ${newStatus === 'Aktif' ? '✅ diaktifkan' : '🚫 dinonaktifkan'}`)
  }

  async function changeRole(u: User, role: string) {
    await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, role }) })
    loadAll(); showToast('✅ Role diperbarui')
  }

  const filteredPdfs = pdfs.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))

  if (!me) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '48px' }} className="spin">⚙️</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {toast && <div className="toast success">{toast}</div>}

      {/* Header */}
      <header style={{ background: 'rgba(10,10,26,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 16px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/library" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '13px' }}>← Library</Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ fontWeight: 700 }} className="grad-text">⚙️ Admin Panel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${me.role === 'Owner' ? 'badge-orange' : 'badge-purple'}`}>{me.role}</span>
          <span style={{ color: 'var(--text2)', fontSize: '13px' }}>{me.username}</span>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {[
            { icon: '📄', label: 'Total PDF', value: pdfs.length, color: '#4488ff' },
            { icon: '✅', label: 'PDF Aktif', value: pdfs.filter(p => p.is_active).length, color: '#28c864' },
            { icon: '👥', label: 'Total User', value: users.length, color: '#C720E6' },
            { icon: '📥', label: 'Total Download', value: pdfs.reduce((a, p) => a + p.downloads, 0), color: '#FF6B35' },
            { icon: '👁', label: 'Total View', value: pdfs.reduce((a, p) => a + p.views, 0), color: '#7aadff' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value.toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--bg3)', borderRadius: '12px', padding: '4px' }}>
          {(['pdfs', 'users'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s', fontFamily: 'inherit',
                background: tab === t ? 'var(--gradient)' : 'transparent', color: tab === t ? '#fff' : 'var(--text2)' }}>
              {t === 'pdfs' ? '📄 Kelola PDF' : '👥 Kelola User'}
            </button>
          ))}
        </div>

        {/* Search + Add */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input className="input" placeholder={tab === 'pdfs' ? '🔍 Cari PDF...' : '🔍 Cari user...'} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          {tab === 'pdfs' && <button className="btn btn-primary" onClick={openAdd} style={{ whiteSpace: 'nowrap' }}>➕ Tambah PDF</button>}
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}><span className="spin" style={{ fontSize: '32px', display: 'inline-block' }}>⚙️</span></div> : tab === 'pdfs' ? (
          <>
            {/* Mobile cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredPdfs.map(pdf => (
                <div key={pdf.id} className="card" style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '32px', flexShrink: 0 }}>{pdf.thumbnail}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a href={pdf.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600, fontSize: '13px', color: '#7aadff', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdf.name}</a>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span className="badge badge-blue" style={{ fontSize: '10px' }}>{pdf.category}</span>
                        <span className={`badge ${pdf.is_active ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '10px' }}>{pdf.is_active ? 'Aktif' : 'Nonaktif'}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text3)' }}>👁{pdf.views} 📥{pdf.downloads}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(pdf)} style={{ fontSize: '12px' }}>{pdf.is_active ? '🚫' : '✅'}</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(pdf)} style={{ fontSize: '12px' }}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deletePDF(pdf)} style={{ fontSize: '12px' }}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredUsers.map(u => (
              <div key={u.id} className="card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                  {u.username[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <p style={{ fontWeight: 700, fontSize: '14px' }}>{u.username}</p>
                  <p style={{ color: 'var(--text3)', fontSize: '12px' }}>{u.email}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={u.role} onChange={e => changeRole(u, e.target.value)}
                    style={{ background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', padding: '4px 8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <option>User</option><option>Admin</option>
                    {me.role === 'Owner' && <option>Owner</option>}
                  </select>
                  <button onClick={() => toggleUserStatus(u)}
                    className={`badge ${u.status === 'Aktif' ? 'badge-green' : 'badge-red'}`}
                    style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit', padding: '6px 10px' }}>
                    {u.status}
                  </button>
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{new Date(u.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB for mobile */}
      {tab === 'pdfs' && (
        <button onClick={openAdd} className="btn btn-primary" style={{ position: 'fixed', bottom: '24px', right: '20px', width: '56px', height: '56px', borderRadius: '50%', fontSize: '24px', padding: 0, boxShadow: 'var(--shadow)', zIndex: 50 }}>
          ➕
        </button>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{modal === 'edit' ? '✏️ Edit PDF' : '➕ Tambah PDF'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>NAMA PDF</label>
                <input className="input" placeholder="Nama PDF" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>URL (Google Drive)</label>
                <input className="input" placeholder="https://drive.google.com/..." value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>KATEGORI</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>THUMBNAIL EMOJI</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {THUMBS.map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, thumbnail: t }))}
                      style={{ fontSize: '20px', padding: '6px', borderRadius: '8px', border: `2px solid ${form.thumbnail === t ? 'var(--accent)' : 'transparent'}`, background: form.thumbnail === t ? 'rgba(199,32,230,0.2)' : 'var(--bg4)', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button className="btn btn-ghost" onClick={() => setModal(null)} style={{ flex: 1 }}>Batal</button>
                <button className="btn btn-primary" onClick={savePDF} disabled={saving} style={{ flex: 2 }}>
                  {saving ? <><span className="spin">⚙️</span> Menyimpan...</> : `💾 ${modal === 'edit' ? 'Simpan Perubahan' : 'Tambahkan PDF'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
