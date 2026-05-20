import './Footer.css'

const paymentMethods = [
  { label: 'Visa',       cls: 'visa'   },
  { label: 'Mastercard', cls: 'master' },
  { label: 'JCB',        cls: 'jcb'   },
  { label: 'MoMo',       cls: 'momo'  },
  { label: 'ZaloPay',    cls: 'zalo'  },
  { label: 'VNPay',      cls: 'vnpay' },
  { label: 'COD',        cls: 'cod'   },
]

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Col 1: Về Tech Shop */}
        <div className="footer-col">
          <h3>VỀ TECH SHOP</h3>
          <ul>
            <li><a href="#gioi-thieu">Giới thiệu</a></li>
            <li><a href="#tuyen-dung">Tuyển dụng</a></li>
            <li><a href="#lien-he">Liên hệ</a></li>
          </ul>
        </div>

        {/* Col 2: Chính sách */}
        <div className="footer-col">
          <h3>CHÍNH SÁCH</h3>
          <ul>
            <li><a href="#chinh-sach-bao-hanh">Chính sách bảo hành</a></li>
            <li><a href="#chinh-sach-giao-hang">Chính sách giao hàng</a></li>
            <li><a href="#chinh-sach-bao-mat">Chính sách bảo mật</a></li>
          </ul>
        </div>

        {/* Col 3: Tổng đài hỗ trợ */}
        <div className="footer-col">
          <h3>TỔNG ĐÀI HỖ TRỢ (8:00 – 21:00)</h3>
          <div className="footer-hotline-item">
            <span className="label">Mua hàng:</span>
            <span className="value">1900.5301</span>
          </div>
          <div className="footer-hotline-item">
            <span className="label">Bảo hành:</span>
            <span className="value">1900.5325</span>
          </div>
          <div className="footer-hotline-item">
            <span className="label">Khiếu nại:</span>
            <span className="value">1900.4173</span>
          </div>
          <div className="footer-hotline-item">
            <span className="label">Email:</span>
            <span className="value email">cskh@TechShop.com</span>
          </div>
        </div>

        {/* Col 4: Hỗ trợ thanh toán */}
        <div className="footer-col">
          <h3>HỖ TRỢ THANH TOÁN</h3>
          <div className="footer-payment-icons">
            {paymentMethods.map(m => (
              <span key={m.label} className={`footer-payment-icon ${m.cls}`}>
                {m.label}
              </span>
            ))}
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} TechShop. Tất cả quyền được bảo lưu.
      </div>
    </footer>
  )
}

export default Footer
