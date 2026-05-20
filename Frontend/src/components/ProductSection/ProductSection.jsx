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
 *   maxVisible {number}   — max cards to show (default 10)
 *   linkTo     {string}   — optional route to navigate to when clicking the title
 */
function ProductSection({ title, tabs, products, activeTab, onTabChange, maxVisible = 10, linkTo }) {
  const filtered = activeTab
    ? products.filter(p => p.brand === activeTab)
    : products

  const visible = filtered.slice(0, maxVisible)

  const titleContent = (
    <h2 className="product-section-title">{title}</h2>
  )

  return (
    <section className="product-section" aria-label={title}>
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

      <div className="product-section-grid">
        {visible.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default ProductSection

