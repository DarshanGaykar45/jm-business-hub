import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import { Truck, Plus, Search, CheckCircle, AlertTriangle, Clock, RefreshCw, IndianRupee, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';

export default function RentalTracking() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [rentals, setRentals] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overdueOnly, setOverdueOnly] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  const [formData, setFormData] = useState({
    equipmentId: '',
    customerId: '',
    rentalStart: new Date().toISOString().split('T')[0],
    expectedReturn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rentalAmount: 3600,
    depositAmount: 5000,
    paymentStatus: 'Pending',
    notes: ''
  });

  const [returnData, setReturnData] = useState({
    conditionOnReturn: 'Good',
    maintenanceNeeded: false,
    notes: ''
  });

  useEffect(() => {
    fetchRentals();
    fetchDropdowns();
  }, [currentDivision, overdueOnly]);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (overdueOnly) params.overdue = 'true';
      const res = await api.get('/rentals', { params });
      setRentals(res.data.rentals || []);
    } catch (err) {
      console.error('Failed to load rentals:', err);
      toast.error('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [eqRes, custRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/customers')
      ]);
      const availEquip = eqRes.data.equipment?.filter(e => e.status === 'Available') || [];
      setEquipmentList(availEquip);
      setCustomers(custRes.data.customers || []);
      if (availEquip.length > 0 && !formData.equipmentId) {
        setFormData(prev => ({ ...prev, equipmentId: availEquip[0].id }));
      }
      if (custRes.data.customers?.length > 0 && !formData.customerId) {
        setFormData(prev => ({ ...prev, customerId: custRes.data.customers[0].id }));
      }
    } catch (e) {
      // non-blocking
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rentals', {
        ...formData,
        rentalAmount: Number(formData.rentalAmount),
        depositAmount: Number(formData.depositAmount)
      });
      toast.success('Rental contract created! Equipment status set to Rented.');
      setIsAddModalOpen(false);
      fetchRentals();
      fetchDropdowns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create rental');
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!selectedRental) return;
    try {
      await api.patch(`/rentals/${selectedRental.id}/return`, returnData);
      toast.success('Equipment return recorded! Status set to Available.');
      setIsReturnModalOpen(false);
      fetchRentals();
      fetchDropdowns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record return');
    }
  };

  const handleDeleteRental = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rental record?')) return;
    try {
      await api.delete(`/rentals/${id}`);
      toast.success('Rental record deleted successfully');
      fetchRentals();
      fetchDropdowns();
    } catch (err) {
      toast.error('Failed to delete rental record');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Rental Tracking — JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-400" />
            <span>Equipment Rental Tracking</span>
          </h1>
          <p className="text-sm text-slate-400">
            Real-time tracking of dispatched Tamping Rammers, Plate Compactors, and rollers.
          </p>
        </div>

        <button
          onClick={() => { fetchDropdowns(); setIsAddModalOpen(true); }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Rental Booking</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
        <button
          onClick={() => setOverdueOnly(!overdueOnly)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition ${
            overdueOnly
              ? 'bg-red-500/20 border-red-500 text-red-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Overdue Rentals Only</span>
        </button>
        <span className="text-xs text-slate-400 font-medium">
          Total: <strong className="text-white">{rentals.length}</strong> active & historical bookings
        </span>
      </div>

      {/* Rentals Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Equipment & Code</th>
                <th className="px-6 py-4">Client / Hirer</th>
                <th className="px-6 py-4">Rental Window</th>
                <th className="px-6 py-4">Tariff & Deposit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading rentals...</td></tr>
              ) : rentals.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No rental records found.</td></tr>
              ) : (
                rentals.map((r) => {
                  const isReturned = !!r.actualReturn;
                  return (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-base">{r.equipment?.name}</div>
                        <span className="text-xs font-mono text-amber-400 font-bold">{r.equipment?.equipmentId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{r.customer?.name}</div>
                        <div className="text-xs font-mono text-slate-500">{r.customer?.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        <div>Start: {new Date(r.rentalStart).toLocaleDateString('en-IN')}</div>
                        <div className={r.isOverdue ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          Due: {new Date(r.expectedReturn).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        <div className="text-white font-bold">₹{r.rentalAmount.toLocaleString('en-IN')}</div>
                        <div className="text-slate-500">Dep: ₹{r.depositAmount.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isReturned ? (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            RETURNED
                          </span>
                        ) : r.isOverdue ? (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse">
                            OVERDUE
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            ON SITE
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isReturned ? (
                            <button
                              onClick={() => { setSelectedRental(r); setIsReturnModalOpen(true); }}
                              className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold transition"
                            >
                              Record Return
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">
                              {new Date(r.actualReturn).toLocaleDateString('en-IN')}
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteRental(r.id)}
                            className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-800/40 rounded-lg transition"
                            title="Delete Rental Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Rental Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Rental Dispatch">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Available Machine *</label>
              <select
                required
                value={formData.equipmentId}
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {equipmentList.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.equipmentId}) - ₹{e.rentalRatePerDay}/day</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Customer / Hirer *</label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Rental Start Date *</label>
              <input
                type="date"
                required
                value={formData.rentalStart}
                onChange={(e) => setFormData({ ...formData, rentalStart: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Expected Return Date *</label>
              <input
                type="date"
                required
                value={formData.expectedReturn}
                onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Rental Tariff (₹) *</label>
              <input
                type="number"
                required
                value={formData.rentalAmount}
                onChange={(e) => setFormData({ ...formData, rentalAmount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Security Deposit (₹)</label>
              <input
                type="number"
                value={formData.depositAmount}
                onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md">Dispatch Machine</button>
          </div>
        </form>
      </Modal>

      {/* Record Return Modal */}
      <Modal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} title={`Record Return: ${selectedRental?.equipment?.name}`}>
        <form onSubmit={handleReturn} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Equipment Condition on Return</label>
            <select
              value={returnData.conditionOnReturn}
              onChange={(e) => setReturnData({ ...returnData, conditionOnReturn: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Excellent">Excellent - Clean & operational</option>
              <option value="Good">Good - Standard wear</option>
              <option value="Needs Service">Needs Service / Repair</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="maintNeeded"
              checked={returnData.maintenanceNeeded}
              onChange={(e) => setReturnData({ ...returnData, maintenanceNeeded: e.target.checked })}
              className="rounded bg-slate-950 border-slate-800 text-amber-500"
            />
            <label htmlFor="maintNeeded" className="text-xs text-slate-300">
              Flag for Maintenance (Will set equipment status to 'Maintenance' instead of 'Available')
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Return Inspection Notes</label>
            <textarea
              rows={2}
              value={returnData.notes}
              onChange={(e) => setReturnData({ ...returnData, notes: e.target.value })}
              placeholder="e.g. Engine inspected, tamping shoe in good condition, deposit refunded."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsReturnModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm">Confirm Return</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
