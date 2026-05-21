import { Link } from 'react-router-dom'
import './BrandCard.css'

/**
 * BrandCard — single brand logo card.
 *
 * Props:
 *   logoSrc  {string}    — path to brand logo image
 *   name     {string}    — brand name (used as alt text)
 *   to       {string}    — if provided, renders as a <Link> that navigates to this path
 *   isActive {boolean}   — whether this brand is currently selected (only used in filter mode)
 *   onClick  {function}  — used in filter mode (when no `to` is provided)
 */
function BrandCard({ logoSrc, name, to, isActive, onClick }) {
  const className = `brand-card${isActive ? ' brand-card--active' : ''}`
  const id        = `brand-card-${name.toLowerCase().replace(/\s+/g, '-')}`

  if (to) {
    return (
      <Link
        to={to}
        className={className}
        aria-label={`Xem ${name}`}
        id={id}
      >
        <img src={logoSrc} alt={name} className="brand-card-logo" />
      </Link>
    )
  }

  return (
    <button
      className={className}
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Lọc theo ${name}`}
      id={id}
    >
      <img src={logoSrc} alt={name} className="brand-card-logo" />
    </button>
  )
}

export default BrandCard
