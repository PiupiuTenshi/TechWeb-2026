import './CategoryCard.css'

/**
 * CategoryCard — single laptop-category card with image and label.
 *
 * Props:
 *   imageSrc  {string}
 *   label     {string}
 *   isActive  {boolean}
 *   onClick   {function}
 *   id        {string}
 */
function CategoryCard({ imageSrc, label, isActive, onClick, id }) {
  return (
    <button
      className={`category-card${isActive ? ' category-card--active' : ''}`}
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Lọc laptop ${label}`}
      id={id}
    >
      <div className="category-card-img-wrap">
        <img src={imageSrc} alt={label} className="category-card-img" />
      </div>
      <span className="category-card-label">{label}</span>
    </button>
  )
}

export default CategoryCard
