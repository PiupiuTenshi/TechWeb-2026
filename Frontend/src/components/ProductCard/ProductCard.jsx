import './ProductCard.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

function StarRating({ rating }) {
  const full  = Math.floor(rating)
  const empty = 5 - full
  return (
    <div className="product-card-stars" aria-label={`Đánh giá ${rating}/5`}>
      {Array.from({ length: full  }).map((_, i) => <span key={`f${i}`} className="star">★</span>)}
      {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} className="star empty">★</span>)}
    </div>
  )
}

function ProductCard({ product }) {
  const {
    id, name, image,
    originalPrice, salePrice, discount,
    rating, ratingCount, installment,
  } = product

  return (
    <article className="product-card" id={`product-card-${id}`}>
      {discount && <span className="product-card-badge">{discount}</span>}

      <div className="product-card-img-wrap">
        <img src={image} alt={name} loading="lazy" />
      </div>

      <p className="product-card-name">{name}</p>

      <div className="product-card-prices">
        <span className="product-card-sale-price">{formatPrice(salePrice)}</span>
        <span className="product-card-original-price">{formatPrice(originalPrice)}</span>
      </div>

      <div className="product-card-rating">
        <StarRating rating={rating} />
        <span className="product-card-rating-count">({ratingCount})</span>
      </div>

      {installment && (
        <span className="product-card-installment">{installment}</span>
      )}
    </article>
  )
}

export default ProductCard
