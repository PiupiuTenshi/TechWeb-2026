import { useEffect, useState } from 'react'
import { Download, RefreshCw, TrendingUp, ShoppingBag, DollarSign, CheckCircle } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { reportsApi } from '../../api/adminApi'
import { getAuthState } from '../../api/client'

const formatCurrency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v ?? 0)

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div className="admin-stat-card">
      <div className={`admin-stat-icon ${color}`}><Icon size={22} /></div>
      <div className="admin-stat-info">
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  )
}

export default function AdminReports() {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const fmt = d => d.toISOString().slice(0, 10)

  const [from, setFrom] = useState(fmt(thirtyDaysAgo))
  const [to, setTo] = useState(fmt(today))
  const [groupBy, setGroupBy] = useState('day')
  const [revenue, setRevenue] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [rev, top, low] = await Promise.all([
        reportsApi.getRevenue({ from, to, groupBy }),
        reportsApi.getTopProducts({ from, to, take: 10 }),
        reportsApi.getLowStock({ take: 20 }),
      ])
      setRevenue(rev)
      setTopProducts(top)
      setLowStock(low)
    } catch (err) {
      setError(err.message || 'Không thể tải báo cáo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const chartData = (revenue?.points || []).map(p => ({
    name: p.period,
    'Doanh thu': p.revenue,
    'Đơn hàng': p.orders,
  }))

  const handleExport = () => {
    const auth = getAuthState()
    const url = reportsApi.getExportUrl({ from, to, groupBy })
    const a = document.createElement('a')
    a.href = url
    a.download = `techshop-revenue-${from}-${to}.xlsx`
    // Add auth token to download URL via fetch + blob
    fetch(url, { headers: { Authorization: `Bearer ${auth?.accessToken}` } })
      .then(r => r.blob())
      .then(blob => {
        const burl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = burl
        link.download = `techshop-revenue-${from}-${to}.xlsx`
        link.click()
        URL.revokeObjectURL(burl)
      })
      .catch(() => alert('Không thể xuất file. Vui lòng thử lại.'))
  }

  return (
    <div className="admin-content">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>Báo cáo & Thống kê</h1>
          <p>Phân tích doanh thu, đơn hàng và sản phẩm</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            id="btn-refresh-report"
            className="admin-btn admin-btn-secondary"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Làm mới
          </button>
          <button
            id="btn-export-report"
            className="admin-btn admin-btn-primary"
            onClick={handleExport}
          >
            <Download size={14} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Date range controls */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card-body" style={{ padding: '14px 20px' }}>
          <div className="admin-filters">
            <div className="admin-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <label className="admin-form-label" style={{ whiteSpace: 'nowrap', margin: 0 }}>Từ ngày</label>
              <input id="report-from" type="date" className="admin-form-input" style={{ width: 150 }} value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="admin-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <label className="admin-form-label" style={{ whiteSpace: 'nowrap', margin: 0 }}>Đến ngày</label>
              <input id="report-to" type="date" className="admin-form-input" style={{ width: 150 }} value={to} onChange={e => setTo(e.target.value)} />
            </div>
            <div className="admin-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <label className="admin-form-label" style={{ whiteSpace: 'nowrap', margin: 0 }}>Nhóm theo</label>
              <select id="report-group-by" className="admin-form-select" style={{ width: 130 }} value={groupBy} onChange={e => setGroupBy(e.target.value)}>
                <option value="day">Ngày</option>
                <option value="month">Tháng</option>
              </select>
            </div>
            <button className="admin-btn admin-btn-primary" onClick={load} disabled={loading}>
              {loading ? 'Đang tải...' : 'Áp dụng'}
            </button>
            {/* Quick presets */}
            {[
              ['7 ngày', 7], ['30 ngày', 30], ['90 ngày', 90]
            ].map(([label, days]) => (
              <button
                key={days}
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => {
                  const end = new Date()
                  const start = new Date()
                  start.setDate(start.getDate() - days)
                  setFrom(fmt(start))
                  setTo(fmt(end))
                }}
              >{label}</button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Summary stats */}
      <div className="admin-stats-grid" style={{ marginBottom: 20 }}>
        <StatBox icon={DollarSign} label="Tổng doanh thu" value={formatCurrency(revenue?.totalRevenue)} color="blue" />
        <StatBox icon={ShoppingBag} label="Tổng đơn hàng" value={revenue?.totalOrders ?? '—'} color="green" />
        <StatBox icon={TrendingUp} label="Giá trị đơn TB" value={formatCurrency(revenue?.averageOrderValue)} color="purple" />
        <StatBox icon={CheckCircle} label="Đơn hoàn thành" value={revenue?.completedOrders ?? '—'} color="teal" />
      </div>

      {/* Revenue chart */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card-header">
          <span className="admin-card-title">Biểu đồ doanh thu</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {from} → {to}
          </span>
        </div>
        <div className="admin-card-body admin-chart-wrap">
          {loading ? (
            <div className="admin-loading"><div className="admin-spinner" /></div>
          ) : chartData.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">📊</div>
              <div className="admin-empty-title">Chưa có dữ liệu trong khoảng thời gian này</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="colorRevReport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e31837" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#e31837" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}K`}
                />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(v, name) => [
                    name === 'Doanh thu' ? formatCurrency(v) : v,
                    name
                  ]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  yAxisId="left" type="monotone" dataKey="Doanh thu"
                  stroke="#e31837" strokeWidth={2.5} fill="url(#colorRevReport)" dot={false}
                />
                <Bar yAxisId="right" dataKey="Đơn hàng" fill="#ffb3be" radius={[3,3,0,0]} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom: top products + low stock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top products */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">Top 10 sản phẩm bán chạy</span>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Chưa có dữ liệu</td></tr>
                  ) : topProducts.map((p, i) => (
                    <tr key={p.variantId}>
                      <td>
                        <span style={{
                          width: 22, height: 22, borderRadius: 6, fontSize: 11, fontWeight: 800,
                          background: i < 3 ? '#fef9c3' : '#f1f5f9',
                          color: i < 3 ? '#854d0e' : '#64748b',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                        }}>{i + 1}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{p.productName}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.variantInfo || '—'}</div>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 600 }}>{p.quantitySold}</td>
                      <td style={{ fontSize: 12, fontWeight: 700, color: '#e31837' }}>{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low stock */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">⚠️ Cảnh báo tồn kho thấp</span>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            <div className="admin-table-wrap" style={{ maxHeight: 400, overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>SKU</th>
                    <th>Tồn kho</th>
                    <th>Ngưỡng</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 32, color: '#16a34a' }}>
                        ✅ Tất cả SKU còn hàng đầy đủ
                      </td>
                    </tr>
                  ) : lowStock.map(item => (
                    <tr key={item.inventoryId}>
                      <td>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{item.productName}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.variantInfo}</div>
                      </td>
                      <td><span className="admin-tag" style={{ fontFamily: 'monospace', fontSize: 10 }}>{item.sku}</span></td>
                      <td>
                        <span className={item.quantity === 0 ? 'stock-out' : 'stock-low'}>
                          {item.quantity}
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: 12 }}>{item.lowStockAlert}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`.spin { animation: adminSpin 0.8s linear infinite; }`}</style>
    </div>
  )
}
