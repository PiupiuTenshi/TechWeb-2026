import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse,
  Users, Tag, BarChart2, LogOut
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

const navGroups = [
  {
    label: 'Tổng quan',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/admin/bao-cao', icon: BarChart2, label: 'Báo cáo' },
    ],
  },
  {
    label: 'Quản lý',
    items: [
      { to: '/admin/san-pham', icon: Package, label: 'Sản phẩm' },
      { to: '/admin/don-hang', icon: ShoppingCart, label: 'Đơn hàng' },
      { to: '/admin/kho-hang', icon: Warehouse, label: 'Kho hàng' },
      { to: '/admin/khuyen-mai', icon: Tag, label: 'Khuyến mãi' },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { to: '/admin/nguoi-dung', icon: Users, label: 'Người dùng' },
    ],
  },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
    : 'AD'

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="admin-sidebar-logo">
        <div className="admin-sidebar-logo-icon">
          <Package size={20} color="white" />
        </div>
        <div className="admin-sidebar-logo-text">
          <strong>TechShop</strong>
          <span>Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar-nav">
        {navGroups.map(group => (
          <div key={group.label} className="admin-nav-section">
            <div className="admin-nav-section-label">{group.label}</div>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `admin-nav-item${isActive ? ' active' : ''}`
                }
              >
                <span className="admin-nav-icon">
                  <item.icon size={18} />
                </span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer — thông tin user + đăng xuất */}
      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user" onClick={handleLogout} title="Đăng xuất">
          <div className="admin-sidebar-avatar">{initials}</div>
          <div className="admin-sidebar-user-info">
            <div className="admin-sidebar-user-name">{user?.fullName || 'Admin'}</div>
            <div className="admin-sidebar-user-role">
              {user?.roleName || 'Quản trị viên'}
            </div>
          </div>
          <LogOut size={15} style={{ color: 'rgba(196,160,166,0.6)', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  )
}
