import './SeriesCard.css'

/**
 * SeriesCard — a single selectable series pill/tab.
 *
 * Props:
 *   label    {string}   — series name to display
 *   isActive {boolean}  — whether this series is selected
 *   onClick  {function}
 *   id       {string}
 */
function SeriesCard({ label, isActive, onClick, id }) {
  return (
    <button
      className={`series-card${isActive ? ' series-card--active' : ''}`}
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Lọc theo ${label}`}
      id={id}
    >
      {label}
    </button>
  )
}

/**
 * SeriesCardList — renders a horizontal scrollable row of SeriesCards.
 *
 * Props:
 *   seriesList     {string[]}  — array of series names
 *   activeSeries   {string}
 *   onSeriesChange {function}
 */
export function SeriesCardList({ seriesList, activeSeries, onSeriesChange }) {
  return (
    <div className="series-card-list" aria-label="Chọn dòng sản phẩm">
      {seriesList.map(series => (
        <SeriesCard
          key={series}
          label={series}
          isActive={activeSeries === series}
          onClick={() => onSeriesChange(activeSeries === series ? '' : series)}
          id={`series-card-${series.toLowerCase().replace(/\s+/g, '-')}`}
        />
      ))}
    </div>
  )
}

export default SeriesCard
