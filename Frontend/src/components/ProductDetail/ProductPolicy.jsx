import './ProductPolicy.css'

import iconWarranty  from '../../assets/Type_Bao_hanh_chinh_hang.svg'
import iconShipping  from '../../assets/Type_Mien_phi_giao_hang.svg'
import iconSetup     from '../../assets/Type_Cai_dat.svg'
import iconSupport   from '../../assets/icon_ktv.svg'
import iconDiscount  from '../../assets/Type_report_money.svg'

const POLICIES = [
  { icon: iconWarranty, text: 'Hàng chính hãng - Bảo hành 24 tháng' },
  { icon: iconShipping, text: 'Giao hàng miễn phí toàn quốc' },
  { icon: iconSetup,    text: 'Hỗ trợ cài đặt miễn phí' },
  { icon: iconSupport,  text: 'Kỹ thuật viên hỗ trợ trực tuyến' },
  { icon: iconDiscount, text: 'Chiết khấu dành riêng cho doanh nghiệp' },
]

/**
 * ProductPolicy — "Chính sách sản phẩm" sidebar card.
 * Stateless — renders the same policies for every product.
 */
function ProductPolicy() {
  return (
    <aside className="product-policy" aria-label="Chính sách sản phẩm">
      <h3 className="product-policy-title">Chính sách sản phẩm</h3>
      <ul className="product-policy-list">
        {POLICIES.map((p, i) => (
          <li key={i} className="product-policy-item">
            <img
              src={p.icon}
              alt=""
              className="product-policy-icon"
              aria-hidden="true"
            />
            <span className="product-policy-text">{p.text}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default ProductPolicy
