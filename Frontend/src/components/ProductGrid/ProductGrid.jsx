import ProductCard from '../ProductCard/ProductCard'
import './ProductGrid.css'

/**
 * ProductGrid — standalone 5-column product card grid.
 *
 * Props:
 *   products {object[]}
 */
function ProductGrid({ products }) {
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid
