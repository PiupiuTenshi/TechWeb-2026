import { Routes, Route } from 'react-router-dom'
import './App.css'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage'
import PhonePage from './pages/PhonePage'
import LaptopPage from './pages/LaptopPage'
import AccessoryPage from './pages/AccessoryPage'
import BrandSeriesPage from './pages/BrandSeriesPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AccountPage from './pages/AccountPage'
import AuthModal from './components/Auth/AuthModal'

// Admin
import AdminLayout from './pages/admin/components/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminInventory from './pages/admin/AdminInventory'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPromotions from './pages/admin/AdminPromotions'
import AdminReports from './pages/admin/AdminReports'

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ── Admin routes (own layout, no public Header/Footer) ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="san-pham" element={<AdminProducts />} />
          <Route path="don-hang" element={<AdminOrders />} />
          <Route path="kho-hang" element={<AdminInventory />} />
          <Route path="nguoi-dung" element={<AdminUsers />} />
          <Route path="khuyen-mai" element={<AdminPromotions />} />
          <Route path="bao-cao" element={<AdminReports />} />
        </Route>

        {/* ── Public routes (with Header/Footer) ── */}
        <Route path="/*" element={
          <div className="app">
            <Header />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dien-thoai" element={<PhonePage />} />
                <Route path="/dien-thoai/:brand" element={<BrandSeriesPage type="phone" />} />
                <Route path="/laptop" element={<LaptopPage />} />
                <Route path="/laptop/:brand" element={<BrandSeriesPage type="laptop" />} />
                <Route path="/phu-kien" element={<AccessoryPage />} />
                <Route path="/san-pham/:id" element={<ProductDetailPage />} />
                <Route path="/gio-hang" element={<CartPage />} />
                <Route path="/thanh-toan" element={<CheckoutPage />} />
                <Route path="/tai-khoan" element={<AccountPage />} />
              </Routes>
            </main>
            <Footer />
            <AuthModal />
          </div>
        } />
      </Routes>
    </>
  )
}

export default App
