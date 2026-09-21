import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SkeletonCard } from './LoadingSkeleton';

/**
 * StatCard — Dashboard summary metric card
 * Shows icon, label, value, and optional trend indicator
 * Accent color follows the active division
 */
const accentBorders = {
  amber: 'border-t-amber-500',
  emerald: 'border-t-emerald-500',
  slate: 'border-t-slate-500',
  blue: 'border-t-blue-500',
  default: 'border-t-slate-600',
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend = null, // { value: '+12%', direction: 'up' | 'down' | 'flat' }
  accent = 'default',
  loading = false,
}) {
  if (loading) return <SkeletonCard />;

  const TrendIcon = trend?.direction === 'up' ? TrendingUp
    : trend?.direction === 'down' ? TrendingDown
    : Minus;

  const trendColor = trend?.direction === 'up' ? 'text-emerald-400'
    : trend?.direction === 'down' ? 'text-red-400'
    : 'text-slate-400';

  return (
    <div className={clsx(
      'glass-card rounded-xl p-5 border-t-2 transition-all hover:bg-navy-800/50',
      accentBorders[accent] || accentBorders.default
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1 truncate">
            {label}
          </p>
          <p className="text-2xl font-bold font-display text-white tracking-tight">
            {value ?? '—'}
          </p>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-slate-800/70 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-slate-400" />
          </div>
        )}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
