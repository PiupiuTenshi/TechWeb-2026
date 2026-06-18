import { GoogleOAuthProvider } from '@react-oauth/google'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import AuthModal from './components/Auth/AuthModal'
import CartToast from './components/CartToast/CartToast'
import Footer from './components/Footer/Footer'
import Header from './components/Header/Header'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import AccessoryPage from './pages/AccessoryPage'
import AccountPage from './pages/AccountPage'
import BrandSeriesPage from './pages/BrandSeriesPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import HomePage from './pages/HomePage'
import LaptopPage from './pages/LaptopPage'
import NotFound from './pages/NotFound'
import PhonePage from './pages/PhonePage'
import ProductDetailPage from './pages/ProductDetailPage'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminInventory from './pages/admin/AdminInventory'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminPromotions from './pages/admin/AdminPromotions'
import AdminReports from './pages/admin/AdminReports'
import AdminUsers from './pages/admin/AdminUsers'
import AdminLayout from './pages/admin/components/AdminLayout'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '921390862640-24aj2efd2mod0ocrffgoobe0r35rln9j.apps.googleusercontent.com'

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <AuthModal />
            <CartToast />
          </div>
        } />
      </Routes>
    </GoogleOAuthProvider>
  )
}

export default App
