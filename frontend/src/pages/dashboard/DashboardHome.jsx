import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import {
  IndianRupee, TrendingDown, Activity, Users, FolderKanban,
  CheckCircle, Package, AlertTriangle, Truck, CalendarDays,
  Clock, Sun, Target
} from 'lucide-react';

export default function DashboardHome() {
  const { currentDivision } = useBusinessDivision();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [currentDivision]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const params = currentDivision !== 'all' ? { division: currentDivision } : {};
      const res = await api.get('/dashboard/summary', { params });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  // Pick accent based on selected division
  const accent = currentDivision === 'construction' ? 'amber'
    : currentDivision === 'solar' ? 'emerald'
    : currentDivision === 'suppliers' ? 'slate'
    : 'blue';

  return (
    <div>
      <Helmet>
        <title>Dashboard — JM Business Hub</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-white">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Welcome back, <span className="text-slate-200 font-medium">{user?.name}</span>.
          Here's your business overview.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          icon={IndianRupee}
          label="Today's Income"
          value={loading ? undefined : `₹${(stats?.todayIncome || 0).toLocaleString('en-IN')}`}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={TrendingDown}
          label="Today's Expenses"
          value={loading ? undefined : `₹${(stats?.todayExpenses || 0).toLocaleString('en-IN')}`}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={Activity}
          label="Profit / Loss"
          value={loading ? undefined : `₹${(stats?.profitLoss || 0).toLocaleString('en-IN')}`}
          trend={stats?.profitLoss != null ? {
            direction: stats.profitLoss >= 0 ? 'up' : 'down',
            value: stats.profitLoss >= 0 ? 'Profit' : 'Loss'
          } : null}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={Users}
          label="Total Employees"
          value={loading ? undefined : stats?.totalEmployees || 0}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={FolderKanban}
          label="Active Projects"
          value={loading ? undefined : stats?.activeProjects || 0}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={CheckCircle}
          label="Completed Projects"
          value={loading ? undefined : stats?.completedProjects || 0}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={Package}
          label="Low-Stock Items"
          value={loading ? undefined : stats?.lowStockItems || 0}
          trend={stats?.lowStockItems > 0 ? { direction: 'down', value: 'Needs attention' } : null}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={Truck}
          label="Equipment Rented"
          value={loading ? undefined : stats?.equipmentRented || 0}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue Rentals"
          value={loading ? undefined : stats?.overdueRentals || 0}
          trend={stats?.overdueRentals > 0 ? { direction: 'down', value: 'Action required' } : null}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={CalendarDays}
          label="Upcoming Meetings"
          value={loading ? undefined : stats?.upcomingMeetings || 0}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={Sun}
          label="New Leads Today"
          value={loading ? undefined : stats?.newLeadsToday || 0}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={Target}
          label="Pending Orders"
          value={loading ? undefined : stats?.pendingOrders || 0}
          accent={accent}
          loading={loading}
        />
      </div>
    </div>
  );
}
