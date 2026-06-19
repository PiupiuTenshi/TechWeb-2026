import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import './CartSummary.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

/**
 * CartSummary — sticky right sidebar with order totals and confirm button.
 */
function CartSummary() {
  const { subtotal, discount, selectedItems } = useCart()
  const [expanded, setExpanded] = useState(true)
  const navigate = useNavigate()

  const hasSelection = selectedItems.length > 0

  return (
    <aside className="cart-summary" aria-label="Thông tin đơn hàng">

      {/* Order info */}
      <div className="cart-summary-info">
        <p className="cart-summary-info-title">Thông tin đơn hàng</p>

        <div className="cart-summary-row">
          <span className="cart-summary-row-label">Tổng tiền</span>
          <span className="cart-summary-row-value">
            {hasSelection ? formatPrice(subtotal + discount) : '0đ'}
          </span>
        </div>

        {expanded && discount > 0 && hasSelection && (
          <div className="cart-summary-row">
            <span className="cart-summary-row-label">Tổng khuyến mãi</span>
            <span className="cart-summary-row-value discount">
              −{formatPrice(discount)}
            </span>
          </div>
        )}
      </div>

      <div className="cart-summary-divider" />

      <div className="cart-summary-info" style={{ paddingTop: 0 }}>
        <div className="cart-summary-total-row">
          <span className="cart-summary-total-label">Cần thanh toán</span>
          <span className="cart-summary-total-value">
            {hasSelection ? formatPrice(subtotal) : '0đ'}
          </span>
        </div>
      </div>

      {/* Toggle collapse */}
      <button
        className="cart-summary-toggle"
        onClick={() => setExpanded(p => !p)}
        id="cart-summary-toggle-btn"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? 'Rút gọn' : 'Xem thêm'}
      </button>

      {/* Confirm button */}
      <button
        className="cart-summary-confirm"
        disabled={!hasSelection}
        id="cart-confirm-btn"
        aria-label="Xác nhận đơn hàng"
        onClick={() => navigate('/thanh-toan', {
          state: { selectedCartItemIds: selectedItems.map(item => item.id) },
        })}
      >
        Xác nhận đơn
      </button>
    </aside>
  )
}

export default CartSummary
