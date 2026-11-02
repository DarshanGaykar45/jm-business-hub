import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import { IndianRupee, TrendingUp, TrendingDown, Plus, Trash2, Search, Filter } from 'lucide-react';
import Modal from '../../components/Modal';

export default function IncomeExpense() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [tab, setTab] = useState('income'); // income | expense
  const [summary, setSummary] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  const [newIncome, setNewIncome] = useState({
    date: new Date().toISOString().split('T')[0],
    businessDivision: 'construction',
    source: 'Rental Payment',
    customerName: '',
    amount: 1500,
    paymentMethod: 'UPI',
    description: ''
  });

  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    businessDivision: 'construction',
    category: 'Equipment Maintenance',
    amount: 800,
    paymentMethod: 'UPI',
    paidTo: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, [currentDivision, tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentDivision !== 'all') params.division = currentDivision;

      const [sumRes, incRes, expRes] = await Promise.all([
        api.get('/finance/summary', { params }),
        api.get('/finance/income', { params }),
        api.get('/finance/expenses', { params })
      ]);

      setSummary(sumRes.data.summary);
      setIncomes(incRes.data.incomes || []);
      setExpenses(expRes.data.expenses || []);
    } catch (err) {
      console.error('Failed to load finance data:', err);
      toast.error('Failed to load financial ledger');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncome = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/income', {
        ...newIncome,
        amount: Number(newIncome.amount)
      });
      toast.success('Income entry added!');
      setIsAddIncomeOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record income');
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/expenses', {
        ...newExpense,
        amount: Number(newExpense.amount)
      });
      toast.success('Expense entry added!');
      setIsAddExpenseOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record expense');
    }
  };

  const handleDeleteRecord = async (e) => {
    e.preventDefault();
    if (!selectedRecord || !deleteReason) return;
    try {
      const endpoint = selectedRecord.type === 'income'
        ? `/finance/income/${selectedRecord.id}`
        : `/finance/expenses/${selectedRecord.id}`;

      await api.delete(endpoint, { data: { reason: deleteReason } });
      toast.info('Record soft-deleted with audit trail reason.');
      setIsDeleteModalOpen(false);
      setDeleteReason('');
      fetchData();
    } catch (err) {
      toast.error('Failed to soft-delete entry');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Income & Expense — JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-amber-400" />
            <span>Income & Expense Ledger</span>
          </h1>
          <p className="text-sm text-slate-400">
            Real-time cash flow, dynamic profit calculation, and audit-logged soft deletions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddIncomeOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income</span>
          </button>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400">Today's Income</span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            ₹{(summary?.todayIncome || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">Total: ₹{(summary?.totalIncome || 0).toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400">Today's Expenses</span>
          <div className="text-2xl font-black font-mono text-rose-400">
            ₹{(summary?.todayExpenses || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">Total: ₹{(summary?.totalExpenses || 0).toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400">Net Profit (Income - Expense)</span>
          <div className={`text-2xl font-black font-mono ${
            (summary?.netProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            ₹{(summary?.netProfit || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            Today: ₹{(summary?.todayProfit || 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setTab('income')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition ${
            tab === 'income' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          Income Transactions ({incomes.length})
        </button>
        <button
          onClick={() => setTab('expense')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition ${
            tab === 'expense' ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          Expense Transactions ({expenses.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Division</th>
                <th className="px-6 py-4">{tab === 'income' ? 'Source / Customer' : 'Category / Paid To'}</th>
                <th className="px-6 py-4">Payment Mode</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading ledger...</td></tr>
              ) : (tab === 'income' ? incomes : expenses).length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No records found.</td></tr>
              ) : (
                (tab === 'income' ? incomes : expenses).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-mono text-xs">
                      {new Date(rec.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {rec.businessDivision}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">
                        {tab === 'income' ? rec.source : rec.category}
                      </div>
                      <div className="text-xs text-slate-500">
                        {tab === 'income' ? (rec.customerName || 'Walk-in') : (rec.paidTo || 'Vendor')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">{rec.paymentMethod}</td>
                    <td className="px-6 py-4 font-mono font-bold text-base">
                      <span className={tab === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                        ₹{rec.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setSelectedRecord({ ...rec, type: tab }); setIsDeleteModalOpen(true); }}
                        className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/50 rounded-lg transition"
                        title="Soft-Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Soft Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Soft-Delete Financial Entry">
        <form onSubmit={handleDeleteRecord} className="space-y-4">
          <p className="text-sm text-slate-300">
            Financial records are never permanently deleted from the database. A mandatory audit reason must be logged.
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Reason for Deletion *</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Duplicate entry made by mistake, verified by accountant"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 resize-none"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm">Confirm Soft Delete</button>
          </div>
        </form>
      </Modal>

      {/* Add Income Modal */}
      <Modal isOpen={isAddIncomeOpen} onClose={() => setIsAddIncomeOpen(false)} title="Record Income Entry">
        <form onSubmit={handleCreateIncome} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Date *</label>
              <input
                type="date"
                required
                value={newIncome.date}
                onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Division</label>
              <select
                value={newIncome.businessDivision}
                onChange={(e) => setNewIncome({ ...newIncome, businessDivision: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="construction">Construction</option>
                <option value="solar">Solar</option>
                <option value="suppliers">Suppliers</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Income Source *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tamping Rammer 3-Day Rental"
                value={newIncome.source}
                onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Customer / Payer Name</label>
              <input
                type="text"
                placeholder="e.g. Sahyadri Infra"
                value={newIncome.customerName}
                onChange={(e) => setNewIncome({ ...newIncome, customerName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                min={1}
                value={newIncome.amount}
                onChange={(e) => setNewIncome({ ...newIncome, amount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Payment Method</label>
              <select
                value={newIncome.paymentMethod}
                onChange={(e) => setNewIncome({ ...newIncome, paymentMethod: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="UPI">UPI</option>
                <option value="NEFT/RTGS">NEFT / RTGS</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddIncomeOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm">Save Income</button>
          </div>
        </form>
      </Modal>

      {/* Add Expense Modal */}
      <Modal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} title="Record Expense Entry">
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Date *</label>
              <input
                type="date"
                required
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Division</label>
              <select
                value={newExpense.businessDivision}
                onChange={(e) => setNewExpense({ ...newExpense, businessDivision: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="construction">Construction</option>
                <option value="solar">Solar</option>
                <option value="suppliers">Suppliers</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Expense Category *</label>
              <input
                type="text"
                required
                placeholder="e.g. Fuel & Diesel, Maintenance, Spare Parts"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Paid To (Vendor / Person)</label>
              <input
                type="text"
                placeholder="e.g. Shriram Petroleum"
                value={newExpense.paidTo}
                onChange={(e) => setNewExpense({ ...newExpense, paidTo: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                min={1}
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Payment Method</label>
              <select
                value={newExpense.paymentMethod}
                onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="UPI">UPI</option>
                <option value="NEFT/RTGS">NEFT / RTGS</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddExpenseOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm">Save Expense</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
