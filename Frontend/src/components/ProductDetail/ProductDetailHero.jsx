import './ProductDetailHero.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

/**
 * ProductDetailHero
 *
 * Props:
 *   product {object} — phone or laptop product object
 */
function ProductDetailHero({ product }) {
  const { name, image, salePrice, originalPrice } = product

  return (
    <div className="detail-hero">
      {/* Left — product image */}
      <div className="detail-hero-img-wrap">
        <img src={image} alt={name} />
      </div>

      {/* Right — product info */}
      <div className="detail-hero-info">
        <h1 className="detail-hero-name">{name}</h1>

        <div className="detail-hero-prices">
          <span className="detail-hero-sale-price">{formatPrice(salePrice)}</span>
          {originalPrice > salePrice && (
            <span className="detail-hero-original-price">{formatPrice(originalPrice)}</span>
          )}
        </div>

        <div className="detail-hero-actions">
          <button
            className="detail-hero-btn-buy"
            id="btn-buy-now"
            aria-label={`Mua ngay ${name}`}
          >
            Mua ngay
          </button>
          <button
            className="detail-hero-btn-cart"
            id="btn-add-to-cart"
            aria-label={`Thêm ${name} vào giỏ hàng`}
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailHero
