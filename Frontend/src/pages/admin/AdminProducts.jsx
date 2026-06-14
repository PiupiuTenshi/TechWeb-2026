import { useEffect, useState, useCallback } from 'react'
import {
  Search, Plus, Edit2, Trash2, Eye, ToggleLeft, ToggleRight, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import { adminProductsApi } from '../../api/adminApi'

const formatCurrency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v ?? 0)

// ─── Product Form Modal ──────────────────────────────────────────────────────
function ProductFormModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    brand: product?.brand || '',
    categoryId: product?.category?.categoryId || '',
    basePrice: product?.basePrice || '',
    salePrice: product?.salePrice || '',
    thumbnailUrl: product?.thumbnailUrl || '',
    description: product?.description || '',
    tags: product?.tags || '',
    isFeatured: product?.isFeatured || false,
    isActive: product?.isActive ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const autoSlug = (name) =>
    name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/[^a-z0-9 ]/g, '')
      .trim().replace(/\s+/g, '-')

  const handleNameChange = (v) => {
    handleChange('name', v)
    if (!isEdit) handleChange('slug', autoSlug(v))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        basePrice: Number(form.basePrice),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        images: [],
        specifications: [],
        variants: [],
      }
      if (isEdit) {
        await adminProductsApi.update(product.productId, payload)
      } else {
        await adminProductsApi.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu sản phẩm.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal admin-modal-lg">
        <div className="admin-modal-header">
          <span className="admin-modal-title">{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</span>
          <button className="admin-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            {error && <div className="admin-alert admin-alert-danger">{error}</div>}

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label required">Tên sản phẩm</label>
                <input
                  className="admin-form-input"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="VD: iPhone 15 Pro Max"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label required">Slug</label>
                <input
                  className="admin-form-input"
                  value={form.slug}
                  onChange={e => handleChange('slug', e.target.value)}
                  placeholder="vd: iphone-15-pro-max"
                  required
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label required">Thương hiệu</label>
                <input
                  className="admin-form-input"
                  value={form.brand}
                  onChange={e => handleChange('brand', e.target.value)}
                  placeholder="VD: Apple"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label required">Danh mục</label>
                <select
                  className="admin-form-select"
                  value={form.categoryId}
                  onChange={e => handleChange('categoryId', e.target.value)}
                  required
                >
                  <option value="">— Chọn danh mục —</option>
                  {categories.map(c => (
                    <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label required">Giá gốc (VND)</label>
                <input
                  className="admin-form-input" type="number" min="0"
                  value={form.basePrice}
                  onChange={e => handleChange('basePrice', e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Giá khuyến mãi (VND)</label>
                <input
                  className="admin-form-input" type="number" min="0"
                  value={form.salePrice}
                  onChange={e => handleChange('salePrice', e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">URL ảnh thumbnail</label>
              <input
                className="admin-form-input"
                value={form.thumbnailUrl}
                onChange={e => handleChange('thumbnailUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Mô tả</label>
              <textarea
                className="admin-form-textarea"
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Tags</label>
              <input
                className="admin-form-input"
                value={form.tags}
                onChange={e => handleChange('tags', e.target.value)}
                placeholder="5G, flagship, ..."
              />
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <label className="admin-switch">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => handleChange('isFeatured', e.target.checked)}
                />
                <span className="admin-switch-track" />
                Sản phẩm nổi bật
              </label>
              {isEdit && (
                <label className="admin-switch">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => handleChange('isActive', e.target.checked)}
                  />
                  <span className="admin-switch-track" />
                  Đang bán
                </label>
              )}
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 15, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [modal, setModal] = useState(null) // null | { mode: 'add'|'edit', product }
  const [deleteId, setDeleteId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [res, cats] = await Promise.all([
        adminProductsApi.list({ category: filterCat || undefined, page: pagination.page, pageSize: pagination.pageSize }),
        adminProductsApi.categories(),
      ])
      setProducts(res.data || [])
      setPagination(p => ({ ...p, total: res.meta?.total || 0 }))
      setCategories(cats)
    } catch { /**/ }
    finally { setLoading(false) }
  }, [pagination.page, pagination.pageSize, filterCat])

  useEffect(() => { load() }, [load])

  const handleSaved = () => { setModal(null); load() }

  const handleDelete = async (id) => {
    try { await adminProductsApi.delete(id) } catch { /**/ }
    setDeleteId(null); load()
  }

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)

  const filteredProducts = search
    ? products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase())
      )
    : products

  return (
    <div className="admin-content">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>Quản lý Sản phẩm</h1>
          <p>{pagination.total} sản phẩm trong hệ thống</p>
        </div>
        <button
          id="btn-add-product"
          className="admin-btn admin-btn-primary"
          onClick={() => setModal({ mode: 'add', product: null })}
        >
          <Plus size={15} /> Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-body" style={{ padding: '12px 16px' }}>
          <div className="admin-search-bar">
            <div className="admin-search-input-wrap">
              <Search size={15} className="admin-search-icon" />
              <input
                id="product-search"
                className="admin-form-input admin-search-input"
                placeholder="Tìm theo tên, thương hiệu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              id="product-category-filter"
              className="admin-form-select"
              style={{ width: 180 }}
              value={filterCat}
              onChange={e => { setFilterCat(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(c => (
                <option key={c.categoryId} value={c.slug}>{c.name}</option>
              ))}
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
                    <th style={{ width: 52 }}></th>
                    <th>Sản phẩm</th>
                    <th>Thương hiệu</th>
                    <th>Danh mục</th>
                    <th>Giá gốc</th>
                    <th>Giá KM</th>
                    <th>Trạng thái</th>
                    <th style={{ width: 120 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="admin-empty">
                          <div className="admin-empty-icon">📦</div>
                          <div className="admin-empty-title">Chưa có sản phẩm</div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.map(p => (
                    <tr key={p.productId}>
                      <td>
                        {p.thumbnailUrl ? (
                          <img
                            src={p.thumbnailUrl}
                            alt={p.name}
                            style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, background: '#f8fafc' }}
                          />
                        ) : (
                          <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.slug}</div>
                      </td>
                      <td><span className="admin-tag">{p.brand}</span></td>
                      <td style={{ fontSize: 12, color: '#475569' }}>{p.category?.name || '—'}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(p.basePrice)}</td>
                      <td style={{ color: '#dc2626', fontWeight: 700 }}>
                        {p.salePrice ? formatCurrency(p.salePrice) : <span style={{ color: '#94a3b8' }}>—</span>}
                      </td>
                      <td>
                        {p.isFeatured && (
                          <span className="admin-badge admin-badge-purple" style={{ marginBottom: 4, display: 'inline-flex' }}>
                            ⭐ Nổi bật
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className="admin-btn admin-btn-ghost admin-btn-icon"
                            title="Chỉnh sửa"
                            onClick={() => setModal({ mode: 'edit', product: p })}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="admin-btn admin-btn-ghost admin-btn-icon"
                            title="Xóa"
                            style={{ color: '#dc2626' }}
                            onClick={() => setDeleteId(p.productId)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="admin-pagination">
              <span className="admin-pagination-info">
                Trang {pagination.page} / {totalPages || 1} &bull; {pagination.total} sản phẩm
              </span>
              <div className="admin-pagination-btns">
                <button
                  className="admin-page-btn"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pg => (
                  <button
                    key={pg}
                    className={`admin-page-btn${pagination.page === pg ? ' active' : ''}`}
                    onClick={() => setPagination(p => ({ ...p, page: pg }))}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  className="admin-page-btn"
                  disabled={pagination.page >= totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <ProductFormModal
          product={modal.product}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteId && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">Xác nhận xóa</span>
              <button className="admin-modal-close" onClick={() => setDeleteId(null)}><X size={16} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-alert admin-alert-danger">
                Bạn có chắc muốn ẩn sản phẩm này? Hành động này không thể hoàn tác.
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(deleteId)}>Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
