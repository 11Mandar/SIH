interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="animate-pulse divide-y divide-border">
      {/* Header */}
      <div className="flex items-center gap-6 px-5 py-3 bg-surface-raised/40 border-b border-border">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="h-2.5 flex-1 rounded bg-surface-hover" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-6 px-5 py-3.5"
          style={{ opacity: 1 - rowIndex * 0.1 }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-3 flex-1 rounded bg-surface-raised"
              style={{ flex: colIndex === 0 ? 1.5 : 1, maxWidth: colIndex === 0 ? "none" : "12rem" }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
