import { ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react'
import './SortBar.css'

/**
 * SortBar — "Sắp xếp theo" section with price sort toggles.
 *
 * Props:
 *   sortOrder    {'asc' | 'desc' | ''}
 *   onSortChange {function}
 */
function SortBar({ sortOrder, onSortChange }) {
  return (
    <div className="sort-bar">
      <h2 className="sort-bar-title">Sắp xếp theo</h2>
      <div className="sort-bar-buttons">
        <button
          className={`sort-bar-btn${sortOrder === 'asc' ? ' sort-bar-btn--active' : ''}`}
          onClick={() => onSortChange(sortOrder === 'asc' ? '' : 'asc')}
          id="sort-btn-asc"
        >
          <ArrowUpNarrowWide size={14} />
          <span>Giá Thấp → Cao</span>
        </button>
        <button
          className={`sort-bar-btn${sortOrder === 'desc' ? ' sort-bar-btn--active' : ''}`}
          onClick={() => onSortChange(sortOrder === 'desc' ? '' : 'desc')}
          id="sort-btn-desc"
        >
          <ArrowDownNarrowWide size={14} />
          <span>Giá Cao → Thấp</span>
        </button>
      </div>
    </div>
  )
}

export default SortBar
