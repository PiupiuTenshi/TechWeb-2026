import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h1 style={{ fontSize: '72px', margin: '0 0 16px', color: '#e53e3e' }}>404</h1>
      <p style={{ fontSize: '18px', margin: '0 0 32px', color: '#666' }}>
        Trang bạn tìm không tồn tại.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          padding: '12px 32px',
          background: '#e53e3e',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: 600,
        }}
      >
        Về trang chủ
      </Link>
    </div>
  )
}
