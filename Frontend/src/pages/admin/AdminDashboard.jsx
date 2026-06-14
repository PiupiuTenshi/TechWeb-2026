import { useEffect, useState } from 'react'
import {
  BarChart2, TrendingUp, AlertTriangle, DollarSign,
  ShoppingCart, ArrowUpRight, Eye
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { reportsApi, adminOrdersApi, adminUsersApi, inventoryApi } from '../../api/adminApi'
import { useNavigate } from 'react-router-dom'

const formatCurrency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v ?? 0)

const ORDER_STATUS_COLOR = {
  Pending:    'admin-badge-warning',
  Processing: 'admin-badge-info',
  Shipped:    'admin-badge-purple',
  Delivered:  'admin-badge-success',
  Completed:  'admin-badge-success',
  Cancelled:  'admin-badge-danger',
  Paid:       'admin-badge-info',
}

const ORDER_STATUS_LABEL = {
  Pending: 'Chờ xử lý', Processing: 'Đang xử lý', Shipped: 'Đang giao',
  Delivered: 'Đã giao', Completed: 'Hoàn thành', Cancelled: 'Đã hủy', Paid: 'Đã thanh toán',
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="admin-stat-card">
      <div className={`admin-stat-icon ${color}`}><Icon size={22} /></div>
      <div className="admin-stat-info">
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
        {sub && <div className="admin-stat-change up">{sub}</div>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [revenue, setRevenue] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [rev, top, low, orders] = await Promise.allSettled([
          reportsApi.getRevenue({ groupBy: 'day' }),
          reportsApi.getTopProducts({ take: 5 }),
          reportsApi.getLowStock({ take: 8 }),
          adminOrdersApi.list({ pageSize: 8 }),
        ])

        if (rev.status === 'fulfilled') setRevenue(rev.value)
        if (top.status === 'fulfilled') setTopProducts(top.value)
        if (low.status === 'fulfilled') setLowStock(low.value)
        if (orders.status === 'fulfilled') setRecentOrders(orders.value?.data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const chartData = (revenue?.points || []).slice(-14).map(p => ({
    name: p.period?.slice(5) || '',
    revenue: p.revenue,
    orders: p.orders,
  }))

  if (loading) {
    return (
      <div className="admin-content">
        <div className="admin-loading"><div className="admin-spinner" /></div>
      </div>
    )
  }

  return (
    <div className="admin-content">
      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Tổng quan hoạt động cửa hàng</p>
        </div>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => navigate('/admin/bao-cao')}
        >
          <BarChart2 size={15} /> Xem báo cáo đầy đủ
        </button>
      </div>

      {/* Stat cards */}
      <div className="admin-stats-grid">
        <StatCard
          icon={DollarSign}
          label="Doanh thu (30 ngày)"
          value={formatCurrency(revenue?.totalRevenue)}
          color="red"
          sub={`${revenue?.totalOrders ?? 0} đơn hàng`}
        />
        <StatCard
          icon={ShoppingCart}
          label="Đơn hàng (30 ngày)"
          value={revenue?.totalOrders ?? '—'}
          color="green"
          sub={`Hoàn thành: ${revenue?.completedOrders ?? 0}`}
        />
        <StatCard
          icon={TrendingUp}
          label="Giá trị đơn TB"
          value={formatCurrency(revenue?.averageOrderValue)}
          color="purple"
        />
        <StatCard
          icon={AlertTriangle}
          label="SKU sắp hết hàng"
          value={lowStock.length}
          color="amber"
          sub={lowStock.length > 0 ? 'Cần nhập thêm' : 'Đang ổn'}
        />
      </div>

      {/* Charts row */}
      <div className="admin-report-grid" style={{ marginBottom: 20 }}>
        {/* Revenue chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">Doanh thu 14 ngày gần nhất</span>
          </div>
          <div className="admin-card-body admin-chart-wrap">
            {chartData.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">📊</div>
                <div className="admin-empty-title">Chưa có dữ liệu</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e31837" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#e31837" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={v => (v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}K`)}
                  />
                  <Tooltip
                    formatter={(v) => [formatCurrency(v), 'Doanh thu']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Area
                    type="monotone" dataKey="revenue" stroke="#e31837" strokeWidth={2.5}
                    fill="url(#colorRev)" dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top products */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">Top sản phẩm bán chạy</span>
            <button
              className="admin-btn admin-btn-ghost admin-btn-sm"
              onClick={() => navigate('/admin/bao-cao')}
            >
              <Eye size={13} /> Xem thêm
            </button>
          </div>
          <div className="admin-card-body" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topProducts.length === 0 ? (
              <div className="admin-empty" style={{ padding: 24 }}>Chưa có dữ liệu</div>
            ) : topProducts.map((p, i) => (
              <div key={p.variantId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: i === 0 ? '#fef9c3' : '#f1f5f9',
                  color: i === 0 ? '#854d0e' : '#64748b',
                  fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>{i + 1}</span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.productName}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.variantInfo || '—'}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#e31837' }}>{formatCurrency(p.revenue)}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.quantitySold} sản phẩm</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">Đơn hàng gần đây</span>
            <button
              className="admin-btn admin-btn-ghost admin-btn-sm"
              onClick={() => navigate('/admin/don-hang')}
            >
              Xem tất cả <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>
                      Chưa có đơn hàng
                    </td>
                  </tr>
                ) : recentOrders.map(o => (
                  <tr key={o.orderId}>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        {o.customer?.fullName || o.customer?.email || 'Khách'}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#1d4ed8' }}>
                      {formatCurrency(o.grandTotal)}
                    </td>
                    <td>
                      <span className={`admin-badge ${ORDER_STATUS_COLOR[o.status] || 'admin-badge-gray'}`}>
                        {ORDER_STATUS_LABEL[o.status] || o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock warning */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">⚠️ Sắp hết hàng</span>
            <button
              className="admin-btn admin-btn-ghost admin-btn-sm"
              onClick={() => navigate('/admin/kho-hang')}
            >
              Xem kho <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>SKU</th>
                  <th>Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#16a34a', padding: 32 }}>
                      ✅ Tất cả SKU còn hàng
                    </td>
                  </tr>
                ) : lowStock.map(item => (
                  <tr key={item.inventoryId}>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{item.productName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.variantInfo || '—'}</div>
                    </td>
                    <td><span className="admin-tag">{item.sku}</span></td>
                    <td>
                      <span className={item.quantity === 0 ? 'stock-out' : 'stock-low'}>
                        {item.quantity}
                      </span>
                      <div className="stock-bar" style={{ marginTop: 4 }}>
                        <div
                          className="stock-bar-fill"
                          style={{
                            width: `${Math.min(100, (item.quantity / (item.lowStockAlert || 10)) * 100)}%`,
                            background: item.quantity === 0 ? '#dc2626' : '#d97706',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
