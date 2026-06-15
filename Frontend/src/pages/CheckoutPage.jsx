import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersApi, paymentsApi } from '../api/client'
import CheckoutItemList     from '../components/Checkout/CheckoutItemList'
import CheckoutCustomerForm from '../components/Checkout/CheckoutCustomerForm'
import CheckoutDelivery     from '../components/Checkout/CheckoutDelivery'
import CheckoutPayment      from '../components/Checkout/CheckoutPayment'
import CheckoutSummary      from '../components/Checkout/CheckoutSummary'
import './CheckoutPage.css'

/**
 * CheckoutPage — /thanh-toan
 *
 * Displays the full checkout flow for all currently-selected cart items.
 * Redirects to /gio-hang if there are no selected items to check out.
 */
function CheckoutPage() {
  const navigate = useNavigate()
  const {
    selectedItems,
    subtotal,
    originalTotal,
    discount,
    keepOnlySelectedForCheckout,
    clearCartState,
  } = useCart()
  const { user, openLogin } = useAuth()

  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' })
  const [delivery, setDelivery] = useState('home')
  const [address,  setAddress ] = useState('')
  const [payment,  setPayment ] = useState('cod')
  const [placing,  setPlacing ] = useState(false)
  const [gatewayPayment, setGatewayPayment] = useState(null)

  const handleCustomerChange = (field, value) =>
    setCustomer(prev => ({ ...prev, [field]: value }))

  const handlePlaceOrder = async () => {
    if (!user) {
      openLogin()
      alert('Bạn cần đăng nhập trước khi đặt hàng.')
      return
    }

    if (!customer.name.trim() || !customer.phone.trim() || !address.trim()) {
      alert('Vui lòng nhập họ tên, số điện thoại và địa chỉ nhận hàng.')
      return
    }

    if (payment === 'qr' || payment === 'zalo') {
      alert('Phương thức này chưa có endpoint backend. Vui lòng chọn COD, ATM/VNPAY hoặc MoMo.')
      return
    }

    try {
      setPlacing(true)
      setGatewayPayment(null)
      await keepOnlySelectedForCheckout()
      const order = await ordersApi.create({
        receiverName: customer.name.trim(),
        phone: customer.phone.trim(),
        shippingAddress: address.trim(),
        note: delivery === 'home' ? null : delivery,
      })

      if (payment === 'momo') {
        const gateway = await paymentsApi.createMomo(order.orderId, `${window.location.origin}/tai-khoan`)
        window.location.href = gateway.paymentUrl
        return
      }

      if (payment === 'zalopay') {
        const gateway = await paymentsApi.createZaloPay(order.orderId, `${window.location.origin}/tai-khoan`)
        setGatewayPayment(gateway)
        return
      }

      if (payment === 'bank-transfer') {
        const gateway = await paymentsApi.createBankTransfer(order.orderId, `${window.location.origin}/tai-khoan`)
        setGatewayPayment(gateway)
        return
      }

      if (payment === 'atm' || payment === 'intl') {
        const gateway = await paymentsApi.createVnPay(order.orderId, `${window.location.origin}/tai-khoan`)
        window.location.href = gateway.paymentUrl
        return
      }

      clearCartState()
      alert('Đặt hàng thành công!')
      navigate('/tai-khoan')
    } catch (err) {
      alert(err.message || 'Không thể đặt hàng.')
    } finally {
      setPlacing(false)
    }
  }

  // Guard — nothing selected
  if (selectedItems.length === 0) {
    return <Navigate to="/gio-hang" replace />
  }

  return (
    <div className="container checkout-page">
      {/* ← Quay lại giỏ hàng */}
      <button
        className="checkout-back"
        onClick={() => navigate('/gio-hang')}
        id="checkout-back-btn"
        aria-label="Quay lại giỏ hàng"
      >
        <ChevronLeft size={15} />
        Quay lại giỏ hàng
      </button>

      <div className="checkout-layout">
        {/* Left column */}
        <div className="checkout-left">
          <CheckoutItemList items={selectedItems} />

          <CheckoutCustomerForm
            value={customer}
            onChange={handleCustomerChange}
          />

          <CheckoutDelivery
            method={delivery}
            onChange={setDelivery}
            address={address}
            onAddressChange={setAddress}
          />

          <CheckoutPayment
            method={payment}
            onChange={(nextPayment) => {
              setPayment(nextPayment)
              setGatewayPayment(null)
            }}
          />

          {gatewayPayment && (
            <div className="checkout-card checkout-qr-card">
              <h2 className="checkout-card-title">
                {gatewayPayment.method === 'ZaloPay' ? 'Thanh toan ZaloPay' : 'Thanh toan QR chuyen khoan'}
              </h2>
              <div className="checkout-qr-content">
                {gatewayPayment.qrCodeUrl && (
                  <img
                    className="checkout-qr-image"
                    src={gatewayPayment.qrCodeUrl}
                    alt="Ma QR thanh toan"
                  />
                )}
                <div className="checkout-qr-info">
                  <p>{gatewayPayment.instructions || 'Quet ma QR de thanh toan don hang.'}</p>
                  <div className="checkout-qr-row">
                    <span>Ma giao dich</span>
                    <strong>{gatewayPayment.transactionCode}</strong>
                  </div>
                  <div className="checkout-qr-row">
                    <span>So tien</span>
                    <strong>{gatewayPayment.amount?.toLocaleString('vi-VN')}d</strong>
                  </div>
                  <button
                    className="checkout-qr-btn"
                    onClick={() => {
                      clearCartState()
                      window.location.href = gatewayPayment.paymentUrl
                    }}
                  >
                    Toi da thanh toan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column — sticky summary */}
        <CheckoutSummary
          subtotal={subtotal}
          originalTotal={originalTotal}
          discount={discount}
          onPlaceOrder={handlePlaceOrder}
          placing={placing}
        />
      </div>
    </div>
  )
}

export default CheckoutPage
