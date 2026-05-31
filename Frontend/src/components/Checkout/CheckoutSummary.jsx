import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import './CheckoutSummary.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}


/**
 * CheckoutSummary — sticky right sidebar.
 *
 * Props:
 *   subtotal      {number}
 *   originalTotal {number}
 *   discount      {number}
 *   onPlaceOrder  {function}
 *   placing       {boolean}
 */
function CheckoutSummary({ subtotal, originalTotal, discount, onPlaceOrder, placing = false }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <aside className="checkout-summary" aria-label="Thông tin đơn hàng">

      <div className="checkout-summary-header">
        <p className="checkout-summary-title">Thông tin đơn hàng</p>
      </div>

      {/* Tổng tiền */}
      <div className="checkout-summary-row">
        <span className="checkout-summary-row-label">Tổng tiền</span>
        <span className="checkout-summary-row-value">{formatPrice(originalTotal)}</span>
      </div>

      {expanded && discount > 0 && (
        <>
          <div className="checkout-summary-row">
            <span className="checkout-summary-row-label">Tổng khuyến mãi</span>
            <span className="checkout-summary-row-value discount">
              −{formatPrice(discount)}
            </span>
          </div>
          <div className="checkout-summary-subrow">
            <span className="checkout-summary-subrow-label">Giảm giá sản phẩm</span>
            <span className="checkout-summary-subrow-value">{formatPrice(discount)}</span>
          </div>
        </>
      )}

      <div className="checkout-summary-divider" />

      {/* Shipping */}
      <div className="checkout-summary-shipping">
        <span className="checkout-summary-shipping-label">Phí vận chuyển</span>
        <span className="checkout-summary-shipping-value">Miễn phí</span>
      </div>

      {/* Cần thanh toán */}
      <div className="checkout-summary-total">
        <span className="checkout-summary-total-label">Cần thanh toán</span>
        <span className="checkout-summary-total-value">{formatPrice(subtotal)}</span>
      </div>

      {/* Collapse toggle */}
      <button
        className="checkout-summary-toggle"
        onClick={() => setExpanded(p => !p)}
        id="checkout-summary-toggle"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? 'Rút gọn' : 'Xem thêm'}
      </button>

      {/* Place order */}
      <button
        className="checkout-summary-btn"
        onClick={onPlaceOrder}
        disabled={placing}
        id="checkout-place-order-btn"
        aria-label="Đặt hàng"
      >
        {placing ? 'Đang đặt hàng...' : 'Đặt hàng'}
      </button>
    </aside>
  )
}

export default CheckoutSummary
