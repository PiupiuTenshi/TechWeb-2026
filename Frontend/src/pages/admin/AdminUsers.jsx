import { useEffect, useState, useCallback } from 'react'
import { Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight, UserCheck, UserX, Key } from 'lucide-react'
import { adminUsersApi } from '../../api/adminApi'

// ─── User Form Modal ─────────────────────────────────────────────────────────
function UserFormModal({ user, onClose, onSaved }) {
  const isEdit = !!user
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
    email: user?.email || '',
    password: '',
    roleId: user?.roleId || 2,
    isActive: user?.isActive ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        await adminUsersApi.update(user.userId, {
          fullName: form.fullName,
          phone: form.phone,
          avatarUrl: form.avatarUrl,
          roleId: Number(form.roleId),
          isActive: form.isActive,
        })
      } else {
        await adminUsersApi.create({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone,
          roleId: Number(form.roleId),
          isActive: form.isActive,
        })
      }
      onSaved()
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu người dùng.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal">
        <div className="admin-modal-header">
          <span className="admin-modal-title">{isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}</span>
          <button className="admin-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            {error && <div className="admin-alert admin-alert-danger">{error}</div>}

            <div className="admin-form-group">
              <label className="admin-form-label required">Họ và tên</label>
              <input className="admin-form-input" value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
            </div>

            {!isEdit && (
              <>
                <div className="admin-form-group">
                  <label className="admin-form-label required">Email</label>
                  <input className="admin-form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label required">Mật khẩu</label>
                  <input className="admin-form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
                </div>
              </>
            )}

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Số điện thoại</label>
                <input className="admin-form-input" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label required">Vai trò</label>
                <select className="admin-form-select" value={form.roleId} onChange={e => set('roleId', e.target.value)}>
                  <option value={1}>Admin</option>
                  <option value={2}>Khách hàng</option>
                  <option value={3}>Staff</option>
                </select>
              </div>
            </div>

            {isEdit && (
              <div className="admin-form-group">
                <label className="admin-form-label">Avatar URL</label>
                <input className="admin-form-input" value={form.avatarUrl} onChange={e => set('avatarUrl', e.target.value)} placeholder="https://..." />
              </div>
            )}

            <label className="admin-switch">
              <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
              <span className="admin-switch-track" />
              Tài khoản đang hoạt động
            </label>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Password Change Modal ───────────────────────────────────────────────────
function PasswordModal({ user, onClose, onSaved }) {
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await adminUsersApi.changePassword(user.userId, password)
      onSaved()
    } catch (err) {
      setError(err.message || 'Lỗi khi đổi mật khẩu.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal" style={{ maxWidth: 420 }}>
        <div className="admin-modal-header">
          <span className="admin-modal-title">Đổi mật khẩu — {user.fullName}</span>
          <button className="admin-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            {error && <div className="admin-alert admin-alert-danger">{error}</div>}
            <div className="admin-form-group">
              <label className="admin-form-label required">Mật khẩu mới</label>
              <input
                className="admin-form-input" type="password"
                value={password} onChange={e => setPassword(e.target.value)}
                required minLength={6} autoFocus
              />
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Role badge ──────────────────────────────────────────────────────────────
function RoleBadge({ roleName }) {
  const map = {
    Admin: 'admin-badge-danger',
    Staff: 'admin-badge-purple',
    Customer: 'admin-badge-gray',
  }
  return <span className={`admin-badge ${map[roleName] || 'admin-badge-gray'}`}>{roleName || 'User'}</span>
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [pwdModal, setPwdModal] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminUsersApi.list({
        search: search || undefined,
        roleId: roleFilter || undefined,
        active: activeFilter !== '' ? activeFilter === 'true' : undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      })
      setUsers(res.data || [])
      setPagination(p => ({ ...p, total: res.meta?.total || 0 }))
    } catch { /**/ }
    finally { setLoading(false) }
  }, [search, roleFilter, activeFilter, pagination.page, pagination.pageSize])

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [load])

  const handleToggleActive = async (u) => {
    try {
      await adminUsersApi.updateStatus(u.userId, !u.isActive)
      load()
    } catch { /**/ }
  }

  const handleDelete = async (u) => {
    if (!confirm(`Bạn có chắc muốn khóa tài khoản của ${u.fullName}?`)) return
    try { await adminUsersApi.delete(u.userId); load() } catch { /**/ }
  }

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý Người dùng</h1>
          <p>{pagination.total} người dùng trong hệ thống</p>
        </div>
        <button
          id="btn-add-user"
          className="admin-btn admin-btn-primary"
          onClick={() => setModal({ mode: 'add', user: null })}
        >
          <Plus size={15} /> Thêm người dùng
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-body" style={{ padding: '12px 16px' }}>
          <div className="admin-search-bar">
            <div className="admin-search-input-wrap" style={{ flex: 1 }}>
              <Search size={15} className="admin-search-icon" />
              <input
                id="user-search"
                className="admin-form-input admin-search-input"
                placeholder="Tìm theo tên, email, SĐT..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
              />
            </div>
            <select
              id="user-role-filter"
              className="admin-form-select" style={{ width: 150 }}
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
            >
              <option value="">Tất cả vai trò</option>
              <option value="1">Admin</option>
              <option value="2">Khách hàng</option>
              <option value="3">Staff</option>
            </select>
            <select
              id="user-active-filter"
              className="admin-form-select" style={{ width: 160 }}
              value={activeFilter}
              onChange={e => { setActiveFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
            >
              <option value="">Mọi trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th style={{ width: 140 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="admin-empty">
                          <div className="admin-empty-icon">👤</div>
                          <div className="admin-empty-title">Không tìm thấy người dùng</div>
                        </div>
                      </td>
                    </tr>
                  ) : users.map(u => (
                    <tr key={u.userId}>
                      <td>
                        <div className="admin-avatar-cell">
                          <div className="admin-avatar">
                            {u.avatarUrl
                              ? <img src={u.avatarUrl} alt={u.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                              : (u.fullName?.[0] || 'U').toUpperCase()
                            }
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{u.fullName}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: '#475569' }}>{u.email}</td>
                      <td style={{ fontSize: 13 }}>{u.phone || '—'}</td>
                      <td><RoleBadge roleName={u.roleName} /></td>
                      <td>
                        {u.isActive
                          ? <span className="admin-badge admin-badge-success"><UserCheck size={11} /> Hoạt động</span>
                          : <span className="admin-badge admin-badge-gray"><UserX size={11} /> Đã khóa</span>
                        }
                      </td>
                      <td style={{ fontSize: 12, color: '#94a3b8' }}>
                        {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            id={`btn-edit-user-${u.userId?.slice(0, 8)}`}
                            className="admin-btn admin-btn-ghost admin-btn-icon"
                            title="Chỉnh sửa"
                            onClick={() => setModal({ mode: 'edit', user: u })}
                          ><Edit2 size={14} /></button>
                          <button
                            className="admin-btn admin-btn-ghost admin-btn-icon"
                            title="Đổi mật khẩu"
                            onClick={() => setPwdModal(u)}
                          ><Key size={14} /></button>
                          <button
                            className="admin-btn admin-btn-ghost admin-btn-icon"
                            title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                            style={{ color: u.isActive ? '#dc2626' : '#16a34a' }}
                            onClick={() => handleToggleActive(u)}
                          >
                            {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <span className="admin-pagination-info">
                Trang {pagination.page} / {totalPages || 1} &bull; {pagination.total} người dùng
              </span>
              <div className="admin-pagination-btns">
                <button className="admin-page-btn" disabled={pagination.page <= 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}><ChevronLeft size={14}/></button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pg => (
                  <button key={pg} className={`admin-page-btn${pagination.page === pg ? ' active' : ''}`}
                    onClick={() => setPagination(p => ({ ...p, page: pg }))}>{pg}</button>
                ))}
                <button className="admin-page-btn" disabled={pagination.page >= totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}><ChevronRight size={14}/></button>
              </div>
            </div>
          </>
        )}
      </div>

      {modal && (
        <UserFormModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}

      {pwdModal && (
        <PasswordModal
          user={pwdModal}
          onClose={() => setPwdModal(null)}
          onSaved={() => { setPwdModal(null) }}
        />
      )}
    </div>
  )
}
