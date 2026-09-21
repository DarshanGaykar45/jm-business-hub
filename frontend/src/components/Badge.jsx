import React from 'react';
import { clsx } from 'clsx';

/**
 * Badge Component
 * Status badges for various states + "SAMPLE DATA" demo tag
 */
const statusStyles = {
  // General statuses
  Active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Inactive: 'bg-slate-700/40 text-slate-400 border-slate-600/30',
  Deactivated: 'bg-slate-700/40 text-slate-400 border-slate-600/30',

  // Lead statuses
  NEW: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  CONTACTED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  QUOTED: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  WON: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  LOST: 'bg-red-500/15 text-red-400 border-red-500/30',

  // Project statuses
  Planned: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Ongoing: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'On Hold': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',

  // Equipment statuses
  Available: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Rented: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Maintenance: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Unavailable: 'bg-red-500/15 text-red-400 border-red-500/30',

  // Payment statuses
  Paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Partially Paid': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Pending: 'bg-orange-500/15 text-orange-400 border-orange-500/30',

  // Task statuses
  'In Progress': 'bg-blue-500/15 text-blue-400 border-blue-500/30',

  // Division badges
  construction: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  solar: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  suppliers: 'bg-slate-600/30 text-slate-300 border-slate-500/30',

  // Demo badge
  demo: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
};

const defaultStyle = 'bg-slate-700/40 text-slate-300 border-slate-600/30';

export default function Badge({ status, children, className = '', size = 'sm' }) {
  const label = children || status;
  const style = statusStyles[status] || defaultStyle;

  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold border rounded-full whitespace-nowrap',
        size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]',
        style,
        className
      )}
    >
      {label}
    </span>
  );
}

/**
 * Small demo badge that attaches to records seeded as demo data
 */
export function DemoBadge() {
  return (
    <Badge status="demo" size="xs">
      SAMPLE DATA
    </Badge>
  );
}
