import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import { Users, Plus, Search, UserCheck, UserX, Phone, Building, Calendar, Shield, IndianRupee, Trash2, Edit2, MapPin } from 'lucide-react';
import Modal from '../../components/Modal';

export default function EmployeeManagement() {
  const { currentDivision } = useBusinessDivision();
  const { user } = useAuth();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const initialForm = {
    name: '',
    phone: '',
    address: 'Sinnar, Nashik, Maharashtra',
    role: 'Site Supervisor',
    department: 'Operations',
    businessDivision: 'construction',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: 26000,
    dailyWage: 900,
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialForm);

  const canViewSalary = user?.role === 'Owner' || user?.role === 'Accountant';

  useEffect(() => {
    fetchEmployees();
  }, [currentDivision, search]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentDivision !== 'all') params.division = currentDivision;
      if (search) params.search = search;
      const res = await api.get('/employees', { params });
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      toast.error('Failed to load employee directory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees', {
        ...formData,
        salary: Number(formData.salary),
        dailyWage: Number(formData.dailyWage)
      });
      toast.success('Employee created successfully!');
      setIsAddModalOpen(false);
      setFormData(initialForm);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee');
    }
  };

  const handleEditClick = (emp) => {
    setSelectedEmp(emp);
    setFormData({
      name: emp.name,
      phone: emp.phone,
      address: emp.address || '',
      role: emp.role,
      department: emp.department,
      businessDivision: emp.businessDivision || 'construction',
      joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
      salary: emp.salary || 25000,
      dailyWage: emp.dailyWage || 800,
      status: emp.status
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    try {
      await api.put(`/employees/${selectedEmp.id}`, {
        ...formData,
        salary: Number(formData.salary),
        dailyWage: Number(formData.dailyWage)
      });
      toast.success('Employee details updated successfully!');
      setIsEditModalOpen(false);
      setSelectedEmp(null);
      setFormData(initialForm);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update employee');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove employee ${name}?`)) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success(`Employee ${name} removed from active roster.`);
      fetchEmployees();
    } catch (err) {
      toast.error('Could not remove employee');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Employee Management — JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Employee & HR Management</span>
          </h1>
          <p className="text-sm text-slate-400">
            Track site supervisors, operators, and solar technicians across Nashik region.
          </p>
        </div>

        <button
          onClick={() => { setFormData(initialForm); setIsAddModalOpen(true); }}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, phone, role, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Roster: <span className="text-white font-bold">{employees.length}</span> personnel
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Employee ID & Name</th>
                <th className="px-6 py-4">Phone / Contact</th>
                <th className="px-6 py-4">Role & Department</th>
                <th className="px-6 py-4">Division</th>
                {canViewSalary && <th className="px-6 py-4">Salary / Day Wage</th>}
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">Loading personnel records...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No employees found. Click "Add Employee" to register staff.</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-base">{emp.name}</div>
                      <div className="text-xs font-mono text-amber-400">{emp.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <div className="flex items-center gap-1.5 text-white font-bold">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        {emp.phone}
                      </div>
                      <div className="text-slate-500 text-[11px] truncate max-w-xs">{emp.address || 'Nashik'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-200 font-semibold">{emp.role}</div>
                      <div className="text-xs text-slate-500">{emp.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {emp.businessDivision}
                      </span>
                    </td>
                    {canViewSalary && (
                      <td className="px-6 py-4 font-mono text-xs text-emerald-400">
                        {emp.salary ? `₹${Number(emp.salary).toLocaleString('en-IN')}/mo` : `₹${emp.dailyWage}/day`}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(emp)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id, emp.name)}
                          className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-800/40 rounded-lg transition"
                          title="Remove Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Employee">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sachin Bhausaheb Patil"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9822451020"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Role / Designation *</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Operations">Operations</option>
                <option value="Logistics">Logistics</option>
                <option value="Solar Tech">Solar Tech</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Division</label>
              <select
                value={formData.businessDivision}
                onChange={(e) => setFormData({ ...formData, businessDivision: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="construction">Construction Equipment</option>
                <option value="solar">Solar Division</option>
                <option value="suppliers">Suppliers Division</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Salary (₹)</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Daily Wage (₹)</label>
              <input
                type="number"
                value={formData.dailyWage}
                onChange={(e) => setFormData({ ...formData, dailyWage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nashik Residential / Local Address</label>
            <input
              type="text"
              placeholder="e.g. Shriram Chowk, Pathre Budruk, Sinnar"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition">Register Employee</button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Employee: ${selectedEmp?.name}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Role / Designation *</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Operations">Operations</option>
                <option value="Logistics">Logistics</option>
                <option value="Solar Tech">Solar Tech</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Active">Active</option>
                <option value="Deactivated">Deactivated</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Salary (₹)</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Daily Wage (₹)</label>
              <input
                type="number"
                value={formData.dailyWage}
                onChange={(e) => setFormData({ ...formData, dailyWage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Local Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
