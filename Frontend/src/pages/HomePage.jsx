import { useNavigate } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import ProductSection from '../components/ProductSection/ProductSection'

const PHONE_TABS = ['iPhone', 'Samsung', 'Xiaomi', 'Vivo', 'Realme', 'Oppo']
const LAPTOP_TABS = ['MacBook', 'Lenovo', 'Dell', 'Asus', 'Acer', 'Msi']
const ACCESSORY_TABS = ['Bàn phím', 'Tai nghe', 'Chuột']

function HomePage() {
  const navigate = useNavigate()
  const { phones, laptops, accessories, loading, error } = useProducts()

  if (loading) return <div className="container">Đang tải sản phẩm...</div>
  if (error) return <div className="container">{error}</div>

  return (
    <div className="container">
      <ProductSection
        title="Điện thoại"
        tabs={PHONE_TABS}
        products={phones}
        activeTab=""
        onTabChange={(tab) => navigate(`/dien-thoai/${tab.toLowerCase()}`)}
        maxVisible={10}
        linkTo="/dien-thoai"
      />

      <ProductSection
        title="Laptop"
        tabs={LAPTOP_TABS}
        products={laptops}
        activeTab=""
        onTabChange={(tab) => navigate(`/laptop/${tab.toLowerCase()}`)}
        maxVisible={10}
        linkTo="/laptop"
      />

      <ProductSection
        title="Phụ kiện"
        tabs={ACCESSORY_TABS}
        products={accessories}
        activeTab=""
        onTabChange={(tab) => navigate('/phu-kien', { state: { selectedBrand: tab } })}
        maxVisible={15}
        linkTo="/phu-kien"
      />
    </div>
  )
}

export default HomePage
