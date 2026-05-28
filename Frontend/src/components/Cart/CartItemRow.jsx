import { Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import './CartItemRow.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

// Derive a color label from brand/name (cosmetic only)
function getColorLabel(item) {
  if (item.name.toLowerCase().includes('đen') || item.name.toLowerCase().includes('black')) return 'Đen'
  if (item.name.toLowerCase().includes('trắng') || item.name.toLowerCase().includes('white')) return 'Trắng'
  if (item.name.toLowerCase().includes('bạc') || item.name.toLowerCase().includes('silver')) return 'Bạc'
  if (item.name.toLowerCase().includes('xanh') || item.name.toLowerCase().includes('blue')) return 'Xanh'
  if (item.name.toLowerCase().includes('đỏ') || item.name.toLowerCase().includes('red')) return 'Đỏ'
  return 'Mặc định'
}

/**
 * CartItemRow — a single item in the cart list.
 *
 * Props:
 *   item {object} — cart item from CartContext
 */
function CartItemRow({ item }) {
  const { toggleSelected, updateQuantity, removeFromCart } = useCart()

  return (
    <div className="cart-item-row">
      {/* Checkbox */}
      <div
        className={`cart-item-checkbox${item.selected ? ' checked' : ''}`}
        onClick={() => toggleSelected(item.id)}
        role="checkbox"
        aria-checked={item.selected}
        aria-label={`Chọn ${item.name}`}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && toggleSelected(item.id)}
        id={`cart-item-check-${item.id}`}
      />

      {/* Image */}
      <img
        className="cart-item-img"
        src={item.image}
        alt={item.name}
        loading="lazy"
      />

      {/* Info */}
      <div className="cart-item-info">
        <p className="cart-item-name">{item.name}</p>
        <span className="cart-item-color">Màu: {getColorLabel(item)}</span>
      </div>

      {/* Prices */}
      <div className="cart-item-prices">
        <div className="cart-item-sale">{formatPrice(item.salePrice)}</div>
        {item.originalPrice > item.salePrice && (
          <div className="cart-item-original">{formatPrice(item.originalPrice)}</div>
        )}
      </div>

      {/* Quantity + Delete */}
      <div className="cart-item-actions">
        <div className="cart-item-qty">
          <button
            className="cart-item-qty-btn"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Giảm số lượng"
            id={`cart-qty-dec-${item.id}`}
          >
            −
          </button>
          <span className="cart-item-qty-value">{item.quantity}</span>
          <button
            className="cart-item-qty-btn"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            aria-label="Tăng số lượng"
            id={`cart-qty-inc-${item.id}`}
          >
            +
          </button>
        </div>

        <button
          className="cart-item-delete"
          onClick={() => removeFromCart(item.id)}
          aria-label={`Xoá ${item.name} khỏi giỏ hàng`}
          id={`cart-delete-${item.id}`}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  )
}

export default CartItemRow
