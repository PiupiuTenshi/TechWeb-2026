import { useState } from 'react'
import { Link } from 'react-router-dom'
import { productsApi } from '../../api/client'
import { mapProductDetail } from '../../api/mappers'
import { useCart } from '../../context/CartContext'
import './ProductCard.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

function StarRating({ rating }) {
  const full  = Math.floor(rating)
  const empty = 5 - full
  return (
    <div className="product-card-stars" aria-label={`Đánh giá ${rating}/5`}>
      {Array.from({ length: full  }).map((_, i) => <span key={`f${i}`} className="star">★</span>)}
      {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} className="star empty">★</span>)}
    </div>
  )
}

/**
 * ProductCard
 *
 * Props:
 *   product   {object}  — product data
 *   linkable  {boolean} — if true (default), wraps card in a Link to /san-pham/:id
 */
function ProductCard({ product, linkable = true }) {
  const {
    id, name, image,
    originalPrice, salePrice, discount,
    rating, ratingCount, installment,
  } = product

  const { items, addToCart, updateQuantity, removeFromCart } = useCart()

  // Find this product in the cart (match by variantId or productId)
  const cartItem = items.find(
    item => (product.variantId && item.variantId === product.variantId)
         || String(item.productId) === String(product.productId)
  )
  const qty = cartItem ? cartItem.quantity : 0

  const [adding, setAdding] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [addError, setAddError] = useState('')

  // ── Handle add to cart ────────────────────────────────────
  // Products on the homepage come from mapProductSummary which has no variantId.
  // We resolve it by fetching the product detail (which has variants) first.
  async function handleAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    if (adding) return
    setAdding(true)
    setAddError('')
    try {
      let productWithVariant = product

      // If variantId is missing, fetch the detail to get it
      if (!productWithVariant.variantId) {
        const slug = product.slug || product.id
        const dto = await productsApi.detail(slug)
        productWithVariant = mapProductDetail(dto)
      }

      if (!productWithVariant.variantId) {
        setAddError('Sản phẩm chưa có biến thể.')
        return
      }

      await addToCart(productWithVariant)

      // Fire toast — caught by CartToast at app root
      window.dispatchEvent(new CustomEvent('cart-toast', {
        detail: { message: 'Đã thêm sản phẩm vào giỏ hàng' }
      }))
    } catch (err) {
      console.error('[ProductCard] addToCart failed:', err)
      setAddError(err?.message || 'Không thể thêm vào giỏ.')
    } finally {
      setAdding(false)
    }
  }

  // ── Handle increase ───────────────────────────────────────
  async function handleIncrease(e) {
    e.preventDefault()
    e.stopPropagation()
    if (updating || !cartItem) return
    setUpdating(true)
    try {
      await updateQuantity(cartItem.id, qty + 1)
    } catch (err) {
      console.error('[ProductCard] updateQuantity failed:', err)
    } finally {
      setUpdating(false)
    }
  }

  // ── Handle decrease (remove when hits 0) ──────────────────
  async function handleDecrease(e) {
    e.preventDefault()
    e.stopPropagation()
    if (updating || !cartItem) return
    setUpdating(true)
    try {
      if (qty <= 1) {
        await removeFromCart(cartItem.id)
      } else {
        await updateQuantity(cartItem.id, qty - 1)
      }
    } catch (err) {
      console.error('[ProductCard] removeFromCart/updateQuantity failed:', err)
    } finally {
      setUpdating(false)
    }
  }

  const inner = (
    <article className="product-card" id={`product-card-${id}`}>
      {discount && <span className="product-card-badge">{discount}</span>}

      <div className="product-card-img-wrap">
        <img src={image} alt={name} loading="lazy" />
      </div>

      <p className="product-card-name">{name}</p>

      <div className="product-card-prices">
        <span className="product-card-sale-price">{formatPrice(salePrice)}</span>
        <span className="product-card-original-price">{formatPrice(originalPrice)}</span>
      </div>

      <div className="product-card-rating">
        <StarRating rating={rating} />
        <span className="product-card-rating-count">({ratingCount})</span>
      </div>

      {installment && (
        <span className="product-card-installment">{installment}</span>
      )}

      {/* ── Cart action area ────────────────────────────────── */}
      <div className="product-card-cart-action">
        {qty === 0 ? (
          <>
            <button
              type="button"
              className={`product-card-add-btn${adding ? ' loading' : ''}`}
              onClick={handleAdd}
              disabled={adding}
              aria-label={`Thêm ${name} vào giỏ hàng`}
              id={`add-to-cart-${id}`}
            >
              {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </button>
            {addError && (
              <p className="product-card-add-error">{addError}</p>
            )}
          </>
        ) : (
          <div className={`product-card-qty-stepper${updating ? ' updating' : ''}`}>
            <button
              type="button"
              className="product-card-qty-btn"
              onClick={handleDecrease}
              disabled={updating}
              aria-label="Giảm số lượng"
              id={`decrease-qty-${id}`}
            >
              −
            </button>
            <span className="product-card-qty-value" aria-live="polite">{qty}</span>
            <button
              type="button"
              className="product-card-qty-btn"
              onClick={handleIncrease}
              disabled={updating}
              aria-label="Tăng số lượng"
              id={`increase-qty-${id}`}
            >
              +
            </button>
          </div>
        )}
      </div>
    </article>
  )

  if (!linkable) return inner

  return (
    <Link to={`/san-pham/${id}`} className="product-card-link" aria-label={name}>
      {inner}
    </Link>
  )
}

export default ProductCard
