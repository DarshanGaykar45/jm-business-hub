import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import {
  IndianRupee, TrendingDown, Activity, Users, FolderKanban,
  CheckCircle, Package, AlertTriangle, Truck, CalendarDays,
  Clock, Sun, Target, Plus, ArrowRight, ShieldCheck,
  Building2, MapPin, Phone, ExternalLink, Wrench, FileText, Receipt, UserCheck
} from 'lucide-react';

export default function DashboardHome() {
  const { currentDivision, setDivision } = useBusinessDivision();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [currentDivision]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = currentDivision !== 'all' ? { division: currentDivision } : {};
      
      const [sumRes, projRes, aptRes] = await Promise.all([
        api.get('/dashboard/summary', { params }).catch(() => ({ data: {} })),
        api.get('/projects', { params }).catch(() => ({ data: { projects: [] } })),
        api.get('/appointments', { params }).catch(() => ({ data: { appointments: [] } }))
      ]);

      setStats(sumRes.data);
      setRecentProjects((projRes.data.projects || []).slice(0, 4));
      setRecentAppointments((aptRes.data.appointments || []).slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Scheduled';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Scheduled' : d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const accent = currentDivision === 'construction' ? 'amber'
    : currentDivision === 'solar' ? 'emerald'
    : currentDivision === 'suppliers' ? 'slate'
    : 'blue';

  return (
    <div className="space-y-8 pb-12">
      <Helmet>
        <title>Admin Operations Center — JM Business Hub</title>
      </Helmet>

      {/* Hero Executive Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Nashik Regional Hub Active
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Sinnar • Satpur • Ambad • Gangapur Rd
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Jay Malhar Udyog Samuha <span className="text-amber-400">HQ</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Unified command center for construction machinery rentals, solar rooftop EPC installations, and infrastructure stone aggregates dispatch across Nashik district.
            </p>
          </div>

          {/* Quick Action Pill Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
            <Link
              to="/dashboard/invoices"
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>New Invoice</span>
            </Link>
            <Link
              to="/dashboard/quotations"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>New Quote</span>
            </Link>
            <Link
              to="/dashboard/leads"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Lead</span>
            </Link>
            <Link
              to="/dashboard/projects"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition active:scale-95"
            >
              <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
              <span>New Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          icon={IndianRupee}
          label="Today's Collections"
          value={loading ? undefined : `₹${(stats?.todayIncome || 0).toLocaleString('en-IN')}`}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={TrendingDown}
          label="Operating Expenses"
          value={loading ? undefined : `₹${(stats?.todayExpenses || 0).toLocaleString('en-IN')}`}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={Activity}
          label="Net Operating Cash"
          value={loading ? undefined : `₹${(stats?.profitLoss || 0).toLocaleString('en-IN')}`}
          trend={stats?.profitLoss != null ? {
            direction: stats.profitLoss >= 0 ? 'up' : 'down',
            value: stats.profitLoss >= 0 ? '+ Inflow' : '- Deficit'
          } : null}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={Users}
          label="Nashik Workforce"
          value={loading ? undefined : stats?.totalEmployees || 0}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={FolderKanban}
          label="Active Site Projects"
          value={loading ? undefined : stats?.activeProjects || 0}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={Truck}
          label="Machinery on Field"
          value={loading ? undefined : stats?.equipmentRented || 0}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={Package}
          label="Low-Stock Alerts"
          value={loading ? undefined : stats?.lowStockItems || 0}
          trend={stats?.lowStockItems > 0 ? { direction: 'down', value: 'Stock Check' } : null}
          accent={accent}
          loading={loading}
        />
        <StatCard
          icon={CalendarDays}
          label="Upcoming Site Visits"
          value={loading ? undefined : stats?.upcomingMeetings || 0}
          accent={accent}
          loading={loading}
        />
      </div>

      {/* 3 Business Division Quick Portals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-400">
            Business Divisions Overview
          </h2>
          <span className="text-xs text-slate-500 font-mono">Jay Malhar Group</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Division 1: Construction Equipments */}
          <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  Machinery
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                Jay Malhar Construction Equipments
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tamping rammers, 3T/10T road rollers, soil compactors, and demolition hammers available for hire in Nashik.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <Link to="/dashboard/equipment" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
                <span>View Machinery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/dashboard/rentals" className="text-slate-400 hover:text-white">
                Rentals Tracker
              </Link>
            </div>
          </div>

          {/* Division 2: Sundatta Renewables */}
          <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 shadow-xl transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sun className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  Renewables
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Sundatta Renewables
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Grid-tied residential solar rooftop, industrial 20kW/50kW setups, and agricultural solar pumps with MSEDCL net-metering.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <Link to="/dashboard/leads" className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                <span>Solar Inquiries</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/dashboard/projects" className="text-slate-400 hover:text-white">
                EPC Projects
              </Link>
            </div>
          </div>

          {/* Division 3: Suppliers & Traders */}
          <div className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 shadow-xl transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/25">
                  Logistics & Mining
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                Jay Malhar Suppliers & Traders
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                20mm/40mm blue metal stone aggregates, washed river sand, and crushed quarry dust supplied via dumper fleet.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <Link to="/dashboard/inventory" className="text-blue-400 font-bold hover:underline flex items-center gap-1">
                <span>Aggregates Stock</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/dashboard/vehicles" className="text-slate-400 hover:text-white">
                Fleet Status
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Operational Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Nashik Region Projects */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Active Projects in Nashik</h3>
            </div>
            <Link to="/dashboard/projects" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentProjects.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No projects registered.</p>
            ) : (
              recentProjects.map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 hover:border-slate-700 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{p.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{p.location || 'Nashik Region'}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {p.businessDivision}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Budget: ₹{(p.budget || 0).toLocaleString('en-IN')}</span>
                      <span className="font-mono text-amber-400 font-bold">{p.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, p.progress || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scheduled Nashik Visits & Meetings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Upcoming Field Visits & Site Work</h3>
            </div>
            <Link to="/dashboard/appointments" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
              <span>Schedule</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentAppointments.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No field visits scheduled.</p>
            ) : (
              recentAppointments.map((apt) => (
                <div key={apt.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-white">{apt.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      apt.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {formatDateTime(apt.dateTime)}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {apt.location}
                    </span>
                    {apt.contactPerson && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Users className="w-3 h-3 text-slate-500" />
                        {apt.contactPerson} ({apt.contactPhone || 'Contact'})
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
