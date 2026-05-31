/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { productsApi } from '../api/client'
import { mapProductSummary } from '../api/mappers'

const ProductContext = createContext(null)

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [productResponse, categoryResponse] = await Promise.all([
        productsApi.list({ pageSize: 100 }),
        productsApi.categories(),
      ])
      setProducts((productResponse.data || []).map(mapProductSummary))
      setCategories(categoryResponse)
    } catch (err) {
      setError(err.message || 'Không tải được sản phẩm.')
      setProducts([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(refresh)
  }, [refresh])

  const value = useMemo(() => {
    const phones = products.filter(product => product.categorySlug === 'phone')
    const laptops = products.filter(product => product.categorySlug === 'laptop')
    const accessories = products.filter(product => product.categorySlug === 'accessory')

    return {
      products,
      phones,
      laptops,
      accessories,
      categories,
      loading,
      error,
      refresh,
    }
  }, [products, categories, loading, error, refresh])

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts must be used inside <ProductProvider>')
  return ctx
}
