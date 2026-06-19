import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productsApi } from '../api/client'
import { mapProductSummary } from '../api/mappers'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb'
import ProductGrid from '../components/ProductGrid/ProductGrid'
import './SearchPage.css'

const ITEMS_PER_PAGE = 20

const CATEGORY_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'phone', label: 'Điện thoại' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'accessory', label: 'Phụ kiện' },
]

const PRICE_OPTIONS = [
  { value: '', label: 'Tất cả giá' },
  { value: 'under-5', label: 'Dưới 5 triệu', minPrice: '', maxPrice: '5000000' },
  { value: '5-10', label: '5 - 10 triệu', minPrice: '5000000', maxPrice: '10000000' },
  { value: '10-20', label: '10 - 20 triệu', minPrice: '10000000', maxPrice: '20000000' },
  { value: '20-30', label: '20 - 30 triệu', minPrice: '20000000', maxPrice: '30000000' },
  { value: 'over-30', label: 'Trên 30 triệu', minPrice: '30000000', maxPrice: '' },
]

const SORT_OPTIONS = [
  { value: '', label: 'Liên quan' },
  { value: 'price_asc', label: 'Giá thấp - cao' },
  { value: 'price_desc', label: 'Giá cao - thấp' },
  { value: 'newest', label: 'Mới nhất' },
]

const breadcrumbItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Tìm kiếm' },
]

function readPage(value) {
  const page = Number(value)
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

function currentPriceKey(minPrice, maxPrice) {
  const option = PRICE_OPTIONS.find(item =>
    String(item.minPrice || '') === String(minPrice || '')
    && String(item.maxPrice || '') === String(maxPrice || '')
  )
  return option?.value || ''
}

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const query = (searchParams.get('q') || '').trim()
  const category = searchParams.get('category') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const sort = searchParams.get('sort') || ''
  const page = readPage(searchParams.get('page'))
  const activePrice = currentPriceKey(minPrice, maxPrice)

  useEffect(() => {
    let cancelled = false

    async function loadResults() {
      setLoading(true)
      setError('')
      try {
        const response = await productsApi.list({
          search: query,
          category,
          minPrice,
          maxPrice,
          sort,
          page,
          pageSize: ITEMS_PER_PAGE,
        })

        if (!cancelled) {
          setProducts((response.data || []).map(mapProductSummary))
          setPagination(response.pagination || null)
        }
      } catch (err) {
        if (!cancelled) {
          setProducts([])
          setPagination(null)
          setError(err.message || 'Không thể tải kết quả tìm kiếm.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadResults()
    return () => {
      cancelled = true
    }
  }, [query, category, minPrice, maxPrice, sort, page])

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
    })

    setSearchParams(next)
  }

  const handleCategoryChange = (value) => {
    updateParams({ category: value, page: '' })
  }

  const handlePriceChange = (value) => {
    const option = PRICE_OPTIONS.find(item => item.value === value)
    updateParams({
      minPrice: option?.minPrice || '',
      maxPrice: option?.maxPrice || '',
      page: '',
    })
  }

  const handleSortChange = (value) => {
    updateParams({ sort: value, page: '' })
  }

  const handlePageChange = (nextPage) => {
    updateParams({ page: nextPage <= 1 ? '' : nextPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const total = pagination?.total ?? products.length
  const pageSize = pagination?.pageSize || ITEMS_PER_PAGE
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasResults = products.length > 0

  return (
    <div className="container search-page">
      <Breadcrumb items={breadcrumbItems} />

      <div className="search-page-header">
        <h1 className="search-page-title">
          {query ? `Kết quả tìm kiếm cho "${query}"` : 'Tìm kiếm sản phẩm'}
        </h1>
        <p className="search-page-count">
          {loading ? 'Đang tìm kiếm...' : `${total} sản phẩm phù hợp`}
        </p>
      </div>

      <section className="search-page-controls" aria-label="Bộ lọc tìm kiếm">
        <div className="search-page-control-group">
          <span className="search-page-control-label">Danh mục</span>
          <div className="search-page-chip-row">
            {CATEGORY_OPTIONS.map(option => (
              <button
                key={option.value || 'all'}
                type="button"
                className={`search-page-chip${category === option.value ? ' active' : ''}`}
                onClick={() => handleCategoryChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="search-page-control-group">
          <span className="search-page-control-label">Khoảng giá</span>
          <div className="search-page-chip-row">
            {PRICE_OPTIONS.map(option => (
              <button
                key={option.value || 'all'}
                type="button"
                className={`search-page-chip${activePrice === option.value ? ' active' : ''}`}
                onClick={() => handlePriceChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="search-page-control-group">
          <span className="search-page-control-label">Sắp xếp</span>
          <div className="search-page-chip-row">
            {SORT_OPTIONS.map(option => (
              <button
                key={option.value || 'relevance'}
                type="button"
                className={`search-page-chip${sort === option.value ? ' active' : ''}`}
                onClick={() => handleSortChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error && <p className="search-page-message">{error}</p>}

      {!error && loading && (
        <p className="search-page-message">Đang tải kết quả...</p>
      )}

      {!error && !loading && hasResults && (
        <>
          <ProductGrid products={products} />

          <div className="search-page-pagination" aria-label="Phân trang kết quả tìm kiếm">
            <button
              type="button"
              className="search-page-page-btn"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Trước
            </button>
            <span className="search-page-page-status">
              Trang {page} / {totalPages}
            </span>
            <button
              type="button"
              className="search-page-page-btn"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Tiếp
            </button>
          </div>
        </>
      )}

      {!error && !loading && !hasResults && (
        <div className="search-page-empty">
          <h2>Không tìm thấy sản phẩm phù hợp</h2>
          <p>Thử tìm bằng tên sản phẩm, thương hiệu hoặc chọn khoảng giá khác.</p>
        </div>
      )}
    </div>
  )
}

export default SearchPage
