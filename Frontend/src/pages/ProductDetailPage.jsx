import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { productsApi } from '../api/client'
import { mapProductDetail } from '../api/mappers'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb'
import ProductDetailHero from '../components/ProductDetail/ProductDetailHero'
import ProductSpecsTable from '../components/ProductDetail/ProductSpecsTable'
import AccessoryDescription from '../components/ProductDetail/AccessoryDescription'
import ProductPolicy from '../components/ProductDetail/ProductPolicy'
import './ProductDetailPage.css'

const PHONE_BRAND_SLUG = {
  iPhone: 'iphone',
  Samsung: 'samsung',
  Xiaomi: 'xiaomi',
  Vivo: 'vivo',
  Realme: 'realme',
  Oppo: 'oppo',
}

const LAPTOP_BRAND_SLUG = {
  MacBook: 'macbook',
  Lenovo: 'lenovo',
  Dell: 'dell',
  Asus: 'asus',
  Acer: 'acer',
  Msi: 'msi',
}

function ProductDetailPage() {
  const { id: slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      setLoading(true)
      setNotFound(false)
      try {
        const dto = await productsApi.detail(slug)
        if (!cancelled) {
          setProduct(mapProductDetail(dto))
        }
      } catch {
        if (!cancelled) {
          setProduct(null)
          setNotFound(true)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProduct()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return <div className="container product-detail-page">Đang tải sản phẩm...</div>
  }

  if (notFound || !product) {
    return <Navigate to="/" replace />
  }

  const type = product.type
  let breadcrumbItems

  if (type === 'accessory') {
    breadcrumbItems = [
      { label: 'Trang chủ', to: '/' },
      { label: 'Phụ kiện', to: '/phu-kien' },
      { label: product.name },
    ]
  } else {
    const categoryLabel = type === 'phone' ? 'Điện thoại' : 'Laptop'
    const categoryPath = type === 'phone' ? '/dien-thoai' : '/laptop'
    const slugMap = type === 'phone' ? PHONE_BRAND_SLUG : LAPTOP_BRAND_SLUG
    const brandSlug = slugMap[product.brand] || product.brand.toLowerCase()
    const brandPath = `${categoryPath}/${brandSlug}`

    breadcrumbItems = [
      { label: 'Trang chủ', to: '/' },
      { label: categoryLabel, to: categoryPath },
      { label: product.brand, to: brandPath },
      { label: product.name },
    ]
  }

  return (
    <div className="container product-detail-page">
      <Breadcrumb items={breadcrumbItems} />

      <ProductDetailHero product={product} />

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
