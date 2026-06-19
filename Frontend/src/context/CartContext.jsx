/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { cartApi } from '../api/client'
import { mapCart } from '../api/mappers'

const CartContext = createContext(null)
const CART_SELECTION_STORAGE_KEY = 'techshop_cart_selected_ids'

function selectedMap(items) {
  return Object.fromEntries(items.map(item => [item.id, item.selected]))
}

function readStoredSelection() {
  try {
    const raw = localStorage.getItem(CART_SELECTION_STORAGE_KEY)
    const ids = raw ? JSON.parse(raw) : []
    return Object.fromEntries(Array.isArray(ids) ? ids.map(id => [id, true]) : [])
  } catch {
    return {}
  }
}

function storeSelection(items) {
  try {
    const ids = items.filter(item => item.selected).map(item => item.id)
    localStorage.setItem(CART_SELECTION_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // ignore storage errors
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Ref để tránh stale closure khi handleAuthChanged dùng items
  const itemsRef = useRef(items)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const applyCart = useCallback((cart, nextSelected = null, fallbackSelected = false) => {
    setItems(prev => {
      const selection = nextSelected || (prev.length > 0 ? selectedMap(prev) : readStoredSelection())
      return mapCart(cart, selection, fallbackSelected)
    })
  }, [])

  useEffect(() => {
    if (!loading) {
      storeSelection(items)
    }
  }, [items, loading])

  const refresh = useCallback(async (fallbackSelected = false) => {
    setLoading(true)
    setError('')
    try {
      const cart = await cartApi.get()
      applyCart(cart, null, fallbackSelected)
    } catch (err) {
      setError(err.message || 'Không tải được giỏ hàng.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [applyCart])

  useEffect(() => {
    queueMicrotask(() => refresh(false))
  }, [refresh])

  useEffect(() => {
    async function handleAuthChanged(event) {
      if (event.detail?.type === 'login') {
        const snapshot = itemsRef.current
        if (snapshot.length > 0) {
          try {
            const serverCart = await cartApi.get()
            const serverItems = Array.from(serverCart?.items || [])
            const serverVariantIds = new Set(serverItems.map(i => i.variantId))
            const newItems = snapshot.filter(item => !serverVariantIds.has(item.variantId))
            await Promise.all(newItems.map(item => cartApi.addItem(item.variantId, item.quantity)))
          } catch {
            // ignore
          }
        }
        await refresh(false)
        return
      }

      if (event.detail?.type === 'logout') {
        setItems([])
        await refresh(false)
      }
    }

    window.addEventListener('techshop-auth-changed', handleAuthChanged)
    return () => window.removeEventListener('techshop-auth-changed', handleAuthChanged)
  }, [refresh])

  const addToCart = useCallback(async (product, selected = true) => {
    if (!product.variantId) {
      throw new Error('Sản phẩm này chưa có biến thể để thêm vào giỏ.')
    }
    const cart = await cartApi.addItem(product.variantId, 1)
    const nextItems = mapCart(cart, selectedMap(items), false)
    const nextSelected = Object.fromEntries(nextItems.map(item => [
      item.id,
      item.variantId === product.variantId ? selected : item.selected,
    ]))
    applyCart(cart, nextSelected, false)
  }, [applyCart, items])

  const buyNow = useCallback(async (product) => {
    if (!product.variantId) {
      throw new Error('Sản phẩm này chưa có biến thể để mua ngay.')
    }
    const cart = await cartApi.addItem(product.variantId, 1)
    const nextItems = mapCart(cart, {}, false)
    const nextSelected = Object.fromEntries(nextItems.map(item => [
      item.id,
      item.variantId === product.variantId,
    ]))
    applyCart(cart, nextSelected, false)
  }, [applyCart])

  const removeFromCart = useCallback(async (id) => {
    const cart = await cartApi.deleteItem(id)
    applyCart(cart)
  }, [applyCart])

  const updateQuantity = useCallback(async (id, quantity) => {
    if (quantity < 1) {
      const cart = await cartApi.deleteItem(id)
      applyCart(cart)
      return
    }
    const cart = await cartApi.updateItem(id, quantity)
    applyCart(cart)
  }, [applyCart])

  const toggleSelected = useCallback((id) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item))
  }, [])

  const setAllSelected = useCallback((selected) => {
    setItems(prev => prev.map(item => ({ ...item, selected })))
  }, [])

  const selectCartItems = useCallback((ids) => {
    const selectedIds = new Set(ids)
    setItems(prev => prev.map(item => ({ ...item, selected: selectedIds.has(item.id) })))
  }, [])

  const removeSelected = useCallback(async () => {
    const selected = items.filter(item => item.selected)
    await Promise.all(selected.map(item => cartApi.deleteItem(item.id)))
    await refresh(false)
  }, [items, refresh])

  const clearCartState = useCallback(() => {
    setItems([])
  }, [])

  const selectedItems = items.filter(item => item.selected)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const allSelected = items.length > 0 && items.every(item => item.selected)
  const subtotal = selectedItems.reduce((sum, item) => sum + item.salePrice * item.quantity, 0)
  const originalTotal = selectedItems.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0)
  const discount = Math.max(0, originalTotal - subtotal)

  const value = useMemo(() => ({
    items,
    loading,
    error,
    totalItems,
    selectedItems,
    allSelected,
    subtotal,
    originalTotal,
    discount,
    refresh,
    addToCart,
    buyNow,
    removeFromCart,
    updateQuantity,
    toggleSelected,
    setAllSelected,
    selectCartItems,
    removeSelected,
    clearCartState,
  }), [
    items,
    loading,
    error,
    totalItems,
    selectedItems,
    allSelected,
    subtotal,
    originalTotal,
    discount,
    refresh,
    addToCart,
    buyNow,
    removeFromCart,
    updateQuantity,
    toggleSelected,
    setAllSelected,
    selectCartItems,
    removeSelected,
    clearCartState,
  ])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
