const DEFAULT_API_URLS = import.meta.env.DEV
  ? ['http://localhost:5000', 'https://localhost:7188', 'https://techshop-backend-8sfu.onrender.com']
  : ['https://techshop-backend-8sfu.onrender.com', 'http://localhost:5000', 'https://localhost:7188']

let API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URLS[0]).replace(/\/$/, '')
const FALLBACK_URLS = import.meta.env.VITE_API_URL
  ? [API_BASE_URL]
  : DEFAULT_API_URLS.map(url => url.replace(/\/$/, ''))

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
  return 'Khong the ket noi may chu.'
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

export function clearSessionId() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
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
    try {
      response = await fetch(`${API_BASE_URL}${path}`, fetchOptions)
    } catch (err) {
      throw new ApiError('Khong the ket noi backend local. Kiem tra backend dang chay dung port VITE_API_URL.', 0, err)
    }
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
        const retrySessionId = retryRes.headers.get('X-Session-Id')
        if (retrySessionId) setSessionId(retrySessionId)
        const retryText = await retryRes.text()
        const retryPayload = parseResponsePayload(retryText)

        if (!retryRes.ok) {
          if (retryRes.status === 404) {
            throw new ApiError(apiErrorMessage(retryPayload, retryRes.status), retryRes.status, retryPayload)
          }
          throw new ApiError(
            retryPayload?.message || retryPayload?.error || 'Không thể kết nối máy chủ.',
            retryRes.status,
            retryPayload,
          )
        }

        return retryPayload
      } catch {
        // Refresh + retry thất bại → throw lỗi gốc
      }
    }

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

  async googleLogin(credential) {
    const response = await apiRequest('/api/Auth/google-login', {
      method: 'POST',
      body: { credential },
    })
    return response.data
  },

  async changePassword(currentPassword, newPassword) {
    const response = await apiRequest('/api/Auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    })
    return response
  },

  async forgotPassword(email) {
    const response = await apiRequest('/api/Auth/forgot-password', {
      method: 'POST',
      body: { email },
    })
    return response
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
  async create({ receiverName, phone, shippingAddress, note, addressId, selectedCartItemIds }) {
    const response = await apiRequest('/api/Orders', {
      method: 'POST',
      body: {
        receiverName,
        phone,
        shippingAddress,
        note,
        addressId,
        selectedCartItemIds,
      },
    })
    return response.data
  },

  async list() {
    const response = await apiRequest('/api/Orders')
    return response.data || []
  },

  async detail(orderId) {
    const response = await apiRequest(`/api/Orders/${orderId}`)
    return response.data
  },

  async updateAddress(orderId, { receiverName, phone, shippingAddress }) {
    const response = await apiRequest(`/api/Orders/${orderId}/address`, {
      method: 'PATCH',
      body: { receiverName, phone, shippingAddress },
    })
    return response.data
  },

  async cancel(orderId, { reason, note } = {}) {
    const response = await apiRequest(`/api/Orders/${orderId}/cancel`, {
      method: 'PATCH',
      body: { reason, note },
    })
    return response.data
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

  async createQr(orderId, returnUrl) {
    const response = await apiRequest('/api/Payments/qr/create', {
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
}

export const userApi = {
  async getMe() {
    const response = await apiRequest('/api/Users/me')
    return response.data
  },

  async updateMe({ fullName, phone }) {
    const response = await apiRequest('/api/Users/me', {
      method: 'PUT',
      body: { fullName, phone },
    })
    return response.data
  },

  async listAddresses() {
    const response = await apiRequest('/api/Users/me/addresses')
    return response.data || []
  },

  async createAddress(address) {
    const response = await apiRequest('/api/Users/me/addresses', {
      method: 'POST',
      body: address,
    })
    return response.data
  },

  async updateAddress(addressId, address) {
    const response = await apiRequest(`/api/Users/me/addresses/${addressId}`, {
      method: 'PUT',
      body: address,
    })
    return response.data
  },

  async deleteAddress(addressId) {
    const response = await apiRequest(`/api/Users/me/addresses/${addressId}`, {
      method: 'DELETE',
    })
    return response.data
  },

  async setDefaultAddress(addressId) {
    const response = await apiRequest(`/api/Users/me/addresses/${addressId}/default`, {
      method: 'PATCH',
    })
    return response.data
  },
}

export { API_BASE_URL }
