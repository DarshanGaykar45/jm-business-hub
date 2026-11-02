import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import {
  BarChart3, TrendingUp, IndianRupee, Download, Users, Package,
  AlertTriangle, Filter, ArrowUpRight, ArrowDownRight, Layers
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Legend, CartesianGrid, AreaChart, Area
} from 'recharts';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';

export default function Reports() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'area'

  useEffect(() => {
    fetchReports();
  }, [currentDivision]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentDivision !== 'all') params.division = currentDivision;

      const [finRes, leadRes, invRes] = await Promise.all([
        api.get('/reports/financial', { params }).catch(() => ({ data: { monthlyTrends: [] } })),
        api.get('/reports/lead-funnel', { params }).catch(() => ({ data: { funnel: [] } })),
        api.get('/reports/inventory', { params }).catch(() => ({ data: null }))
      ]);

      setFinancialData(finRes.data.monthlyTrends || []);
      setFunnelData(leadRes.data.funnel || []);
      setInventoryStats(invRes.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
      toast.error('Failed to load analytical reports');
    } finally {
      setLoading(false);
    }
  };

  const exportFinancialCSV = () => {
    if (!financialData || financialData.length === 0) {
      toast.error('No financial data available to export');
      return;
    }

    const headers = 'Month,Income (INR),Expense (INR),Net Profit (INR)\n';
    const rows = financialData.map(d =>
      `${d.month},${d.income},${d.expense},${d.profit}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `JM_Financial_Report_${currentDivision}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Financial report exported to CSV');
  };

  const totalIncome = financialData.reduce((acc, curr) => acc + (curr.income || 0), 0);
  const totalExpense = financialData.reduce((acc, curr) => acc + (curr.expense || 0), 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Reports & Financial Analytics | JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reports & Business Analytics</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Cross-divisional revenue analytics, lead acquisition funnel, and inventory valuation.
          </p>
        </div>
        <button
          onClick={exportFinancialCSV}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm border border-slate-700 transition-all hover:scale-105 active:scale-95"
        >
          <Download className="w-4 h-4 text-amber-400" />
          Export Financial CSV
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${totalIncome.toLocaleString('en-IN')}`}
          subtitle="Cumulative earnings"
          icon={IndianRupee}
          trend={0}
        />
        <StatCard
          title="Total Expenses"
          value={`₹${totalExpense.toLocaleString('en-IN')}`}
          subtitle="Operational outlays"
          icon={ArrowDownRight}
          trend={0}
        />
        <StatCard
          title="Net Margin"
          value={`₹${netProfit.toLocaleString('en-IN')}`}
          subtitle={netProfit >= 0 ? 'Profitable performance' : 'Negative balance'}
          icon={TrendingUp}
          trend={0}
        />
        <StatCard
          title="Inventory Assets"
          value={`₹${(inventoryStats?.totalValuation || 0).toLocaleString('en-IN')}`}
          subtitle="Stocked material value"
          icon={Package}
          trend={0}
        />
      </div>

      {/* Financial Performance Chart */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Monthly Cash Flow & Profitability</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparison of incoming billings versus vendor payments and site expenses.
            </p>
          </div>
          <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-800">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 text-xs font-semibold ${
                chartType === 'bar' ? 'bg-amber-500 text-navy-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bar Comparison
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 text-xs font-semibold ${
                chartType === 'area' ? 'bg-amber-500 text-navy-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Trend Area
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center text-slate-500">Loading charts...</div>
        ) : financialData.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-slate-500">
            <BarChart3 className="w-10 h-10 mb-2 text-slate-600" />
            <p className="text-sm">No transaction records available for this division scope.</p>
          </div>
        ) : (
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={financialData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Net Profit" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={financialData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Two Column Section: Lead Funnel & Inventory Valuation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Funnel */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Lead Conversion Funnel
            </h3>
            <span className="text-xs text-slate-400">Public & Offline Leads</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading funnel...</div>
          ) : funnelData.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No leads recorded yet.</div>
          ) : (
            <div className="space-y-4 pt-2">
              {funnelData.map((stage) => (
                <div key={stage.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{stage.stage}</span>
                    <span className="text-slate-400 font-mono">
                      {stage.count} leads ({stage.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, stage.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Valuation & Safety Stock */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              Stock Asset Metrics
            </h3>
            <span className="text-xs text-slate-400">Valuation & Liquidity</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Purchase Valuation</p>
              <p className="text-lg font-bold text-white mt-1">
                ₹{(inventoryStats?.totalValuation || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Projected Retail</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">
                ₹{(inventoryStats?.totalSellingValue || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Projected Gross Margin</p>
              <p className="text-lg font-bold text-amber-400 mt-1">
                ₹{(inventoryStats?.projectedMargin || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Low Stock Triggers</p>
              <p className="text-lg font-bold text-rose-400 mt-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {inventoryStats?.lowStockCount || 0} Items
              </p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-300">
            <strong>Audit Note:</strong> Inventory valuation accounts for crushing stone stocks, river sand, solar panels, and spares across all Sinnar yards.
          </div>
        </div>
      </div>
    </div>
  );
}
