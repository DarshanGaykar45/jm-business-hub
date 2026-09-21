import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

/**
 * RoleRoute — renders children only if user's role has the required permission.
 * Shows 403 UI otherwise. This is UX-only; backend always re-checks.
 *
 * Usage: <RoleRoute roles={['Owner', 'Manager']}>...</RoleRoute>
 */
export default function RoleRoute({ roles = [], children }) {
  const { user } = useAuth();
  const userRole = user?.role || '';

  if (roles.length > 0 && !roles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-400 max-w-sm">
          Your role ({userRole}) does not have permission to access this section.
          Contact your administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return children;
}
