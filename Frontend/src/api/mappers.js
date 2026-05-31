function fallbackImage(name) {
  return `https://placehold.co/160x160/f4f4f5/111827?text=${encodeURIComponent(name || 'TechShop')}`
}

function displayBrand(product) {
  const name = product.name || product.productName || ''
  const brand = product.brand || ''
  const categorySlug = product.category?.slug || product.categorySlug

  if (categorySlug === 'phone' && name.toLowerCase().includes('iphone')) return 'iPhone'
  if (categorySlug === 'laptop' && name.toLowerCase().includes('macbook')) return 'MacBook'
  if (categorySlug === 'accessory' && name.toLowerCase().includes('tai nghe')) return 'Tai nghe'
  if (categorySlug === 'accessory' && name.toLowerCase().includes('chuột')) return 'Chuột'
  if (categorySlug === 'accessory' && name.toLowerCase().includes('bàn phím')) return 'Bàn phím'
  return brand || 'TechShop'
}

function productType(categorySlug) {
  if (categorySlug === 'phone') return 'phone'
  if (categorySlug === 'laptop') return 'laptop'
  if (categorySlug === 'accessory') return 'accessory'
  return 'product'
}

function parseCapacity(value, fallback = 256) {
  if (!value) return fallback
  const match = String(value).match(/\d+/)
  return match ? Number(match[0]) : fallback
}

function discountLabel(basePrice, salePrice) {
  if (!basePrice || !salePrice || salePrice >= basePrice) return ''
  const percent = Math.round((1 - salePrice / basePrice) * 100)
  return percent > 0 ? `-${percent}%` : ''
}

function normalizeImage(thumbnailUrl, name) {
  if (!thumbnailUrl) return fallbackImage(name)
  if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
    return thumbnailUrl
  }
  return fallbackImage(name)
}

export function mapProductSummary(dto) {
  const basePrice = Number(dto.basePrice || 0)
  const salePrice = Number(dto.salePrice || dto.basePrice || 0)
  const categorySlug = dto.category?.slug
  const product = {
    productId: dto.productId,
    id: dto.slug,
    slug: dto.slug,
    name: dto.name,
    brand: displayBrand(dto),
    rawBrand: dto.brand,
    categorySlug,
    type: productType(categorySlug),
    image: normalizeImage(dto.thumbnailUrl, dto.name),
    thumbnailUrl: dto.thumbnailUrl,
    originalPrice: basePrice,
    salePrice,
    discount: discountLabel(basePrice, salePrice),
    rating: 4.8,
    ratingCount: 0,
    installment: 'Trả góp 0% - 12 tháng',
    storage: 256,
    ram: 8,
    series: '',
    isFeatured: dto.isFeatured,
  }

  return product
}

export function mapProductDetail(dto) {
  const summary = mapProductSummary(dto)
  const firstVariant = dto.variants?.[0]
  const storage = parseCapacity(firstVariant?.storage, summary.storage)
  const ram = parseCapacity(firstVariant?.ram, summary.ram)

  return {
    ...summary,
    description: dto.description || '',
    avgRating: dto.avgRating || 0,
    rating: dto.avgRating || summary.rating,
    images: dto.images || [],
    variants: dto.variants || [],
    variantId: firstVariant?.variantId,
    stock: firstVariant?.stock || 0,
    storage,
    ram,
    specifications: dto.specifications || [],
  }
}

export function mapCartItem(dto, selected = false) {
  const unitPrice = Number(dto.unitPrice || 0)
  return {
    id: dto.cartItemId,
    cartItemId: dto.cartItemId,
    variantId: dto.variantId,
    productId: dto.productId,
    slug: dto.productSlug,
    name: dto.productName || 'Sản phẩm',
    image: normalizeImage(dto.thumbnailUrl, dto.productName),
    salePrice: unitPrice,
    originalPrice: unitPrice,
    brand: '',
    quantity: dto.quantity,
    selected,
    stock: dto.stock,
    variantInfo: dto.variantInfo,
  }
}

export function mapCart(dto, selectedById = {}, fallbackSelected = false) {
  const rawItems = Array.from(dto?.items || [])
  return rawItems.map(item => mapCartItem(
    item,
    selectedById[item.cartItemId] ?? fallbackSelected
  ))
}
