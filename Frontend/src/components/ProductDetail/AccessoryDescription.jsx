import './AccessoryDescription.css'

/**
 * AccessoryDescription
 *
 * Renders the "Mô tả sản phẩm" section for accessory detail pages.
 *
 * Props:
 *   description {string} — product description text
 */
function AccessoryDescription({ description }) {
  return (
    <section className="accessory-description" aria-label="Mô tả sản phẩm">
      <h2 className="accessory-description-title">Mô tả sản phẩm</h2>
      <p className="accessory-description-text">{description}</p>
    </section>
  )
}

export default AccessoryDescription
