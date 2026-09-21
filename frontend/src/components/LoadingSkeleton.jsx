import React from 'react';

/**
 * Loading Skeleton — shimmer effect for loading states
 * Can represent lines, cards, or table rows
 */
export function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }) {
  return (
    <div
      className={`${width} ${height} rounded-md bg-slate-800 animate-pulse ${className}`}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-xl bg-navy-900/60 border border-slate-800 p-5 space-y-3 ${className}`}>
      <SkeletonLine width="w-1/3" height="h-3" />
      <SkeletonLine width="w-2/3" height="h-6" />
      <SkeletonLine width="w-1/2" height="h-3" />
    </div>
  );
}

export function SkeletonTableRow({ columns = 5 }) {
  return (
    <tr className="border-b border-slate-800/50">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonLine width={i === 0 ? 'w-3/4' : 'w-1/2'} height="h-4" />
        </td>
      ))}
    </tr>
  );
}

export default function LoadingSkeleton({ type = 'card', count = 3, columns = 5 }) {
  if (type === 'table') {
    return (
      <tbody>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonTableRow key={i} columns={columns} />
        ))}
      </tbody>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
