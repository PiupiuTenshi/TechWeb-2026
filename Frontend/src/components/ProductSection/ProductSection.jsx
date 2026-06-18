import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductCard from '../ProductCard/ProductCard'
import './ProductSection.css'

/**
 * ProductSection — reusable section with title badge, brand tabs, and product grid.
 *
 * Props:
 *   title      {string}   — section heading text, e.g. "Điện thoại"
 *   tabs       {string[]} — array of tab labels (brand names)
 *   products   {object[]} — full product list for this section
 *   activeTab  {string}   — currently active tab label
 *   onTabChange{function} — called with the newly selected tab label
 *   maxVisible {number}   — max cards to show per page (default 10)
 *   linkTo     {string}   — optional route to navigate to when clicking the title
 *   linkable   {boolean}  — whether cards navigate to detail page (default true)
 */
function ProductSection({ title, tabs, products, activeTab, onTabChange, maxVisible = 10, linkTo, linkable = true }) {
  const [page, setPage] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const filtered = activeTab
    ? products.filter(p => p.brand === activeTab)
    : products

  // Split products into fixed-size pages (chunks)
  const chunks = []
  for (let i = 0; i < filtered.length; i += maxVisible) {
    chunks.push(filtered.slice(i, i + maxVisible))
  }
  if (chunks.length === 0) chunks.push([])

  const totalPages = chunks.length
  const canPaginate = totalPages > 1

  const isFirst = page === 0
  const isLast = page >= totalPages - 1

  // Reset to first page when filter or data changes
  useEffect(() => {
    setPage(0)
  }, [activeTab, products])

  // Guard against page going out of range after data changes
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(totalPages - 1)
    }
  }, [page, totalPages])

  const goPrev = () => {
    if (!isFirst) setPage(p => p - 1)
  }

  const goNext = () => {
    if (!isLast) setPage(p => p + 1)
  }

  const titleContent = (
    <h2 className="product-section-title">{title}</h2>
  )

  return (
    <section
      className="product-section"
      aria-label={title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-section-header">
        {linkTo ? (
          <Link to={linkTo} className="product-section-title-link">
            {titleContent}
          </Link>
        ) : (
          titleContent
        )}

        <nav className="product-section-tabs" aria-label={`Lọc theo thương hiệu ${title}`}>
          {tabs.map(tab => (
            <button
              key={tab}
              className={`product-section-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => onTabChange(tab === activeTab ? '' : tab)}
              id={`tab-${title.replace(/\s+/g, '-').toLowerCase()}-${tab.toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="product-section-carousel">
        {canPaginate && (
          <button
            type="button"
            className={[
              'product-section-nav',
              'product-section-nav-prev',
              isHovered ? 'visible' : '',
              isFirst ? 'disabled' : '',
            ].join(' ').trim()}
            onClick={goPrev}
            disabled={isFirst}
            aria-label={`Sản phẩm ${title} trước đó`}
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Viewport clips the sliding track */}
        <div className="product-section-viewport">
          <div
            className="product-section-track"
            style={{
              // Track = N pages wide; each page = viewport width
              // translateX in % is relative to the track itself,
              // so each page step = 100% / N
              width: `${chunks.length * 100}%`,
              transform: `translateX(-${page * (100 / chunks.length)}%)`,
            }}
          >
            {chunks.map((chunk, idx) => (
              // Each grid = 100%/N of track = exactly 1 viewport-width
              <div
                key={idx}
                className="product-section-grid"
                style={{ width: `${100 / chunks.length}%` }}
              >
                {chunk.map(product => (
                  <ProductCard key={product.id} product={product} linkable={linkable} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {canPaginate && (
          <button
            type="button"
            className={[
              'product-section-nav',
              'product-section-nav-next',
              isHovered ? 'visible' : '',
              isLast ? 'disabled' : '',
            ].join(' ').trim()}
            onClick={goNext}
            disabled={isLast}
            aria-label={`Sản phẩm ${title} tiếp theo`}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  )
}

export default ProductSection
