import { useState } from 'react'
import { Filter } from 'lucide-react'
import './FilterBar.css'

/**
 * FilterBar — "Chọn tiêu chí" section with expandable inline filter panel.
 *
 * Props:
 *   filterGroups   {Array<{ key, label, options: Array<{ value, label }> }>}
 *   activeFilters  {Object}  e.g. { price: [], storage: [], ram: [] }
 *   onFilterChange {function(groupKey, value)} — toggles a single chip
 *   onClearAll     {function} — clears all active filters
 */
function FilterBar({ filterGroups = [], activeFilters = {}, onFilterChange, onClearAll }) {
  const [isOpen, setIsOpen] = useState(false)

  const totalActive = Object.values(activeFilters).flat().length

  const handleToggle = () => setIsOpen(prev => !prev)

  const isChipActive = (groupKey, value) =>
    (activeFilters[groupKey] || []).includes(value)

  return (
    <div className="filter-bar">
      <h2 className="filter-bar-title">Chọn tiêu chí</h2>

      <div className="filter-bar-controls">
        <button
          className={`filter-bar-btn${isOpen ? ' filter-bar-btn--open' : ''}`}
          onClick={handleToggle}
          id="filter-bar-btn"
          aria-expanded={isOpen}
        >
          <Filter size={14} />
          <span>Bộ lọc</span>
          {totalActive > 0 && (
            <span className="filter-bar-badge">{totalActive}</span>
          )}
        </button>

        {totalActive > 0 && (
          <button className="filter-bar-clear" onClick={onClearAll} id="filter-clear-btn">
            Xoá bộ lọc
          </button>
        )}
      </div>

      {isOpen && filterGroups.length > 0 && (
        <div className="filter-panel" role="region" aria-label="Bộ lọc sản phẩm">
          <div className="filter-panel-groups">
            {filterGroups.map(group => (
              <div key={group.key} className="filter-group">
                {group.label && <p className="filter-group-label">{group.label}</p>}
                <div className="filter-group-chips">
                  {group.options.map(opt => (
                    <button
                      key={opt.value}
                      className={`filter-chip${isChipActive(group.key, opt.value) ? ' filter-chip--active' : ''}`}
                      onClick={() => onFilterChange(group.key, opt.value)}
                      id={`filter-chip-${group.key}-${opt.value}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterBar
