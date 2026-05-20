import { Link } from 'react-router-dom'
import './Breadcrumb.css'

/**
 * Breadcrumb — navigation trail.
 *
 * Props:
 *   items {Array<{ label: string, to?: string }>}
 */
function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={index} className="breadcrumb-item">
          {index > 0 && <span className="breadcrumb-sep">/</span>}
          {item.to ? (
            <Link to={item.to} className="breadcrumb-link">{item.label}</Link>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export default Breadcrumb
