import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import AdminSidebar from './AdminSidebar'
import '../admin.css'

export default function AdminLayout() {
  const { user } = useAuth()

  // Guard: chỉ cho phép Admin hoặc Staff truy cập
  if (!user) {
    return <Navigate to="/" replace />
  }
  if (user.roleName !== 'Admin' && user.roleName !== 'Staff') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}
