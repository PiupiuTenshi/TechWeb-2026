import BrandCard from './BrandCard'

/**
 * BrandCardList — generic horizontal row of brand logo cards.
 *
 * Props:
 *   brands        {Array<{ name: string, logo: string, path?: string }>}
 *   activeBrand   {string}   — used only when brands have no path (filter mode)
 *   onBrandChange {function} — used only in filter mode
 */
function BrandCardList({ brands, activeBrand, onBrandChange }) {
  return (
    <div className="brand-card-list" aria-label="Chọn thương hiệu">
      {brands.map(brand => (
        <BrandCard
          key={brand.name}
          logoSrc={brand.logo}
          name={brand.name}
          to={brand.path}
          isActive={!brand.path && activeBrand === brand.name}
          onClick={brand.path ? undefined : () => onBrandChange(activeBrand === brand.name ? '' : brand.name)}
        />
      ))}
    </div>
  )
}

export default BrandCardList
