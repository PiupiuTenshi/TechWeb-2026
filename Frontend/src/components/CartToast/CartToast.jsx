import { useEffect, useState } from 'react'
import './CartToast.css'

/**
 * CartToast — listens for a custom 'cart-toast' event dispatched by ProductCard,
 * then shows a small slide-in notification at the top-center of the screen.
 * Only mounts once at app root level.
 */
function CartToast() {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('Đã thêm sản phẩm vào giỏ hàng')
  const timerRef = { current: null }

  useEffect(() => {
    function handleToast(e) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setMessage(e.detail?.message || 'Đã thêm sản phẩm vào giỏ hàng')
      setVisible(true)
      timerRef.current = setTimeout(() => setVisible(false), 2800)
    }

    window.addEventListener('cart-toast', handleToast)
    return () => {
      window.removeEventListener('cart-toast', handleToast)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`cart-toast${visible ? ' cart-toast--visible' : ''}`} role="status" aria-live="polite">
      <span className="cart-toast-icon">
        {/* Checkmark circle */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="10" fill="#22c55e" />
          <path d="M5.5 10.5l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="cart-toast-message">{message}</span>
      <button
        className="cart-toast-close"
        onClick={() => setVisible(false)}
        aria-label="Đóng thông báo"
      >
        ×
      </button>
    </div>
  )
}

export default CartToast
