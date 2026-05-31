import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb'
import CartEmpty from '../components/Cart/CartEmpty'
import CartItemRow from '../components/Cart/CartItemRow'
import CartSummary from '../components/Cart/CartSummary'
import './CartPage.css'

const breadcrumbItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Giỏ hàng' },
]

/**
 * CartPage — /gio-hang
 *
 * Assembles the full cart view:
 *  - Empty state  (no items)
 *  - Two-column layout: CartItems (left) + CartSummary (right)
 */
function CartPage() {
  const { items, loading, error, allSelected, setAllSelected, removeSelected, selectedItems } = useCart()
  const location = useLocation()

  // Clear all selections on every visit to the cart page,
  // UNLESS we arrived here via the "Mua ngay" button.
  useEffect(() => {
    if (!location.state?.fromBuyNow) {
      setAllSelected(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="container cart-page">
        <Breadcrumb items={breadcrumbItems} />
        <p>Đang tải giỏ hàng...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container cart-page">
        <Breadcrumb items={breadcrumbItems} />
        <p>{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container cart-page">
        <Breadcrumb items={breadcrumbItems} />
        <CartEmpty />
      </div>
    )
  }

  return (
    <div className="container cart-page">
      <Breadcrumb items={breadcrumbItems} />

      <div className="cart-layout">
        {/* Left column */}
        <div className="cart-items-col">
          {/* Select-all / bulk-delete bar */}
          <div className="cart-select-bar">
            <div
              className="cart-select-all"
              onClick={() => setAllSelected(!allSelected)}
              role="checkbox"
              aria-checked={allSelected}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setAllSelected(!allSelected)}
              id="cart-select-all"
            >
              <div className={`cart-checkbox${allSelected ? ' checked' : ''}`} />
              <span>Chọn tất cả ({items.length})</span>
            </div>

            <button
              className="cart-bulk-delete"
              onClick={removeSelected}
              disabled={selectedItems.length === 0}
              aria-label="Xoá các sản phẩm đã chọn"
              id="cart-bulk-delete-btn"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Item rows */}
          <div className="cart-items-list">
            {items.map(item => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Right column */}
        <CartSummary />
      </div>
    </div>
  )
}

export default CartPage
