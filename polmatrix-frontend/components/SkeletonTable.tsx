const SkeletonTable: React.FC = () => {
  return (
    <div className="skeleton-table">
      <div className="skeleton-header">
        <div className="skeleton-cell"></div>
        <div className="skeleton-cell"></div>
        <div className="skeleton-cell"></div>
      </div>
      <div className="skeleton-row">
        <div className="skeleton-cell"></div>
        <div className="skeleton-cell"></div>
        <div className="skeleton-cell"></div>
      </div>
      <div className="skeleton-row">
        <div className="skeleton-cell"></div>
        <div className="skeleton-cell"></div>
        <div className="skeleton-cell"></div>
      </div>
    </div>
  )
}

export default SkeletonTable