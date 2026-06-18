import { useState, useMemo } from 'react'
import { useProducts } from '../context/ProductContext'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb'
import BrandCardList from '../components/BrandCard/BrandCardList'
import FilterBar from '../components/FilterBar/FilterBar'
import SortBar from '../components/SortBar/SortBar'
import ProductGrid from '../components/ProductGrid/ProductGrid'
import './LaptopPage.css'

import logoMacbook from '../assets/logo_macbook.webp'
import logoLenovo  from '../assets/logo_lenovo.webp'
import logoDell    from '../assets/logo_dell.webp'
import logoAsus    from '../assets/logo_asus.webp'
import logoAcer    from '../assets/logo_acer.webp'
import logoMsi     from '../assets/logo_msi.webp'

const LAPTOP_BRANDS = [
  { name: 'MacBook', logo: logoMacbook, path: '/laptop/macbook' },
  { name: 'Lenovo',  logo: logoLenovo,  path: '/laptop/lenovo'  },
  { name: 'Dell',    logo: logoDell,    path: '/laptop/dell'    },
  { name: 'Asus',    logo: logoAsus,    path: '/laptop/asus'    },
  { name: 'Acer',    logo: logoAcer,    path: '/laptop/acer'    },
  { name: 'Msi',     logo: logoMsi,     path: '/laptop/msi'     },
]

// Filter group definitions for laptops
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

// Price range helper
const PRICE_RANGES = {
  'under-10': [0,           10_000_000],
  '10-15':    [10_000_000,  15_000_000],
  '15-20':    [15_000_000,  20_000_000],
  '20-25':    [20_000_000,  25_000_000],
  '25-30':    [25_000_000,  30_000_000],
  'over-30':  [30_000_000,  Infinity],
}

const ITEMS_PER_PAGE = 20

const breadcrumbItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Laptop' },
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

function LaptopPage() {
  const { laptops, loading, error } = useProducts()
  const [sortOrder, setSortOrder]           = useState('')
  const [visibleCount, setVisibleCount]     = useState(ITEMS_PER_PAGE)
  const [activeFilters, setActiveFilters]   = useState(EMPTY_FILTERS)

  const filtered = useMemo(() => {
    let result = [...laptops]
    result = result.filter(p => matchesFilters(p, activeFilters))

    if (sortOrder === 'asc') {
      result.sort((a, b) => a.salePrice - b.salePrice)
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.salePrice - a.salePrice)
    }

    return result
  }, [laptops, sortOrder, activeFilters])

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

  if (loading) return <div className="container laptop-page">Đang tải sản phẩm...</div>
  if (error) return <div className="container laptop-page">{error}</div>

  return (
    <div className="container laptop-page">
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="laptop-page-title">Laptop</h1>

      <BrandCardList
        brands={LAPTOP_BRANDS}
        activeBrand=""
        onBrandChange={() => {}}
      />

      <FilterBar
        filterGroups={LAPTOP_FILTER_GROUPS}
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
        <div className="laptop-page-load-more">
          <button
            className="laptop-page-load-more-btn"
            onClick={handleLoadMore}
            id="laptop-page-load-more-btn"
          >
            Xem thêm {filtered.length - visibleCount} sản phẩm ▼
          </button>
        </div>
      )}
    </div>
  )
}

export default LaptopPage
