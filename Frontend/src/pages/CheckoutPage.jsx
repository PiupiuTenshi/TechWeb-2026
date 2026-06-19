import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersApi, paymentsApi, userApi } from '../api/client'
import CheckoutItemList     from '../components/Checkout/CheckoutItemList'
import CheckoutCustomerForm from '../components/Checkout/CheckoutCustomerForm'
import CheckoutDelivery     from '../components/Checkout/CheckoutDelivery'
import CheckoutPayment      from '../components/Checkout/CheckoutPayment'
import CheckoutSummary      from '../components/Checkout/CheckoutSummary'
import './CheckoutPage.css'

function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    items,
    loading,
    selectedItems,
    subtotal,
    originalTotal,
    discount,
    refresh,
    selectCartItems,
  } = useCart()
  const { user, openLogin, updateUser } = useAuth()

  const [customer, setCustomer] = useState(() => ({
    name: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
  }))
  const [delivery, setDelivery] = useState('home')
  const [address,  setAddress ] = useState('')
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [payment,  setPayment ] = useState('cod')
  const [placing,  setPlacing ] = useState(false)
  const userId = user?.userId
  const userEmail = user?.email || ''

  const selectedAddress = useMemo(
    () => addresses.find(item => item.addressId === selectedAddressId),
    [addresses, selectedAddressId],
  )
  const routeSelectedCartItemIds = useMemo(
    () => Array.isArray(location.state?.selectedCartItemIds) ? location.state.selectedCartItemIds : [],
    [location.state],
  )

  useEffect(() => {
    if (selectedItems.length === 0 && routeSelectedCartItemIds.length > 0 && items.length > 0) {
      selectCartItems(routeSelectedCartItemIds)
    }
  }, [items.length, routeSelectedCartItemIds, selectedItems.length, selectCartItems])

  useEffect(() => {
    if (!userId) return

    let mounted = true

    async function loadCheckoutProfile() {
      try {
        const [profile, savedAddresses] = await Promise.all([
          userApi.getMe(),
          userApi.listAddresses(),
        ])

        if (!mounted) return

        updateUser({
          fullName: profile.fullName,
          phone: profile.phone,
          avatarUrl: profile.avatarUrl,
          role: profile.role,
        })

        setCustomer({
          name: profile.fullName || '',
          phone: profile.phone || '',
          email: profile.email || userEmail,
        })
        setAddresses(savedAddresses)

        const defaultAddress = savedAddresses.find(item => item.isDefault) || savedAddresses[0]
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.addressId)
          setAddress(defaultAddress.fullAddress || '')
          setCustomer(prev => ({
            ...prev,
            name: prev.name || defaultAddress.receiverName,
            phone: prev.phone || defaultAddress.phone,
          }))
        } else {
          setSelectedAddressId('new')
        }
      } catch {
        if (mounted) setSelectedAddressId('new')
      }
    }

    loadCheckoutProfile()
    return () => { mounted = false }
  }, [userId, userEmail, updateUser])

  const handleCustomerChange = (field, value) =>
    setCustomer(prev => ({ ...prev, [field]: value }))

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId)
    if (addressId === 'new') {
      setAddress('')
      return
    }

    const nextAddress = addresses.find(item => item.addressId === addressId)
    if (nextAddress) {
      setAddress(nextAddress.fullAddress || '')
      setCustomer(prev => ({
        ...prev,
        name: prev.name || nextAddress.receiverName,
        phone: prev.phone || nextAddress.phone,
      }))
    }
  }

  const createPayment = async (orderId) => {
    const returnUrl = `${window.location.origin}/tai-khoan`
    if (payment === 'momo') return paymentsApi.createMomo(orderId, returnUrl)
    if (payment === 'atm' || payment === 'intl') return paymentsApi.createVnPay(orderId, returnUrl)
    if (payment === 'qr') return paymentsApi.createQr(orderId, returnUrl)
    if (payment === 'zalo') return paymentsApi.createZaloPay(orderId, returnUrl)
    return null
  }

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      alert('Vui long chon san pham trong gio hang truoc khi dat hang.')
      navigate('/gio-hang')
      return
    }

    if (!user) {
      openLogin()
      alert('Bạn cần đăng nhập trước khi đặt hàng.')
      return
    }

    const receiverName = customer.name.trim() || selectedAddress?.receiverName || user.fullName || ''
    const phone = customer.phone.trim() || selectedAddress?.phone || user.phone || ''
    const shippingAddress = selectedAddressId && selectedAddressId !== 'new'
      ? selectedAddress?.fullAddress || ''
      : address.trim()

    if (!receiverName || !phone || !shippingAddress) {
      alert('Vui lòng bổ sung số điện thoại và địa chỉ trong Thông tin tài khoản, hoặc nhập địa chỉ mới tại bước nhận hàng.')
      return
    }

    try {
      setPlacing(true)

      const selectedCartItemIds = selectedItems.map(item => item.id)
      const order = await ordersApi.create({
        receiverName,
        phone,
        shippingAddress,
        addressId: selectedAddressId && selectedAddressId !== 'new' ? selectedAddressId : null,
        note: delivery === 'home' ? null : delivery,
        selectedCartItemIds,
      })

      await refresh()

      const gateway = await createPayment(order.orderId)
      if (gateway?.paymentUrl) {
        window.location.href = gateway.paymentUrl
        return
      }

      alert('Đặt hàng thành công!')
      navigate('/tai-khoan')
    } catch (err) {
      alert(err.message || 'Không thể đặt hàng.')
    } finally {
      setPlacing(false)
    }
  }

  if (loading || (selectedItems.length === 0 && routeSelectedCartItemIds.length > 0 && items.length > 0)) {
    return (
      <div className="container checkout-page">
        <p>Dang chuan bi checkout...</p>
      </div>
    )
  }

  if (selectedItems.length === 0) {
    return <Navigate to="/gio-hang" replace />
  }

  return (
    <div className="container checkout-page">
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
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            onAddressSelect={handleAddressSelect}
          />

          <CheckoutPayment
            method={payment}
            onChange={setPayment}
          />
        </div>

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
