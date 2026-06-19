import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, Smartphone, Laptop, Headphones } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import './Header.css'

function Header() {
  const [searchValue, setSearchValue] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef  = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { totalItems } = useCart()
  const { openLogin, user } = useAuth()

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (location.pathname === '/tim-kiem') {
      const params = new URLSearchParams(location.search)
      setSearchValue(params.get('q') || '')
    } else {
      setSearchValue('')
    }
  }, [location.pathname, location.search])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const query = searchValue.trim()
    if (!query) return
    navigate(`/tim-kiem?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link
          to="/"
          className="header-logo"
          onClick={() => {
            if (window.location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
        >
          techshop
        </Link>

        {/* Danh mục */}
        <div className="header-menu-wrapper" ref={menuRef}>
          <button
            className="header-menu-btn"
            id="header-danhmuc-btn"
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-expanded={isMenuOpen}
          >
            <Menu size={16} />
            <span>Danh mục</span>
          </button>

          {isMenuOpen && (
            <div className="header-dropdown">
              <Link to="/dien-thoai" className="header-dropdown-item" onClick={() => setIsMenuOpen(false)}>
                <Smartphone size={18} />
                <span>Điện thoại</span>
              </Link>
              <Link to="/laptop" className="header-dropdown-item" onClick={() => setIsMenuOpen(false)}>
                <Laptop size={18} />
                <span>Lap top</span>
              </Link>
              <Link to="/phu-kien" className="header-dropdown-item" onClick={() => setIsMenuOpen(false)}>
                <Headphones size={18} />
                <span>Phụ kiện</span>
              </Link>
            </div>
          )}
        </div>

        {/* Search */}
        <form className="header-search" onSubmit={handleSearchSubmit}>
          <button type="submit" className="header-search-icon" aria-label="Tìm kiếm">
            <Search size={16} />
          </button>
          <input
            id="header-search-input"
            type="text"
            placeholder="Bạn cần tìm gì?"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
          />
        </form>

        {/* Actions */}
        <div className="header-actions">
          <button
            className="header-action-btn"
            id="header-cart-btn"
            onClick={() => navigate('/gio-hang')}
            aria-label="Giỏ hàng"
          >
            <ShoppingCart size={18} />
            <span>Giỏ hàng</span>
            {totalItems > 0 && (
              <span className="header-cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>
            )}
          </button>
          {user ? (
            <button
              className="header-action-btn header-user-btn"
              id="header-account-btn"
              onClick={() => navigate('/tai-khoan')}
              aria-label={`Tài khoản ${user.fullName}`}
            >
              <User size={18} />
              <span className="header-user-text">
                <span className="header-user-greeting">Xin chào</span>
                <span className="header-user-name">{user.fullName}</span>
              </span>
            </button>
          ) : (
            <button
              className="header-action-btn"
              id="header-login-btn"
              onClick={openLogin}
              aria-label="Đăng nhập"
            >
              <User size={18} />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
