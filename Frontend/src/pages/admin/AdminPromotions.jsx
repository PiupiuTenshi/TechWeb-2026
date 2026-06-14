import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { adminPromotionsApi, adminProductsApi } from '../../api/adminApi'

const formatCurrency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v ?? 0)

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN')
}

function isActive(p) {
  const now = Date.now()
  return p.isActive && new Date(p.startsAt) <= now && new Date(p.endsAt) >= now
}

// ─── Promotion Form Modal ────────────────────────────────────────────────────
function PromotionFormModal({ promotion, onClose, onSaved }) {
  const isEdit = !!promotion
  const [form, setForm] = useState({
    name: promotion?.name || '',
    discountType: promotion?.discountType || 'Percent',
    discountValue: promotion?.discountValue || '',
    startsAt: promotion?.startsAt ? new Date(promotion.startsAt).toISOString().slice(0, 16) : '',
    endsAt: promotion?.endsAt ? new Date(promotion.endsAt).toISOString().slice(0, 16) : '',
    isActive: promotion?.isActive ?? true,
    productIds: promotion?.products?.map(p => p.productId) || [],
  })
  const [products, setProducts] = useState([])
  const [prodSearch, setProdSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    adminProductsApi.list({ pageSize: 100 }).then(r => setProducts(r.data || [])).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleProduct = (id) => {
    setForm(f => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter(x => x !== id)
        : [...f.productIds, id],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      }
      if (isEdit) await adminPromotionsApi.update(promotion.promotionId, payload)
      else await adminPromotionsApi.create(payload)
      onSaved()
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu khuyến mãi.')
    } finally {
      setSaving(false)
    }
  }

  const filteredProds = prodSearch
    ? products.filter(p => p.name?.toLowerCase().includes(prodSearch.toLowerCase()) || p.brand?.toLowerCase().includes(prodSearch.toLowerCase()))
    : products

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal admin-modal-xl">
        <div className="admin-modal-header">
          <span className="admin-modal-title">{isEdit ? 'Chỉnh sửa khuyến mãi' : 'Tạo khuyến mãi mới'}</span>
          <button className="admin-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Left col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && <div className="admin-alert admin-alert-danger">{error}</div>}

              <div className="admin-form-group">
                <label className="admin-form-label required">Tên khuyến mãi</label>
                <input className="admin-form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label required">Loại giảm giá</label>
                  <select className="admin-form-select" value={form.discountType} onChange={e => set('discountType', e.target.value)}>
                    <option value="Percent">Phần trăm (%)</option>
                    <option value="Fixed">Số tiền cố định (VND)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label required">Giá trị giảm</label>
                  <input
                    className="admin-form-input"
                    type="number" min="0"
                    max={form.discountType === 'Percent' ? 100 : undefined}
                    value={form.discountValue}
                    onChange={e => set('discountValue', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label required">Ngày bắt đầu</label>
                  <input
                    className="admin-form-input" type="datetime-local"
                    value={form.startsAt} onChange={e => set('startsAt', e.target.value)} required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label required">Ngày kết thúc</label>
                  <input
                    className="admin-form-input" type="datetime-local"
                    value={form.endsAt} onChange={e => set('endsAt', e.target.value)} required
                  />
                </div>
              </div>

              <label className="admin-switch">
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                <span className="admin-switch-track" />
                Kích hoạt ngay
              </label>

              <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, fontSize: 12 }}>
                <strong>Tóm tắt:</strong><br />
                Giảm {form.discountValue}{form.discountType === 'Percent' ? '%' : '₫'} cho {form.productIds.length} sản phẩm được chọn
                {form.startsAt && ` từ ${new Date(form.startsAt).toLocaleDateString('vi-VN')}`}
                {form.endsAt && ` đến ${new Date(form.endsAt).toLocaleDateString('vi-VN')}`}
              </div>
            </div>

            {/* Right col - product selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>
                Sản phẩm áp dụng ({form.productIds.length} đã chọn)
              </div>
              <div className="admin-search-input-wrap">
                <Search size={13} className="admin-search-icon" />
                <input
                  className="admin-form-input admin-search-input"
                  placeholder="Tìm sản phẩm..."
                  value={prodSearch}
                  onChange={e => setProdSearch(e.target.value)}
                />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: 300, border: '1px solid #e2e8f0', borderRadius: 8, padding: 4 }}>
                {filteredProds.map(p => (
                  <label
                    key={p.productId}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                      borderRadius: 6, cursor: 'pointer',
                      background: form.productIds.includes(p.productId) ? '#eff6ff' : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      className="admin-checkbox"
                      checked={form.productIds.includes(p.productId)}
                      onChange={() => toggleProduct(p.productId)}
                    />
                    {p.thumbnailUrl && (
                      <img src={p.thumbnailUrl} alt={p.name} style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }} />
                    )}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.brand}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo khuyến mãi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 15, total: 0 })
  const [activeFilter, setActiveFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminPromotionsApi.list({
        active: activeFilter !== '' ? activeFilter === 'true' : undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      })
      setPromotions(res.data || [])
      setPagination(p => ({ ...p, total: res.meta?.total || 0 }))
    } catch { /**/ }
    finally { setLoading(false) }
  }, [activeFilter, pagination.page, pagination.pageSize])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!confirm('Tắt khuyến mãi này?')) return
    try { await adminPromotionsApi.delete(id); load() } catch { /**/ }
  }

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý Khuyến mãi</h1>
          <p>{pagination.total} chương trình khuyến mãi</p>
        </div>
        <button
          id="btn-add-promotion"
          className="admin-btn admin-btn-primary"
          onClick={() => setModal({ mode: 'add', promotion: null })}
        >
          <Plus size={15} /> Tạo khuyến mãi
        </button>
      </div>

      {/* Filter */}
      <div className="admin-tabs" style={{ marginBottom: 16 }}>
        {[['', 'Tất cả'], ['true', 'Đang hoạt động'], ['false', 'Đã kết thúc']].map(([v, l]) => (
          <button
            key={v}
            className={`admin-tab${activeFilter === v ? ' active' : ''}`}
            onClick={() => { setActiveFilter(v); setPagination(p => ({ ...p, page: 1 })) }}
          >{l}</button>
        ))}
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
                    <th>Tên khuyến mãi</th>
                    <th>Loại giảm</th>
                    <th>Giá trị</th>
                    <th>Từ ngày</th>
                    <th>Đến ngày</th>
                    <th>Sản phẩm</th>
                    <th>Trạng thái</th>
                    <th style={{ width: 90 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="admin-empty">
                          <div className="admin-empty-icon">🏷️</div>
                          <div className="admin-empty-title">Chưa có khuyến mãi</div>
                        </div>
                      </td>
                    </tr>
                  ) : promotions.map(p => (
                    <tr key={p.promotionId}>
                      <td style={{ fontWeight: 700 }}>{p.name}</td>
                      <td>
                        <span className={`admin-badge ${p.discountType === 'Percent' ? 'admin-badge-info' : 'admin-badge-purple'}`}>
                          {p.discountType === 'Percent' ? '% Phần trăm' : '₫ Cố định'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#dc2626' }}>
                        {p.discountType === 'Percent'
                          ? `${p.discountValue}%`
                          : formatCurrency(p.discountValue)}
                      </td>
                      <td style={{ fontSize: 12 }}>{formatDate(p.startsAt)}</td>
                      <td style={{ fontSize: 12 }}>{formatDate(p.endsAt)}</td>
                      <td>
                        <span className="admin-tag">{p.products?.length || 0} SP</span>
                      </td>
                      <td>
                        {isActive(p)
                          ? <span className="admin-badge admin-badge-success">Đang chạy</span>
                          : p.isActive && new Date(p.startsAt) > Date.now()
                            ? <span className="admin-badge admin-badge-info">Sắp diễn ra</span>
                            : <span className="admin-badge admin-badge-gray">Đã kết thúc</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            id={`btn-edit-promo-${p.promotionId?.slice(0, 8)}`}
                            className="admin-btn admin-btn-ghost admin-btn-icon"
                            title="Chỉnh sửa"
                            onClick={() => setModal({ mode: 'edit', promotion: p })}
                          ><Edit2 size={14} /></button>
                          <button
                            className="admin-btn admin-btn-ghost admin-btn-icon"
                            title="Tắt khuyến mãi"
                            style={{ color: '#dc2626' }}
                            onClick={() => handleDelete(p.promotionId)}
                          ><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <span className="admin-pagination-info">
                Trang {pagination.page} / {totalPages || 1}
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
        <PromotionFormModal
          promotion={modal.promotion}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
