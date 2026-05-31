import { useEffect, useMemo, useState } from 'react'
import { ordersApi } from '../../api/client'
import './AccountContent.css'

const ORDER_TABS = [
  { id: 'processing', label: 'Đang xử lý' },
  { id: 'shipping', label: 'Đang vận chuyển' },
  { id: 'done', label: 'Hoàn thành' },
]

function formatPrice(price) {
  return Number(price || 0).toLocaleString('vi-VN') + 'đ'
}

function orderGroup(status) {
  if (status === 'Completed') return 'done'
  if (status === 'Shipping' || status === 'Paid') return 'shipping'
  return 'processing'
}

function AccountOrders() {
  const [activeTab, setActiveTab] = useState('processing')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadOrders() {
      setLoading(true)
      setError('')
      try {
        const data = await ordersApi.list()
        if (!cancelled) {
          setOrders(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Không tải được đơn hàng.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadOrders()
    return () => {
      cancelled = true
    }
  }, [])

  const visibleOrders = useMemo(
    () => orders.filter(order => orderGroup(order.status) === activeTab),
    [orders, activeTab]
  )

  return (
    <div className="account-content">
      <h2 className="account-content-title">Quản lý đơn hàng</h2>

      <div className="account-orders-tabs" role="tablist">
        {ORDER_TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`account-orders-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            id={`orders-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p className="account-orders-empty">Đang tải đơn hàng...</p>}
      {error && <p className="account-orders-empty">{error}</p>}

      {!loading && !error && visibleOrders.length === 0 && (
        <p className="account-orders-empty">Bạn chưa đặt mua sản phẩm.</p>
      )}

      {!loading && !error && visibleOrders.map(order => (
        <div key={order.orderId} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
          <strong>Đơn #{String(order.orderId).slice(0, 8)}</strong>
          <p style={{ margin: '6px 0' }}>Trạng thái: {order.status}</p>
          <p style={{ margin: '6px 0' }}>Số lượng: {order.itemCount}</p>
          <p style={{ margin: 0 }}>Tổng tiền: {formatPrice(order.grandTotal)}</p>
        </div>
      ))}
    </div>
  )
}

export default AccountOrders
