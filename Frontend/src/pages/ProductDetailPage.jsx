import { useParams, Navigate } from 'react-router-dom'
import { phones, laptops, accessories } from '../data/products'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb'
import ProductDetailHero from '../components/ProductDetail/ProductDetailHero'
import ProductSpecsTable from '../components/ProductDetail/ProductSpecsTable'
import AccessoryDescription from '../components/ProductDetail/AccessoryDescription'
import ProductPolicy from '../components/ProductDetail/ProductPolicy'
import './ProductDetailPage.css'

// ─── Brand slug helpers (for building breadcrumb links) ───────────────────────
const PHONE_BRAND_SLUG = {
  iPhone:  'iphone',
  Samsung: 'samsung',
  Xiaomi:  'xiaomi',
  Vivo:    'vivo',
  Realme:  'realme',
  Oppo:    'oppo',
}

const LAPTOP_BRAND_SLUG = {
  MacBook: 'macbook',
  Lenovo:  'lenovo',
  Dell:    'dell',
  Asus:    'asus',
  Acer:    'acer',
  Msi:     'msi',
}

/**
 * ProductDetailPage
 *
 * Route: /san-pham/:id
 * Looks up the product by id across phones, laptops, and accessories.
 * Redirects to / if not found.
 */
function ProductDetailPage() {
  const { id } = useParams()
  const numId  = Number(id)

  // Find product across all three collections
  let product = null
  let type    = null

  const phone = phones.find(p => p.id === numId)
  if (phone) {
    product = phone
    type    = 'phone'
  } else {
    const laptop = laptops.find(p => p.id === numId)
    if (laptop) {
      product = laptop
      type    = 'laptop'
    } else {
      const accessory = accessories.find(p => p.id === numId)
      if (accessory) {
        product = accessory
        type    = 'accessory'
      }
    }
  }

  // Guard — unknown id
  if (!product) {
    return <Navigate to="/" replace />
  }

  // Build breadcrumb
  let breadcrumbItems
  if (type === 'accessory') {
    breadcrumbItems = [
      { label: 'Trang chủ', to: '/' },
      { label: 'Phụ kiện',  to: '/phu-kien' },
      { label: product.name },
    ]
  } else {
    const categoryLabel = type === 'phone' ? 'Điện thoại' : 'Laptop'
    const categoryPath  = type === 'phone' ? '/dien-thoai' : '/laptop'
    const slugMap       = type === 'phone' ? PHONE_BRAND_SLUG : LAPTOP_BRAND_SLUG
    const brandSlug     = slugMap[product.brand] || product.brand.toLowerCase()
    const brandPath     = `${categoryPath}/${brandSlug}`

    breadcrumbItems = [
      { label: 'Trang chủ',   to: '/' },
      { label: categoryLabel, to: categoryPath },
      { label: product.brand, to: brandPath },
      { label: product.name },
    ]
  }

  return (
    <div className="container product-detail-page">
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero: image + name/price/buttons */}
      <ProductDetailHero product={product} />

      {/* Bottom: info section + policy sidebar */}
      <div className="product-detail-bottom">
        <div className="product-detail-specs-col">
          {type === 'accessory' ? (
            <AccessoryDescription description={product.description} />
          ) : (
            <ProductSpecsTable product={product} type={type} />
          )}
        </div>

        <div className="product-detail-policy-col">
          <ProductPolicy />
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
