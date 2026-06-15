import './CheckoutPayment.css'
import './CheckoutDelivery.css'  // reuse .checkout-radio styles

const PAYMENT_METHODS = [
  {
    id:    'cod',
    label: 'Thanh toán khi nhận hàng',
    icon:  { bg: '#e31837', text: 'COD' },
  },
  {
    id:    'bank-transfer',
    label: 'Chuyển khoản ngân hàng (QR Code)',
    icon:  { bg: '#1a56db', text: 'QR' },
  },
  {
    id:    'atm',
    label: 'Thẻ ATM nội địa (qua VNPAY)',
    icon:  { bg: '#0066cc', text: 'ATM' },
  },
  {
    id:    'intl',
    label: 'Thẻ Quốc tế Visa, Master, JCB, AMEX, Apple Pay, Google Pay, Samsung Pay',
    icon:  { bg: '#374151', text: 'VISA' },
  },
  {
    id:    'zalopay',
    label: 'Ví ZaloPay',
    icon:  { bg: '#0068ff', text: 'Zalo' },
  },
  {
    id:    'momo',
    label: 'Ví điện tử MoMo',
    icon:  { bg: '#ae2070', text: 'MoMo' },
  },
]

/**
 * CheckoutPayment
 *
 * Props:
 *   method   {string}   — selected payment method id
 *   onChange {function} — (id) => void
 */
function CheckoutPayment({ method, onChange }) {
  return (
    <div className="checkout-card">
      <h2 className="checkout-card-title">Phương thức thanh toán</h2>

      <div className="checkout-payment-list">
        {PAYMENT_METHODS.map(pm => (
          <div
            key={pm.id}
            className="checkout-payment-option"
            onClick={() => onChange(pm.id)}
            role="radio"
            aria-checked={method === pm.id}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onChange(pm.id)}
            id={`checkout-pay-${pm.id}`}
          >
            <div className={`checkout-radio${method === pm.id ? ' checked' : ''}`} />
            <div
              className="checkout-payment-icon"
              style={{ background: pm.icon.bg }}
              aria-hidden="true"
            >
              {pm.icon.text}
            </div>
            <span className="checkout-payment-label">{pm.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CheckoutPayment
