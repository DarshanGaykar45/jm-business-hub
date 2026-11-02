import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import { Car, Plus, Fuel, Wrench, Calendar, AlertCircle } from 'lucide-react';
import Modal from '../../components/Modal';

export default function VehicleEquipment() {
  const toast = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [formData, setFormData] = useState({
    registrationNo: '',
    type: 'Tipper Truck',
    driverName: '',
    businessDivision: 'suppliers',
    maintenanceStatus: 'Operational'
  });

  const [expenseData, setExpenseData] = useState({
    type: 'Fuel',
    amount: 3500,
    description: 'Diesel tank fill up'
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data.vehicles || []);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
      toast.error('Failed to load fleet');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', formData);
      toast.success('Vehicle registered in logistics fleet!');
      setIsAddModalOpen(false);
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handleLogExpense = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    try {
      await api.post(`/vehicles/${selectedVehicle.id}/expenses`, expenseData);
      toast.success('Expense recorded for vehicle!');
      setIsExpenseModalOpen(false);
      fetchVehicles();
    } catch (err) {
      toast.error('Failed to log expense');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Vehicle & Fleet Logistics — JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-amber-400" />
            <span>Vehicles & Logistics Fleet</span>
          </h1>
          <p className="text-sm text-slate-400">
            Dumpers, tipper trucks, and pickups used for stone aggregate dispatch and site deliveries.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vehicle</span>
        </button>
      </div>

      {/* Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-500">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-500">No vehicles in registry.</div>
        ) : (
          vehicles.map((v) => (
            <div key={v.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black px-3 py-1 bg-slate-950 text-amber-400 border border-slate-800 rounded-lg">
                    {v.registrationNo}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    v.maintenanceStatus === 'Operational' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {v.maintenanceStatus}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white">{v.type}</h3>
                <div className="text-xs text-slate-400">Driver: <span className="text-white font-semibold">{v.driverName || 'Designated Staff'}</span></div>

                {v.expenses && v.expenses.length > 0 && (
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Recent Log</span>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">{v.expenses[0]?.type}: {v.expenses[0]?.description}</span>
                      <span className="font-bold text-amber-400">₹{v.expenses[0]?.amount}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => { setSelectedVehicle(v); setIsExpenseModalOpen(true); }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Fuel className="w-3.5 h-3.5 text-amber-400" />
                  <span>Log Fuel / Service</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Vehicle Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register Logistics Vehicle">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Registration Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. MH-15-EG-4521"
              value={formData.registrationNo}
              onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value.toUpperCase() })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Vehicle Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Tipper Truck">Tipper Truck</option>
                <option value="Dumper">Dumper</option>
                <option value="Pickup Truck">Pickup Truck</option>
                <option value="Crane Truck">Crane Truck</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Driver Name</label>
              <input
                type="text"
                placeholder="e.g. Balasaheb Jadhav"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md">Register</button>
          </div>
        </form>
      </Modal>

      {/* Log Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title={`Log Expense: ${selectedVehicle?.registrationNo}`}>
        <form onSubmit={handleLogExpense} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Expense Type</label>
              <select
                value={expenseData.type}
                onChange={(e) => setExpenseData({ ...expenseData, type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Fuel">Fuel (Diesel)</option>
                <option value="Maintenance">Maintenance & Service</option>
                <option value="Toll">Toll & Highway Fees</option>
                <option value="Insurance">Insurance / RTO Tax</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                min={1}
                value={expenseData.amount}
                onChange={(e) => setExpenseData({ ...expenseData, amount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description / Notes</label>
            <input
              type="text"
              value={expenseData.description}
              onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-sm">Save Expense</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
