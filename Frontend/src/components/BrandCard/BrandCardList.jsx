import BrandCard from './BrandCard'

/**
 * BrandCardList — generic horizontal row of brand logo cards.
 *
 * Props:
 *   brands        {Array<{ name: string, logo: string }>}
 *   activeBrand   {string}
 *   onBrandChange {function}
 */
function BrandCardList({ brands, activeBrand, onBrandChange }) {
  return (
    <div className="brand-card-list" aria-label="Chọn thương hiệu">
      {brands.map(brand => (
        <BrandCard
          key={brand.name}
          logoSrc={brand.logo}
          name={brand.name}
          isActive={activeBrand === brand.name}
          onClick={() => onBrandChange(activeBrand === brand.name ? '' : brand.name)}
        />
      ))}
    </div>
  )
}

export default BrandCardList
