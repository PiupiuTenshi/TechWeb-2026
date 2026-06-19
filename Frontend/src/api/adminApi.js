// Admin API — maps to all backend admin controller endpoints
import { getAuthState, clearAuthState, setAuthState } from './client'

const DEFAULT_API_URLS = import.meta.env.DEV
  ? ['http://localhost:5000', 'https://localhost:7188', 'https://techshop-backend-8sfu.onrender.com']
  : ['https://techshop-backend-8sfu.onrender.com', 'http://localhost:5000', 'https://localhost:7188']

let API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URLS[0]).replace(/\/$/, '')
const FALLBACK_URLS = import.meta.env.VITE_API_URL
  ? [API_BASE_URL]
  : DEFAULT_API_URLS.map(url => url.replace(/\/$/, ''))

export class AdminApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
    this.payload = payload
  }
}

const REFRESH_SUBSCRIBERS = []
let REFRESHING = false
let REFRESH_PROMISE = null

function onRefreshed(token) {
  REFRESH_SUBSCRIBERS.forEach(cb => cb(token))
  REFRESH_SUBSCRIBERS.length = 0
}

function parseResponsePayload(text) {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

function apiErrorMessage(payload, status) {
  if (payload?.message) return payload.message
  if (payload?.error) return payload.error
  if (status === 404) return 'Endpoint API khong ton tai. Hay restart backend de nap code moi.'
  if (status === 401) return 'Phien dang nhap da het han. Vui long dang nhap lai.'
  return 'Loi may chu.'
}

async function _doRefresh() {
  const auth = getAuthState()
  if (!auth?.refreshToken) throw new Error('No refresh token')

  const res = await fetch(`${API_BASE_URL}/api/Auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: auth.refreshToken }),
  })

  const text = await res.text()
  const data = parseResponsePayload(text)

  if (!res.ok) {
    clearAuthState()
    window.dispatchEvent(new CustomEvent('techshop-auth-changed', { detail: { type: 'logout' } }))
    throw new Error(data?.message || 'Refresh token hết hạn.')
  }

  const newAuth = {
    accessToken: data.data.accessToken,
    refreshToken: data.data.refreshToken,
    user: data.data.user,
  }
  setAuthState(newAuth)
  window.dispatchEvent(new CustomEvent('techshop-auth-changed', { detail: { type: 'token-refreshed', user: data.data.user } }))
  return data.data.accessToken
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

  const fetchOptions = {
    ...options,
    headers,
    body,
  }

  let response
  let lastError

  if (import.meta.env.VITE_API_URL) {
    try {
      response = await fetch(`${API_BASE_URL}${path}`, fetchOptions)
    } catch (err) {
      throw new AdminApiError('Khong the ket noi backend local. Kiem tra backend dang chay dung port VITE_API_URL.', 0, err)
    }
  } else {
    for (const url of FALLBACK_URLS) {
      try {
        response = await fetch(`${url}${path}`, fetchOptions)
        API_BASE_URL = url
        break
      } catch (err) {
        lastError = err
      }
    }
    if (!response) throw lastError
  }

  const text = await response.text()
  const payload = parseResponsePayload(text)

  if (!response.ok) {
    if (response.status === 401 && auth?.refreshToken && !path.toLowerCase().includes('/auth/')) {
      try {
        if (!REFRESHING) {
          REFRESHING = true
          REFRESH_PROMISE = _doRefresh()
            .then(token => { onRefreshed(token); return token })
            .catch(err => { onRefreshed(null); throw err })
            .finally(() => { REFRESHING = false; REFRESH_PROMISE = null })
        }
        const newToken = await REFRESH_PROMISE

        headers.set('Authorization', `Bearer ${newToken}`)
        const retryRes = await fetch(`${API_BASE_URL}${path}`, fetchOptions)
        const retryText = await retryRes.text()
        const retryPayload = parseResponsePayload(retryText)

        if (!retryRes.ok) {
          if (retryRes.status === 404) {
            throw new AdminApiError(apiErrorMessage(retryPayload, retryRes.status), retryRes.status, retryPayload)
          }
          throw new AdminApiError(
            retryPayload?.message || retryPayload?.error || 'Lỗi máy chủ.',
            retryRes.status,
            retryPayload,
          )
        }

        return retryPayload
      } catch {
        // Refresh + retry thất bại → throw lỗi gốc
      }
    }

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
