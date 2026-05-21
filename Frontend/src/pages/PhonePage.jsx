import { useState, useMemo } from 'react'
import { phones } from '../data/products'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb'
import BrandCardList from '../components/BrandCard/BrandCardList'
import FilterBar from '../components/FilterBar/FilterBar'
import SortBar from '../components/SortBar/SortBar'
import ProductGrid from '../components/ProductGrid/ProductGrid'
import './PhonePage.css'

import logoIphone  from '../assets/logo_iphone.webp'
import logoSamsung from '../assets/logo_samsung.webp'
import logoXiaomi  from '../assets/logo_xiaomi.webp'
import logoVivo    from '../assets/logo_vivo.png'
import logoRealme  from '../assets/logo_realme.webp'
import logoOppo    from '../assets/logo_oppo.webp'

const PHONE_BRANDS = [
  { name: 'iPhone',  logo: logoIphone,  path: '/dien-thoai/iphone'  },
  { name: 'Samsung', logo: logoSamsung, path: '/dien-thoai/samsung'  },
  { name: 'Xiaomi',  logo: logoXiaomi,  path: '/dien-thoai/xiaomi'   },
  { name: 'Vivo',    logo: logoVivo,    path: '/dien-thoai/vivo'     },
  { name: 'Realme',  logo: logoRealme,  path: '/dien-thoai/realme'   },
  { name: 'Oppo',    logo: logoOppo,    path: '/dien-thoai/oppo'     },
]

// Filter group definitions for phones
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

// Price range helper
const PRICE_RANGES = {
  'under-2':  [0,          2_000_000],
  '2-4':      [2_000_000,  4_000_000],
  '4-7':      [4_000_000,  7_000_000],
  '7-13':     [7_000_000,  13_000_000],
  '13-20':    [13_000_000, 20_000_000],
  'over-20':  [20_000_000, Infinity],
}

const ITEMS_PER_PAGE = 20

const breadcrumbItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Điện thoại' },
]

const EMPTY_FILTERS = { price: [], storage: [], ram: [] }

function matchesFilters(product, activeFilters) {
  // Price
  if (activeFilters.price.length > 0) {
    const inRange = activeFilters.price.some(key => {
      const [min, max] = PRICE_RANGES[key]
      return product.salePrice >= min && product.salePrice < max
    })
    if (!inRange) return false
  }
  // Storage
  if (activeFilters.storage.length > 0) {
    if (!activeFilters.storage.includes(String(product.storage))) return false
  }
  // Ram
  if (activeFilters.ram.length > 0) {
    if (!activeFilters.ram.includes(String(product.ram))) return false
  }
  return true
}

function PhonePage() {
  const [sortOrder, setSortOrder]         = useState('')
  const [visibleCount, setVisibleCount]   = useState(ITEMS_PER_PAGE)
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS)

  const filtered = useMemo(() => {
    let result = [...phones]

    result = result.filter(p => matchesFilters(p, activeFilters))

    if (sortOrder === 'asc') {
      result.sort((a, b) => a.salePrice - b.salePrice)
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.salePrice - a.salePrice)
    }

    return result
  }, [sortOrder, activeFilters])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const handleLoadMore = () => setVisibleCount(prev => prev + ITEMS_PER_PAGE)

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

  return (
    <div className="container phone-page">
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="phone-page-title">Điện thoại</h1>

      <BrandCardList
        brands={PHONE_BRANDS}
        activeBrand=""
        onBrandChange={() => {}}
      />

      <FilterBar
        filterGroups={PHONE_FILTER_GROUPS}
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
        <div className="phone-page-load-more">
          <button
            className="phone-page-load-more-btn"
            onClick={handleLoadMore}
            id="phone-page-load-more-btn"
          >
            Xem thêm {filtered.length - visibleCount} sản phẩm ▼
          </button>
        </div>
      )}
    </div>
  )
}

export default PhonePage
