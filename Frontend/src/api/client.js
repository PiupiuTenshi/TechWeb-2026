let API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://techshop-backend-8sfu.onrender.com').replace(/\/$/, '')
const FALLBACK_URLS = [
  'https://techshop-backend-8sfu.onrender.com',
  'http://localhost:5000',
  'https://localhost:7188'
]

const AUTH_STORAGE_KEY = 'techshop_auth'
const SESSION_STORAGE_KEY = 'techshop_session_id'

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export function getAuthState() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setAuthState(auth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function clearAuthState() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

function getSessionId() {
  return localStorage.getItem(SESSION_STORAGE_KEY)
}

function setSessionId(sessionId) {
  if (sessionId) {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId)
  }
}

async function apiRequest(path, options = {}) {
  const auth = getAuthState()
  const sessionId = getSessionId()
  const headers = new Headers(options.headers || {})

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth?.accessToken) {
    headers.set('Authorization', `Bearer ${auth.accessToken}`)
  }

  if (sessionId) {
    headers.set('X-Session-Id', sessionId)
  }

  const fetchOptions = {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  }

  let response
  let lastError

  if (import.meta.env.VITE_API_URL) {
    response = await fetch(`${API_BASE_URL}${path}`, fetchOptions)
  } else {
    for (const url of FALLBACK_URLS) {
      try {
        response = await fetch(`${url}${path}`, fetchOptions)
        API_BASE_URL = url // Lưu lại URL thành công cho các request sau
        break
      } catch (err) {
        lastError = err
      }
    }
    if (!response) throw lastError
  }

  const responseSessionId = response.headers.get('X-Session-Id')
  setSessionId(responseSessionId)

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = payload?.message || payload?.error || 'Không thể kết nối máy chủ.'
    throw new ApiError(message, response.status, payload)
  }

  return payload
}

export const authApi = {
  async login(email, password) {
    const response = await apiRequest('/api/Auth/login', {
      method: 'POST',
      body: { email, password },
    })
    return response.data
  },

  async register({ email, password, fullName, phone }) {
    const response = await apiRequest('/api/Auth/register', {
      method: 'POST',
      body: { email, password, fullName, phone },
    })
    return response.data
  },

  async logout(refreshToken) {
    if (!refreshToken) return null
    const response = await apiRequest('/api/Auth/logout', {
      method: 'POST',
      body: { refreshToken },
    })
    return response.data
  },
}

export const productsApi = {
  async list(params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.set(key, value)
      }
    })
    const suffix = search.toString() ? `?${search}` : ''
    const response = await apiRequest(`/api/Products${suffix}`)
    return response
  },

  async detail(slug) {
    const response = await apiRequest(`/api/Products/${encodeURIComponent(slug)}`)
    return response.data
  },

  async categories() {
    const response = await apiRequest('/api/Categories')
    return response.data || []
  },
}

export const cartApi = {
  async get() {
    const response = await apiRequest('/api/Cart')
    return response.data
  },

  async addItem(variantId, quantity = 1) {
    const response = await apiRequest('/api/Cart/items', {
      method: 'POST',
      body: { variantId, quantity },
    })
    return response.data
  },

  async updateItem(cartItemId, quantity) {
    const response = await apiRequest(`/api/Cart/items/${cartItemId}`, {
      method: 'PUT',
      body: { quantity },
    })
    return response.data
  },

  async deleteItem(cartItemId) {
    const response = await apiRequest(`/api/Cart/items/${cartItemId}`, {
      method: 'DELETE',
    })
    return response.data
  },

  async applyCoupon(code) {
    const response = await apiRequest('/api/Cart/apply-coupon', {
      method: 'POST',
      body: { code },
    })
    return response.data
  },
}

export const ordersApi = {
  async create(order) {
    const response = await apiRequest('/api/Orders', {
      method: 'POST',
      body: order,
    })
    return response.data
  },

  async list() {
    const response = await apiRequest('/api/Orders')
    return response.data || []
  },
}

export const paymentsApi = {
  async createVnPay(orderId, returnUrl) {
    const response = await apiRequest('/api/Payments/vnpay/create', {
      method: 'POST',
      body: { orderId, returnUrl },
    })
    return response.data
  },

  async createMomo(orderId, returnUrl) {
    const response = await apiRequest('/api/Payments/momo/create', {
      method: 'POST',
      body: { orderId, returnUrl },
    })
    return response.data
  },

  async createZaloPay(orderId, returnUrl) {
    const response = await apiRequest('/api/Payments/zalopay/create', {
      method: 'POST',
      body: { orderId, returnUrl },
    })
    return response.data
  },

  async createBankTransfer(orderId, returnUrl) {
    const response = await apiRequest('/api/Payments/bank-transfer/create', {
      method: 'POST',
      body: { orderId, returnUrl },
    })
    return response.data
  },
}

export { API_BASE_URL }
