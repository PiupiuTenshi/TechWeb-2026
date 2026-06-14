// Admin API — maps to all backend admin controller endpoints
import { getAuthState } from './client'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://techshop-backend-8sfu.onrender.com').replace(/\/$/, '')

export class AdminApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
    this.payload = payload
  }
}

async function adminRequest(path, options = {}) {
  const auth = getAuthState()
  const headers = new Headers(options.headers || {})

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth?.accessToken) {
    headers.set('Authorization', `Bearer ${auth.accessToken}`)
  }

  const body = options.body instanceof FormData
    ? options.body
    : options.body !== undefined
      ? JSON.stringify(options.body)
      : undefined

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body,
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = payload?.message || payload?.error || 'Lỗi máy chủ.'
    throw new AdminApiError(message, response.status, payload)
  }

  return payload
}

// ─── Dashboard / Reports ────────────────────────────────────────────────────

export const reportsApi = {
  async getRevenue(params = {}) {
    const q = new URLSearchParams()
    if (params.from) q.set('from', params.from)
    if (params.to) q.set('to', params.to)
    if (params.groupBy) q.set('groupBy', params.groupBy)
    const res = await adminRequest(`/api/admin/reports/revenue?${q}`)
    return res.data
  },

  async getTopProducts(params = {}) {
    const q = new URLSearchParams()
    if (params.from) q.set('from', params.from)
    if (params.to) q.set('to', params.to)
    if (params.take) q.set('take', params.take)
    const res = await adminRequest(`/api/admin/reports/top-products?${q}`)
    return res.data || []
  },

  async getLowStock(params = {}) {
    const q = new URLSearchParams()
    if (params.threshold) q.set('threshold', params.threshold)
    if (params.take) q.set('take', params.take)
    const res = await adminRequest(`/api/admin/reports/low-stock?${q}`)
    return res.data || []
  },

  getExportUrl(params = {}) {
    const q = new URLSearchParams()
    if (params.from) q.set('from', params.from)
    if (params.to) q.set('to', params.to)
    if (params.groupBy) q.set('groupBy', params.groupBy)
    return `${API_BASE_URL}/api/admin/reports/revenue/export?${q}`
  },
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export const adminOrdersApi = {
  async list(params = {}) {
    const q = new URLSearchParams()
    if (params.status) q.set('status', params.status)
    if (params.page) q.set('page', params.page)
    if (params.pageSize) q.set('pageSize', params.pageSize)
    const res = await adminRequest(`/api/admin/orders?${q}`)
    return res
  },

  async updateStatus(id, status, note = '') {
    const res = await adminRequest(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: { status, note },
    })
    return res.data
  },

  async updateTracking(id, trackingCode) {
    const res = await adminRequest(`/api/admin/orders/${id}/tracking`, {
      method: 'PUT',
      body: { trackingCode },
    })
    return res.data
  },
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export const inventoryApi = {
  async list(params = {}) {
    const q = new URLSearchParams()
    if (params.keyword) q.set('keyword', params.keyword)
    if (params.lowStock) q.set('lowStock', 'true')
    if (params.page) q.set('page', params.page)
    if (params.pageSize) q.set('pageSize', params.pageSize)
    const res = await adminRequest(`/api/admin/inventory?${q}`)
    return res
  },

  async getLogs(params = {}) {
    const q = new URLSearchParams()
    if (params.variantId) q.set('variantId', params.variantId)
    if (params.changeType) q.set('changeType', params.changeType)
    if (params.page) q.set('page', params.page)
    if (params.pageSize) q.set('pageSize', params.pageSize)
    const res = await adminRequest(`/api/admin/inventory/logs?${q}`)
    return res
  },

  async importStock(variantId, quantity, note = '') {
    const res = await adminRequest('/api/admin/inventory/import', {
      method: 'POST',
      body: { variantId, quantity, note },
    })
    return res.data
  },

  async exportStock(variantId, quantity, note = '') {
    const res = await adminRequest('/api/admin/inventory/export', {
      method: 'POST',
      body: { variantId, quantity, note },
    })
    return res.data
  },

  async adjustStock(variantId, quantity, note = '') {
    const res = await adminRequest('/api/admin/inventory/adjust', {
      method: 'PATCH',
      body: { variantId, quantity, note },
    })
    return res.data
  },
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const adminUsersApi = {
  async list(params = {}) {
    const q = new URLSearchParams()
    if (params.search) q.set('search', params.search)
    if (params.roleId) q.set('roleId', params.roleId)
    if (params.active !== undefined) q.set('active', params.active)
    if (params.page) q.set('page', params.page)
    if (params.pageSize) q.set('pageSize', params.pageSize)
    const res = await adminRequest(`/api/admin/users?${q}`)
    return res
  },

  async get(id) {
    const res = await adminRequest(`/api/admin/users/${id}`)
    return res.data
  },

  async create(dto) {
    const res = await adminRequest('/api/admin/users', {
      method: 'POST',
      body: dto,
    })
    return res.data
  },

  async update(id, dto) {
    const res = await adminRequest(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: dto,
    })
    return res.data
  },

  async updateStatus(id, isActive) {
    const res = await adminRequest(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: { isActive },
    })
    return res.data
  },

  async changePassword(id, password) {
    const res = await adminRequest(`/api/admin/users/${id}/password`, {
      method: 'PATCH',
      body: { password },
    })
    return res.data
  },

  async delete(id) {
    const res = await adminRequest(`/api/admin/users/${id}`, {
      method: 'DELETE',
    })
    return res.data
  },
}

// ─── Products (Admin) ────────────────────────────────────────────────────────

export const adminProductsApi = {
  async list(params = {}) {
    const q = new URLSearchParams()
    if (params.category) q.set('category', params.category)
    if (params.brand) q.set('brand', params.brand)
    if (params.page) q.set('page', params.page)
    if (params.pageSize) q.set('pageSize', params.pageSize)
    const res = await adminRequest(`/api/Products?${q}`)
    return res
  },

  async get(slug) {
    const res = await adminRequest(`/api/Products/${encodeURIComponent(slug)}`)
    return res.data
  },

  async create(dto) {
    const res = await adminRequest('/api/Products', {
      method: 'POST',
      body: dto,
    })
    return res.data
  },

  async update(id, dto) {
    const res = await adminRequest(`/api/Products/${id}`, {
      method: 'PUT',
      body: dto,
    })
    return res.data
  },

  async delete(id) {
    const res = await adminRequest(`/api/Products/${id}`, {
      method: 'DELETE',
    })
    return res.data
  },

  async categories() {
    const res = await adminRequest('/api/Categories')
    return res.data || []
  },
}

// ─── Promotions ──────────────────────────────────────────────────────────────

export const adminPromotionsApi = {
  async list(params = {}) {
    const q = new URLSearchParams()
    if (params.active !== undefined) q.set('active', params.active)
    if (params.page) q.set('page', params.page)
    if (params.pageSize) q.set('pageSize', params.pageSize)
    const res = await adminRequest(`/api/Promotions?${q}`)
    return res
  },

  async get(id) {
    const res = await adminRequest(`/api/Promotions/${id}`)
    return res.data
  },

  async create(dto) {
    const res = await adminRequest('/api/Promotions', {
      method: 'POST',
      body: dto,
    })
    return res.data
  },

  async update(id, dto) {
    const res = await adminRequest(`/api/Promotions/${id}`, {
      method: 'PUT',
      body: dto,
    })
    return res.data
  },

  async delete(id) {
    const res = await adminRequest(`/api/Promotions/${id}`, {
      method: 'DELETE',
    })
    return res.data
  },
}
