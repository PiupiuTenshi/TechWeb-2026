import { API_BASE_URL } from './client'

function fallbackImage(name) {
  return `https://placehold.co/160x160/f4f4f5/111827?text=${encodeURIComponent(name || 'TechShop')}`
}

function displayBrand(product) {
  return product.brand || ''
}

function productType(categorySlug) {
  if (categorySlug === 'phone') return 'phone'
  if (categorySlug === 'laptop') return 'laptop'
  if (categorySlug === 'accessory') return 'accessory'
  return 'product'
}

function parseCapacity(value, fallback = null) {
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
  if (thumbnailUrl.startsWith('/')) {
    return `${API_BASE_URL}${thumbnailUrl}`
  }
  return fallbackImage(name)
}

export function mapProductSummary(dto) {
  const basePrice = Number(dto.basePrice || 0)
  const salePrice = Number(dto.salePrice || dto.basePrice || 0)
  const categorySlug = dto.category?.slug
  const primaryVariant = dto.primaryVariant || dto.variants?.[0]

  return {
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
    rating: Number(dto.avgRating || 0),
    ratingCount: Number(dto.ratingCount || 0),
    installment: '',
    variantId: primaryVariant?.variantId,
    stock: primaryVariant?.stock || 0,
    storage: parseCapacity(primaryVariant?.storage),
    ram: parseCapacity(primaryVariant?.ram),
    series: '',
    isFeatured: dto.isFeatured,
  }
}

export function mapProductDetail(dto) {
  const summary = mapProductSummary(dto)
  const firstVariant = dto.variants?.[0]

  return {
    ...summary,
    description: dto.description || '',
    avgRating: Number(dto.avgRating || 0),
    rating: Number(dto.avgRating || summary.rating || 0),
    ratingCount: Number(dto.ratingCount || summary.ratingCount || 0),
    images: dto.images || [],
    variants: dto.variants || [],
    variantId: firstVariant?.variantId || summary.variantId,
    stock: firstVariant?.stock || summary.stock || 0,
    storage: parseCapacity(firstVariant?.storage, summary.storage),
    ram: parseCapacity(firstVariant?.ram, summary.ram),
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
    name: dto.productName || 'San pham',
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
