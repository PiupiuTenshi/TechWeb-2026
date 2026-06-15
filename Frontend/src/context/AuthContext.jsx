/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { authApi, clearAuthState, getAuthState, setAuthState } from '../api/client'

const AuthContext = createContext(null)

function normalizeUser(user) {
  if (!user) return null
  const roleName = user.roleName || user.role || user.Role
  return {
    ...user,
    fullName: user.fullName || user.email,
    roleName,
  }
}

export function AuthProvider({ children }) {
  const storedAuth = getAuthState()
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState('login')
  const [user, setUser] = useState(() => normalizeUser(storedAuth?.user))
  const [tokens, setTokens] = useState(() => storedAuth ? {
    accessToken: storedAuth.accessToken,
    refreshToken: storedAuth.refreshToken,
  } : null)

  const openLogin = useCallback(() => {
    setMode('login')
    setIsOpen(true)
  }, [])

  const openRegister = useCallback(() => {
    setMode('register')
    setIsOpen(true)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  const saveSession = useCallback((session) => {
    const normalizedUser = normalizeUser(session.user)
    const nextTokens = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    }
    setUser(normalizedUser)
    setTokens(nextTokens)
    setAuthState({ ...nextTokens, user: normalizedUser })
    window.dispatchEvent(new CustomEvent('techshop-auth-changed', { detail: { type: 'login' } }))
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const session = await authApi.login(email, password)
      saveSession(session)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message || 'Email hoặc mật khẩu không đúng.' }
    }
  }, [saveSession])

  const register = useCallback(async ({ email, password, fullName, phone }) => {
    try {
      await authApi.register({ email, password, fullName, phone })
      const session = await authApi.login(email, password)
      saveSession(session)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message || 'Không thể tạo tài khoản.' }
    }
  }, [saveSession])

  const logout = useCallback(async () => {
    const refreshToken = tokens?.refreshToken
    setUser(null)
    setTokens(null)
    clearAuthState()
    window.dispatchEvent(new CustomEvent('techshop-auth-changed', { detail: { type: 'logout' } }))
    try {
      await authApi.logout(refreshToken)
    } catch {
      // Logout should clear the local session even if the server token was already invalid.
    }
  }, [tokens])

  const updateUser = useCallback((fields) => {
    setUser(prev => {
      if (!prev) return prev
      const nextUser = { ...prev, ...fields }
      const auth = getAuthState()
      if (auth) {
        setAuthState({ ...auth, user: nextUser })
      }
      return nextUser
    })
  }, [])

  const value = useMemo(() => ({
    isOpen,
    mode,
    user,
    tokens,
    openLogin,
    openRegister,
    close,
    login,
    register,
    logout,
    updateUser,
  }), [isOpen, mode, user, tokens, openLogin, openRegister, close, login, register, logout, updateUser])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
