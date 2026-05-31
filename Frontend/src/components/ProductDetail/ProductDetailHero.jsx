import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import './ProductDetailHero.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

/**
 * ProductDetailHero
 *
 * Props:
 *   product {object} — phone, laptop, or accessory product object
 */
function ProductDetailHero({ product }) {
  const { name, image, salePrice, originalPrice } = product
  const { addToCart, buyNow } = useCart()
  const [loading, setLoading] = useState(false)
  const navigate      = useNavigate()

  const handleBuyNow = async () => {
    try {
      setLoading(true)
      await buyNow(product)
      navigate('/gio-hang', { state: { fromBuyNow: true } })
    } catch (err) {
      alert(err.message || 'Không thể mua ngay sản phẩm này.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    try {
      setLoading(true)
      await addToCart(product, false)
      alert('Đã thêm vào giỏ hàng.')
    } catch (err) {
      alert(err.message || 'Không thể thêm vào giỏ hàng.')
    } finally {
      setLoading(false)
    }
  }

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
            onClick={handleBuyNow}
            disabled={loading}
            aria-label={`Mua ngay ${name}`}
          >
            Mua ngay
          </button>
          <button
            className="detail-hero-btn-cart"
            id="btn-add-to-cart"
            onClick={handleAddToCart}
            disabled={loading}
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
