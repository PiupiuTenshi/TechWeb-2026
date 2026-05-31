import { useState, useMemo } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import {
  PHONE_BRAND_SERIES, LAPTOP_BRAND_SERIES,
} from '../data/products'
import { useProducts } from '../context/ProductContext'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb'
import { SeriesCardList } from '../components/SeriesCard/SeriesCard'
import FilterBar from '../components/FilterBar/FilterBar'
import SortBar from '../components/SortBar/SortBar'
import ProductGrid from '../components/ProductGrid/ProductGrid'
import './BrandSeriesPage.css'

// ─── URL slug ↔ brand name maps ───────────────────────────────────────────────
const PHONE_SLUG_TO_BRAND = {
  iphone:  'iPhone',
  samsung: 'Samsung',
  xiaomi:  'Xiaomi',
  vivo:    'Vivo',
  realme:  'Realme',
  oppo:    'Oppo',
}

const LAPTOP_SLUG_TO_BRAND = {
  macbook: 'MacBook',
  lenovo:  'Lenovo',
  dell:    'Dell',
  asus:    'Asus',
  acer:    'Acer',
  msi:     'Msi',
}

// ─── Filter groups ─────────────────────────────────────────────────────────────
const PHONE_FILTER_GROUPS = [
  {
    key: 'price',
    label: 'Giá',
    options: [
      { value: 'under-2',  label: 'Dưới 2 triệu'    },
      { value: '2-4',      label: 'Từ 2 - 4 triệu'  },
      { value: '4-7',      label: 'Từ 4 - 7 triệu'  },
      { value: '7-13',     label: 'Từ 7 - 13 triệu' },
      { value: '13-20',    label: 'Từ 13 - 20 triệu'},
      { value: 'over-20',  label: 'Trên 20 triệu'   },
    ],
  },
  {
    key: 'storage',
    label: 'Bộ nhớ trong',
    options: [
      { value: '128',  label: '≤ 128 GB' },
      { value: '256',  label: '256 GB'   },
      { value: '512',  label: '512 GB'   },
      { value: '1024', label: '1 TB'     },
    ],
  },
  {
    key: 'ram',
    label: 'Ram',
    options: [
      { value: '6',  label: '6 GB'  },
      { value: '8',  label: '8 GB'  },
      { value: '12', label: '12 GB' },
      { value: '16', label: '16 GB' },
    ],
  },
]

const LAPTOP_FILTER_GROUPS = [
  {
    key: 'price',
    label: 'Giá',
    options: [
      { value: 'under-10', label: 'Dưới 10 triệu'    },
      { value: '10-15',    label: 'Từ 10 - 15 triệu' },
      { value: '15-20',    label: 'Từ 15 - 20 triệu' },
      { value: '20-25',    label: 'Từ 20 - 25 triệu' },
      { value: '25-30',    label: 'Từ 25 - 30 triệu' },
      { value: 'over-30',  label: 'Trên 30 triệu'    },
    ],
  },
  {
    key: 'storage',
    label: 'Ổ cứng',
    options: [
      { value: '128',  label: 'SSD 128 GB' },
      { value: '256',  label: 'SSD 256 GB' },
      { value: '512',  label: 'SSD 512 GB' },
      { value: '1024', label: 'SSD 1 TB'   },
      { value: '2048', label: 'SSD 2 TB'   },
    ],
  },
  {
    key: 'ram',
    label: 'Ram',
    options: [
      { value: '8',  label: '8 GB'  },
      { value: '16', label: '16 GB' },
      { value: '24', label: '24 GB' },
      { value: '32', label: '32 GB' },
      { value: '64', label: '64 GB' },
    ],
  },
]

// ─── Price range helpers ───────────────────────────────────────────────────────
const PHONE_PRICE_RANGES = {
  'under-2':  [0,          2_000_000],
  '2-4':      [2_000_000,  4_000_000],
  '4-7':      [4_000_000,  7_000_000],
  '7-13':     [7_000_000,  13_000_000],
  '13-20':    [13_000_000, 20_000_000],
  'over-20':  [20_000_000, Infinity],
}

const LAPTOP_PRICE_RANGES = {
  'under-10': [0,           10_000_000],
  '10-15':    [10_000_000,  15_000_000],
  '15-20':    [15_000_000,  20_000_000],
  '20-25':    [20_000_000,  25_000_000],
  '25-30':    [25_000_000,  30_000_000],
  'over-30':  [30_000_000,  Infinity],
}

const ITEMS_PER_PAGE = 20
const EMPTY_FILTERS  = { price: [], storage: [], ram: [] }

function matchesFilters(product, activeFilters, priceRanges) {
  if (activeFilters.price.length > 0) {
    const inRange = activeFilters.price.some(key => {
      const [min, max] = priceRanges[key]
      return product.salePrice >= min && product.salePrice < max
    })
    if (!inRange) return false
  }
  if (activeFilters.storage.length > 0) {
    if (!activeFilters.storage.includes(String(product.storage))) return false
  }
  if (activeFilters.ram.length > 0) {
    if (!activeFilters.ram.includes(String(product.ram))) return false
  }
  return true
}

/**
 * BrandSeriesPage
 *
 * Props:
 *   type {('phone'|'laptop')} — which product category
 *
 * URL param: :brand — slug like 'iphone', 'samsung', 'macbook', etc.
 */
function BrandSeriesPage({ type }) {
  const { brand: brandSlug } = useParams()
  const { phones, laptops, loading, error } = useProducts()

  // Resolve slug → brand name
  const slugMap     = type === 'phone' ? PHONE_SLUG_TO_BRAND : LAPTOP_SLUG_TO_BRAND
  const brandName   = slugMap[brandSlug?.toLowerCase()]

  // Series list for this brand
  const brandSeriesMap = type === 'phone' ? PHONE_BRAND_SERIES : LAPTOP_BRAND_SERIES
  const seriesList     = brandName ? (brandSeriesMap[brandName] || []) : []

  // All products for this brand
  const allProducts = type === 'phone' ? phones : laptops
  const brandProducts = useMemo(
    () => allProducts.filter(p => p.brand === brandName),
    [allProducts, brandName]
  )

  const [activeSeries, setActiveSeries]   = useState('')
  const [sortOrder, setSortOrder]         = useState('')
  const [visibleCount, setVisibleCount]   = useState(ITEMS_PER_PAGE)
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS)

  const priceRanges   = type === 'phone' ? PHONE_PRICE_RANGES : LAPTOP_PRICE_RANGES
  const filterGroups  = type === 'phone' ? PHONE_FILTER_GROUPS : LAPTOP_FILTER_GROUPS

  const filtered = useMemo(() => {
    let result = [...brandProducts]

    if (activeSeries) {
      result = result.filter(p => p.series === activeSeries)
    }

    result = result.filter(p => matchesFilters(p, activeFilters, priceRanges))

    if (sortOrder === 'asc') {
      result.sort((a, b) => a.salePrice - b.salePrice)
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.salePrice - a.salePrice)
    }

    return result
  }, [brandProducts, activeSeries, activeFilters, sortOrder, priceRanges])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const handleLoadMore = () => setVisibleCount(prev => prev + ITEMS_PER_PAGE)

  const handleSeriesChange = (series) => {
    setActiveSeries(series)
    setVisibleCount(ITEMS_PER_PAGE)
  }

  const handleFilterChange = (groupKey, value) => {
    setActiveFilters(prev => {
      const current = prev[groupKey] || []
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [groupKey]: next }
    })
    setVisibleCount(ITEMS_PER_PAGE)
  }

  const handleClearAll = () => {
    setActiveFilters(EMPTY_FILTERS)
    setVisibleCount(ITEMS_PER_PAGE)
  }

  if (loading) return <div className="container brand-series-page">Đang tải sản phẩm...</div>
  if (error) return <div className="container brand-series-page">{error}</div>

  // 404 guard — unknown brand slug
  if (!brandName) {
    return <Navigate to={type === 'phone' ? '/dien-thoai' : '/laptop'} replace />
  }

  // Breadcrumb
  const categoryLabel = type === 'phone' ? 'Điện thoại' : 'Laptop'
  const categoryPath  = type === 'phone' ? '/dien-thoai' : '/laptop'
  const breadcrumbItems = [
    { label: 'Trang chủ',    to: '/' },
    { label: categoryLabel,  to: categoryPath },
    { label: brandName },
  ]

  const pageTitle = `${categoryLabel} ${brandName}`

  return (
    <div className="container brand-series-page">
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="brand-series-page-title">{pageTitle}</h1>

      {seriesList.length > 0 && (
        <SeriesCardList
          seriesList={seriesList}
          activeSeries={activeSeries}
          onSeriesChange={handleSeriesChange}
        />
      )}

      <FilterBar
        filterGroups={filterGroups}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
      />

      <SortBar
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      <ProductGrid products={visible} />

      {hasMore && (
        <div className="brand-series-page-load-more">
          <button
            className="brand-series-page-load-more-btn"
            onClick={handleLoadMore}
            id="brand-series-page-load-more-btn"
          >
            Xem thêm {filtered.length - visibleCount} sản phẩm ▼
          </button>
        </div>
      )}
    </div>
  )
}

export default BrandSeriesPage
