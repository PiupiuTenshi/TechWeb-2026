/**
 * CheckoutCustomerForm
 *
 * Props:
 *   value    {object}   — { name, phone, email }
 *   onChange {function} — (field, value) => void
 */
function CheckoutCustomerForm({ value, onChange }) {
  return (
    <div className="checkout-card">
      <h2 className="checkout-card-title">Người đặt hàng</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          id="checkout-name"
          className="checkout-input"
          type="text"
          placeholder="Họ và tên"
          value={value.name}
          onChange={e => onChange('name', e.target.value)}
          autoComplete="name"
          required
        />
        <input
          id="checkout-phone"
          className="checkout-input"
          type="tel"
          placeholder="Số điện thoại"
          value={value.phone}
          onChange={e => onChange('phone', e.target.value)}
          autoComplete="tel"
          required
        />
        <input
          id="checkout-email"
          className="checkout-input"
          type="email"
          placeholder="Email (Không bắt buộc)"
          value={value.email}
          onChange={e => onChange('email', e.target.value)}
          autoComplete="email"
        />
      </div>
    </div>
  )
}

export default CheckoutCustomerForm
