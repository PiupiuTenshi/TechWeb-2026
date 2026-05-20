import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { accessories } from '../data/products'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb'
import FilterBar from '../components/FilterBar/FilterBar'
import SortBar from '../components/SortBar/SortBar'
import ProductGrid from '../components/ProductGrid/ProductGrid'
import './AccessoryPage.css'

const ACCESSORY_FILTER_GROUPS = [
  {
    key: 'type',
    label: '',
    options: [
      { value: 'Bàn phím', label: 'Bàn phím' },
      { value: 'Chuột', label: 'Chuột' },
      { value: 'Tai nghe', label: 'Tai nghe' }
    ]
  }
]

const ITEMS_PER_PAGE = 20

const breadcrumbItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Phụ kiện' },
]

const EMPTY_FILTERS = { type: [] }

function matchesFilters(product, activeFilters) {
  if (activeFilters.type.length > 0) {
    if (!activeFilters.type.includes(product.brand)) return false
  }
  return true
}

function AccessoryPage() {
  const location = useLocation()
  const [sortOrder, setSortOrder] = useState('')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [activeFilters, setActiveFilters] = useState(() => {
    return location.state?.selectedBrand 
      ? { type: [location.state.selectedBrand] }
      : EMPTY_FILTERS
  })

  useEffect(() => {
    setActiveFilters(location.state?.selectedBrand 
      ? { type: [location.state.selectedBrand] }
      : EMPTY_FILTERS)
  }, [location.state?.selectedBrand])

  const filtered = useMemo(() => {
    let result = accessories.filter(p => matchesFilters(p, activeFilters))

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
    <div className="container accessory-page">
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="accessory-page-title">Phụ kiện</h1>

      <FilterBar
        filterGroups={ACCESSORY_FILTER_GROUPS}
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
        <div className="accessory-page-load-more">
          <button
            className="accessory-page-load-more-btn"
            onClick={handleLoadMore}
            id="accessory-page-load-more-btn"
          >
            Xem thêm {filtered.length - visibleCount} sản phẩm ▼
          </button>
        </div>
      )}
    </div>
  )
}

export default AccessoryPage
