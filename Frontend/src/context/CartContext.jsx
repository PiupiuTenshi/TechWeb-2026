import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'techshop_cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Cart item shape:
 * {
 *   id:            number   — product id
 *   name:          string
 *   image:         string
 *   salePrice:     number
 *   originalPrice: number
 *   brand:         string
 *   quantity:      number
 *   selected:      boolean
 * }
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  /** Add a product to cart (or increment if already there) */
  const addToCart = useCallback((product, selected = true) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [
        ...prev,
        {
          id:            product.id,
          name:          product.name,
          image:         product.image,
          salePrice:     product.salePrice,
          originalPrice: product.originalPrice,
          brand:         product.brand,
          quantity:      1,
          selected,
        },
      ]
    })
  }, [])

  /**
   * Buy now — deselects every other item, adds this product (or increments
   * its quantity if already present), and selects only this product.
   * The caller should navigate to /gio-hang after invoking this.
   */
  const buyNow = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        // Already in cart — just re-select it (and deselect others)
        return prev.map(i => ({
          ...i,
          quantity: i.id === product.id ? i.quantity + 1 : i.quantity,
          selected: i.id === product.id,
        }))
      }
      // New item — deselect all existing, add this one selected
      return [
        ...prev.map(i => ({ ...i, selected: false })),
        {
          id:            product.id,
          name:          product.name,
          image:         product.image,
          salePrice:     product.salePrice,
          originalPrice: product.originalPrice,
          brand:         product.brand,
          quantity:      1,
          selected:      true,
        },
      ]
    })
  }, [])

  /** Remove an item from cart */
  const removeFromCart = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  /** Update quantity of an item */
  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }, [])

  /** Toggle selected state of one item */
  const toggleSelected = useCallback((id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i))
  }, [])

  /** Select / deselect all */
  const setAllSelected = useCallback((selected) => {
    setItems(prev => prev.map(i => ({ ...i, selected })))
  }, [])

  /** Remove all selected items */
  const removeSelected = useCallback(() => {
    setItems(prev => prev.filter(i => !i.selected))
  }, [])

  const totalItems    = items.reduce((s, i) => s + i.quantity, 0)
  const selectedItems = items.filter(i => i.selected)
  const allSelected   = items.length > 0 && items.every(i => i.selected)
  const subtotal      = selectedItems.reduce((s, i) => s + i.salePrice * i.quantity, 0)
  const originalTotal = selectedItems.reduce((s, i) => s + i.originalPrice * i.quantity, 0)
  const discount      = originalTotal - subtotal

  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      selectedItems,
      allSelected,
      subtotal,
      originalTotal,
      discount,
      addToCart,
      buyNow,
      removeFromCart,
      updateQuantity,
      toggleSelected,
      setAllSelected,
      removeSelected,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
