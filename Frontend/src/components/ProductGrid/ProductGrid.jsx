import ProductCard from '../ProductCard/ProductCard'
import './ProductGrid.css'

/**
 * ProductGrid — standalone 5-column product card grid.
 *
 * Props:
 *   products  {object[]}
 *   linkable  {boolean} — passed through to ProductCard (default true)
 */
function ProductGrid({ products, linkable = true }) {
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} linkable={linkable} />
      ))}
    </div>
  )
}

export default ProductGrid
