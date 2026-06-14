import { useEffect, useState, useCallback } from 'react'
import { Search, PackagePlus, PackageMinus, SlidersHorizontal, History, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { inventoryApi } from '../../api/adminApi'

// ─── Stock Change Modal ──────────────────────────────────────────────────────
function StockModal({ item, mode, onClose, onSaved }) {
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const titles = { import: 'Nhập kho', export: 'Xuất kho', adjust: 'Điều chỉnh tồn kho' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!quantity || Number(quantity) < 0) { setError('Số lượng không hợp lệ.'); return }
    setSaving(true)
    setError('')
    try {
      if (mode === 'import') await inventoryApi.importStock(item.variantId, Number(quantity), note)
      else if (mode === 'export') await inventoryApi.exportStock(item.variantId, Number(quantity), note)
      else await inventoryApi.adjustStock(item.variantId, Number(quantity), note)
      onSaved()
    } catch (err) {
      setError(err.message || 'Lỗi thực hiện thao tác.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal">
        <div className="admin-modal-header">
          <span className="admin-modal-title">{titles[mode]}</span>
          <button className="admin-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            {error && <div className="admin-alert admin-alert-danger">{error}</div>}

            <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.productName}</div>
              <div style={{ color: '#475569' }}>SKU: <strong>{item.sku}</strong></div>
              {item.variantInfo && <div style={{ color: '#475569' }}>Biến thể: {item.variantInfo}</div>}
              <div style={{ marginTop: 6, display: 'flex', gap: 12 }}>
                <span>Tồn kho hiện tại: <strong style={{ color: item.quantity <= item.lowStockAlert ? '#d97706' : '#16a34a' }}>{item.quantity}</strong></span>
                <span>Cảnh báo thấp: <strong>{item.lowStockAlert}</strong></span>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label required">
                {mode === 'adjust' ? 'Số lượng tồn mới' : 'Số lượng'}
              </label>
              <input
                id="stock-quantity"
                className="admin-form-input"
                type="number"
                min={mode === 'adjust' ? 0 : 1}
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder={mode === 'adjust' ? 'Nhập số lượng tồn mới...' : 'Nhập số lượng...'}
                required
                autoFocus
              />
              {mode === 'export' && (
                <span className="admin-form-error">Tối đa {item.quantity} sản phẩm</span>
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Ghi chú</label>
              <textarea
                className="admin-form-textarea"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Lý do nhập/xuất/điều chỉnh..."
                rows={2}
              />
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Hủy</button>
            <button
              type="submit"
              className={`admin-btn ${mode === 'export' ? 'admin-btn-danger' : mode === 'import' ? 'admin-btn-success' : 'admin-btn-primary'}`}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : titles[mode]}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Inventory Logs Modal ────────────────────────────────────────────────────
function LogsModal({ item, onClose }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await inventoryApi.getLogs({ variantId: item.variantId, page, pageSize })
        setLogs(res.data || [])
        setTotal(res.meta?.total || 0)
      } catch { /**/ }
      finally { setLoading(false) }
    }
    load()
  }, [item.variantId, page])

  const typeMap = { Import: { label: 'Nhập kho', color: '#16a34a' }, Export: { label: 'Xuất kho', color: '#dc2626' }, Adjust: { label: 'Điều chỉnh', color: '#1d4ed8' } }

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal admin-modal-lg">
        <div className="admin-modal-header">
          <span className="admin-modal-title">Lịch sử kho — {item.productName}</span>
          <button className="admin-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="admin-modal-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="admin-loading"><div className="admin-spinner" /></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Loại</th>
                    <th>Số lượng</th>
                    <th>Ghi chú</th>
                    <th>Người thực hiện</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Chưa có lịch sử</td></tr>
                  ) : logs.map(l => (
                    <tr key={l.logId}>
                      <td>
                        <span style={{ fontWeight: 700, color: typeMap[l.changeType]?.color || '#475569', fontSize: 12 }}>
                          {typeMap[l.changeType]?.label || l.changeType}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: l.quantity > 0 ? '#16a34a' : '#dc2626' }}>
                        {l.quantity > 0 ? '+' : ''}{l.quantity}
                      </td>
                      <td style={{ fontSize: 12, color: '#475569' }}>{l.note || '—'}</td>
                      <td style={{ fontSize: 12 }}>{l.createdByName || 'Hệ thống'}</td>
                      <td style={{ fontSize: 11, color: '#94a3b8' }}>
                        {new Date(l.createdAt).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {total > pageSize && (
          <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
            <button className="admin-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14}/></button>
            <span style={{ fontSize: 13, color: '#475569', padding: '0 8px' }}>Trang {page} / {Math.ceil(total / pageSize)}</span>
            <button className="admin-page-btn" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(p => p + 1)}><ChevronRight size={14}/></button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminInventory() {
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stockModal, setStockModal] = useState(null) // { item, mode }
  const [logsModal, setLogsModal] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await inventoryApi.list({
        keyword: search || undefined,
        lowStock: lowStockOnly || undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      })
      setItems(res.data || [])
      setPagination(p => ({ ...p, total: res.meta?.total || 0 }))
    } catch { /**/ }
    finally { setLoading(false) }
  }, [search, lowStockOnly, pagination.page, pagination.pageSize])

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [load])

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý Kho hàng</h1>
          <p>{pagination.total} SKU trong kho</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-body" style={{ padding: '12px 16px' }}>
          <div className="admin-search-bar">
            <div className="admin-search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
              <Search size={15} className="admin-search-icon" />
              <input
                id="inventory-search"
                className="admin-form-input admin-search-input"
                placeholder="Tìm theo tên sản phẩm, SKU, thương hiệu..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
              />
            </div>
            <label className="admin-switch">
              <input
                id="low-stock-filter"
                type="checkbox"
                checked={lowStockOnly}
                onChange={e => { setLowStockOnly(e.target.checked); setPagination(p => ({ ...p, page: 1 })) }}
              />
              <span className="admin-switch-track" />
              <span style={{ color: '#d97706', fontWeight: 700 }}>⚠️ Chỉ sắp hết hàng</span>
            </label>
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
                    <th>Sản phẩm</th>
                    <th>SKU</th>
                    <th>Biến thể</th>
                    <th>Tồn kho</th>
                    <th>Cảnh báo</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật</th>
                    <th style={{ width: 160 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="admin-empty">
                          <div className="admin-empty-icon">📦</div>
                          <div className="admin-empty-title">Không tìm thấy kết quả</div>
                        </div>
                      </td>
                    </tr>
                  ) : items.map(item => {
                    const isLow = item.quantity > 0 && item.quantity <= item.lowStockAlert
                    const isOut = item.quantity === 0
                    return (
                      <tr key={item.inventoryId}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.productName}
                          </div>
                          {item.brand && <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.brand}</div>}
                        </td>
                        <td><span className="admin-tag" style={{ fontFamily: 'monospace' }}>{item.sku}</span></td>
                        <td style={{ fontSize: 12, color: '#475569' }}>{item.variantInfo || '—'}</td>
                        <td>
                          <span className={isOut ? 'stock-out' : isLow ? 'stock-low' : 'stock-ok'} style={{ fontSize: 18, fontWeight: 800 }}>
                            {item.quantity}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: '#64748b' }}>{item.lowStockAlert}</td>
                        <td>
                          {isOut ? (
                            <span className="admin-badge admin-badge-danger">Hết hàng</span>
                          ) : isLow ? (
                            <span className="admin-badge admin-badge-warning">Sắp hết</span>
                          ) : (
                            <span className="admin-badge admin-badge-success">Còn hàng</span>
                          )}
                        </td>
                        <td style={{ fontSize: 11, color: '#94a3b8' }}>
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              id={`btn-import-${item.sku}`}
                              className="admin-btn admin-btn-success admin-btn-sm"
                              title="Nhập kho"
                              onClick={() => setStockModal({ item, mode: 'import' })}
                            >
                              <PackagePlus size={13} />
                            </button>
                            <button
                              id={`btn-export-${item.sku}`}
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                              title="Xuất kho"
                              onClick={() => setStockModal({ item, mode: 'export' })}
                            >
                              <PackageMinus size={13} />
                            </button>
                            <button
                              id={`btn-adjust-${item.sku}`}
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                              title="Điều chỉnh"
                              onClick={() => setStockModal({ item, mode: 'adjust' })}
                            >
                              <SlidersHorizontal size={13} />
                            </button>
                            <button
                              id={`btn-logs-${item.sku}`}
                              className="admin-btn admin-btn-ghost admin-btn-sm"
                              title="Lịch sử"
                              onClick={() => setLogsModal(item)}
                            >
                              <History size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <span className="admin-pagination-info">
                Trang {pagination.page} / {totalPages || 1} &bull; {pagination.total} SKU
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

      {stockModal && (
        <StockModal
          item={stockModal.item}
          mode={stockModal.mode}
          onClose={() => setStockModal(null)}
          onSaved={() => { setStockModal(null); load() }}
        />
      )}

      {logsModal && (
        <LogsModal item={logsModal} onClose={() => setLogsModal(null)} />
      )}
    </div>
  )
}
