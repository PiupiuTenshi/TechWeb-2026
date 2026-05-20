import './BrandCard.css'

/**
 * BrandCard — single brand logo card.
 *
 * Props:
 *   logoSrc  {string}  — path to brand logo image
 *   name     {string}  — brand name (used as alt text)
 *   isActive {boolean} — whether this brand is currently selected
 *   onClick  {function}
 */
function BrandCard({ logoSrc, name, isActive, onClick }) {
  return (
    <button
      className={`brand-card${isActive ? ' brand-card--active' : ''}`}
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Lọc theo ${name}`}
      id={`brand-card-${name.toLowerCase()}`}
    >
      <img src={logoSrc} alt={name} className="brand-card-logo" />
    </button>
  )
}

export default BrandCard
