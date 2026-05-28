import { Link } from 'react-router-dom'
import './CartEmpty.css'

/**
 * CartEmpty — shown when the cart has no items.
 */
function CartEmpty() {
  return (
    <div className="cart-empty">
      <div className="cart-empty-content">
        <h2 className="cart-empty-title">Chưa có sản phẩm nào trong giỏ hàng</h2>
        <p className="cart-empty-subtitle">Cùng mua sắm hàng ngàn sản phẩm tại TechShop nhé!</p>
        <Link to="/" className="cart-empty-btn" id="cart-empty-shop-btn">
          Mua hàng
        </Link>
      </div>

      <div className="cart-empty-img" aria-hidden="true">
        {/* Shopping cart SVG illustration */}
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="100" cy="140" rx="70" ry="12" fill="#e0e0e0" opacity="0.6"/>
          {/* Cart body */}
          <rect x="45" y="55" width="110" height="72" rx="10" fill="#d0d0d0"/>
          <rect x="52" y="62" width="96" height="58" rx="7" fill="#e8e8e8"/>
          {/* Cart handle */}
          <path d="M30 38 L45 55" stroke="#b0b0b0" strokeWidth="6" strokeLinecap="round"/>
          <circle cx="28" cy="34" r="8" fill="#c0c0c0"/>
          {/* Wheels */}
          <circle cx="68" cy="135" r="10" fill="#b0b0b0"/>
          <circle cx="68" cy="135" r="5" fill="#d8d8d8"/>
          <circle cx="132" cy="135" r="10" fill="#b0b0b0"/>
          <circle cx="132" cy="135" r="5" fill="#d8d8d8"/>
          {/* Little people */}
          <circle cx="158" cy="112" r="6" fill="#f5a623"/>
          <rect x="154" y="118" width="8" height="14" rx="3" fill="#e8941a"/>
          <circle cx="140" cy="116" r="5" fill="#4a90d9"/>
          <rect x="136" y="121" width="8" height="12" rx="3" fill="#357abd"/>
          {/* Stars / sparkle */}
          <circle cx="170" cy="55" r="3" fill="#f5a623" opacity="0.7"/>
          <circle cx="38" cy="75" r="2" fill="#e31837" opacity="0.5"/>
          <circle cx="165" cy="90" r="2" fill="#4a90d9" opacity="0.6"/>
        </svg>
      </div>
    </div>
  )
}

export default CartEmpty
