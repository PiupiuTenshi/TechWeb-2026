import { useEffect, useState, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, X, Truck, CheckCircle, Clock } from 'lucide-react'
import { adminOrdersApi } from '../../api/adminApi'

const formatCurrency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v ?? 0)

const ALL_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled']

const STATUS_MAP = {
  Pending: { label: 'Chờ xử lý', badge: 'admin-badge-warning' },
  Processing: { label: 'Đang xử lý', badge: 'admin-badge-info' },
  Shipped: { label: 'Đang giao', badge: 'admin-badge-purple' },
  Delivered: { label: 'Đã giao', badge: 'admin-badge-success' },
  Completed: { label: 'Hoàn thành', badge: 'admin-badge-success' },
  Cancelled: { label: 'Đã hủy', badge: 'admin-badge-danger' },
  Paid: { label: 'Đã thanh toán', badge: 'admin-badge-info' },
}

// ─── Update Status Modal ─────────────────────────────────────────────────────
function UpdateStatusModal({ order, onClose, onSaved }) {
  const [status, setStatus] = useState(order.status)
  const [note, setNote] = useState('')
  const [tracking, setTracking] = useState(order.trackingCode || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (status !== order.status) {
        await adminOrdersApi.updateStatus(order.orderId, status, note)
      }
      if (tracking !== order.trackingCode) {
        await adminOrdersApi.updateTracking(order.orderId, tracking)
      }
      onSaved()
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal">
        <div className="admin-modal-header">
          <span className="admin-modal-title">Cập nhật đơn hàng</span>
          <button className="admin-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            {error && <div className="admin-alert admin-alert-danger">{error}</div>}

            <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, fontSize: 13 }}>
              <div><strong>Khách hàng:</strong> {order.customer?.fullName || order.customer?.email || 'Khách'}</div>
              <div><strong>Tổng tiền:</strong> {formatCurrency(order.grandTotal)}</div>
              <div><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}</div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label required">Trạng thái mới</label>
              <select
                className="admin-form-select"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_MAP[s]?.label || s}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Mã vận đơn (tracking)</label>
              <input
                className="admin-form-input"
                value={tracking}
                onChange={e => setTracking(e.target.value)}
                placeholder="VD: GHN123456789"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Ghi chú</label>
              <textarea
                className="admin-form-textarea"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Lý do thay đổi trạng thái..."
                rows={2}
              />
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 15, total: 0 })
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminOrdersApi.list({
        status: statusFilter || undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      })
      setOrders(res.data || [])
      setPagination(p => ({ ...p, total: res.meta?.total || 0 }))
    } catch { /**/ }
    finally { setLoading(false) }
  }, [statusFilter, pagination.page, pagination.pageSize])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)

  const filtered = search
    ? orders.filter(o =>
        o.customer?.email?.toLowerCase().includes(search.toLowerCase()) ||
        o.customer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        o.trackingCode?.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý Đơn hàng</h1>
          <p>{pagination.total} đơn hàng</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="admin-tabs" style={{ overflowX: 'auto' }}>
        <button
          className={`admin-tab${statusFilter === '' ? ' active' : ''}`}
          onClick={() => { setStatusFilter(''); setPagination(p => ({ ...p, page: 1 })) }}
        >
          Tất cả
        </button>
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            className={`admin-tab${statusFilter === s ? ' active' : ''}`}
            onClick={() => { setStatusFilter(s); setPagination(p => ({ ...p, page: 1 })) }}
          >
            {STATUS_MAP[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-body" style={{ padding: '12px 16px' }}>
          <div className="admin-search-input-wrap" style={{ maxWidth: 400 }}>
            <Search size={15} className="admin-search-icon" />
            <input
              id="order-search"
              className="admin-form-input admin-search-input"
              placeholder="Tìm theo email, tên, mã vận đơn..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
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
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Tổng tiền</th>
                    <th>Mã vận đơn</th>
                    <th>Ngày đặt</th>
                    <th>Trạng thái</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="admin-empty">
                          <div className="admin-empty-icon">🛒</div>
                          <div className="admin-empty-title">Không có đơn hàng nào</div>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map(o => (
                    <tr key={o.orderId}>
                      <td>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#475569' }}>
                          {o.orderId?.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{o.customer?.fullName || 'Khách'}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{o.customer?.email}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#1d4ed8' }}>
                        {formatCurrency(o.grandTotal)}
                      </td>
                      <td>
                        {o.trackingCode
                          ? <span className="admin-tag"><Truck size={11} /> {o.trackingCode}</span>
                          : <span style={{ color: '#94a3b8' }}>—</span>
                        }
                      </td>
                      <td style={{ fontSize: 12, color: '#475569' }}>
                        {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td>
                        <span className={`admin-badge ${STATUS_MAP[o.status]?.badge || 'admin-badge-gray'}`}>
                          {STATUS_MAP[o.status]?.label || o.status}
                        </span>
                      </td>
                      <td>
                        <button
                          id={`btn-edit-order-${o.orderId?.slice(0, 8)}`}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => setEditing(o)}
                        >
                          Cập nhật
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <span className="admin-pagination-info">
                Trang {pagination.page} / {totalPages || 1} &bull; {pagination.total} đơn
              </span>
              <div className="admin-pagination-btns">
                <button
                  className="admin-page-btn"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                ><ChevronLeft size={14} /></button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pg => (
                  <button
                    key={pg}
                    className={`admin-page-btn${pagination.page === pg ? ' active' : ''}`}
                    onClick={() => setPagination(p => ({ ...p, page: pg }))}
                  >{pg}</button>
                ))}
                <button
                  className="admin-page-btn"
                  disabled={pagination.page >= totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                ><ChevronRight size={14} /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {editing && (
        <UpdateStatusModal
          order={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </div>
  )
}
