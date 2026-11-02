import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import {
  CalendarDays, Plus, Search, Clock, MapPin, User, Phone,
  CheckCircle2, AlertCircle, XCircle, Calendar, Filter
} from 'lucide-react';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import StatCard from '../../components/StatCard';

const APPOINTMENT_TYPES = [
  'Site Visit',
  'Client Meeting',
  'Solar Installation',
  'Equipment Delivery',
  'Team Sync'
];

export default function Appointments() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [appointments, setAppointments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Site Visit',
    businessDivision: currentDivision !== 'all' ? currentDivision : 'construction',
    dateTime: '',
    location: '',
    contactPerson: '',
    contactPhone: '',
    assignedEmployeeId: '',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchEmployees();
  }, [currentDivision]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentDivision !== 'all') params.division = currentDivision;
      const res = await api.get('/appointments', { params });
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/appointments', formData);
      toast.success('Appointment scheduled successfully!');
      setIsModalOpen(false);
      setFormData({
        title: '',
        type: 'Site Visit',
        businessDivision: currentDivision !== 'all' ? currentDivision : 'construction',
        dateTime: '',
        location: '',
        contactPerson: '',
        contactPhone: '',
        assignedEmployeeId: '',
        notes: ''
      });
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/appointments/${id}`, { status: newStatus });
      toast.success(`Appointment marked as ${newStatus}`);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.title.toLowerCase().includes(search.toLowerCase()) ||
      apt.location.toLowerCase().includes(search.toLowerCase()) ||
      (apt.contactPerson && apt.contactPerson.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const now = new Date();
  const scheduledCount = appointments.filter(a => a.status === 'Scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const todayCount = appointments.filter(a => {
    const d = new Date(a.dateTime);
    return d.toDateString() === now.toDateString();
  }).length;
  const siteVisitsCount = appointments.filter(a => a.type === 'Site Visit').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'Rescheduled':
        return <Badge variant="warning">Rescheduled</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="info">Scheduled</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Appointments & Site Visits | JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Appointments & Site Visits</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Coordinate customer site visits, solar surveys, and machinery delivery milestones.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-semibold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Schedule Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Scheduled"
          value={scheduledCount}
          subtitle="Upcoming engagements"
          icon={CalendarDays}
          trend={0}
        />
        <StatCard
          title="Today's Engagements"
          value={todayCount}
          subtitle="Happening today"
          icon={Clock}
          trend={0}
        />
        <StatCard
          title="Site Surveys"
          value={siteVisitsCount}
          subtitle="Solar & construction field visits"
          icon={MapPin}
          trend={0}
        />
        <StatCard
          title="Completed"
          value={completedCount}
          subtitle="Fulfilled appointments"
          icon={CheckCircle2}
          trend={0}
        />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search appointments or clients..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No appointments found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Schedule a new appointment, site visit, or client meeting to start tracking progress.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((apt) => {
            const dateObj = new Date(apt.dateTime);
            const isToday = dateObj.toDateString() === now.toDateString();

            return (
              <div
                key={apt.id}
                className={`bg-slate-900/70 border rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between ${
                  isToday ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' : 'border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {apt.type}
                    </span>
                    {getStatusBadge(apt.status)}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">{apt.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {dateObj.toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{apt.location}</span>
                    </div>

                    {apt.contactPerson && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{apt.contactPerson}</span>
                        {apt.contactPhone && (
                          <a
                            href={`tel:${apt.contactPhone}`}
                            className="text-amber-400 hover:underline flex items-center gap-1 ml-auto"
                          >
                            <Phone className="w-3 h-3" />
                            {apt.contactPhone}
                          </a>
                        )}
                      </div>
                    )}

                    {apt.assignedEmployee && (
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        Assigned: <span className="text-slate-200 font-medium">{apt.assignedEmployee.name}</span>
                      </div>
                    )}

                    {apt.notes && (
                      <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 mt-2">
                        "{apt.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Actions */}
                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  {apt.status === 'Scheduled' && (
                    <>
                      <button
                        onClick={() => updateStatus(apt.id, 'Completed')}
                        className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
                      </button>
                      <button
                        onClick={() => updateStatus(apt.id, 'Cancelled')}
                        className="text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </>
                  )}
                  {apt.status !== 'Scheduled' && (
                    <button
                      onClick={() => updateStatus(apt.id, 'Scheduled')}
                      className="text-slate-400 hover:text-slate-200 font-medium"
                    >
                      Re-open
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Appointment"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Appointment Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 5kW Solar Rooftop Survey or Equipment Delivery"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {APPOINTMENT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Business Division</label>
              <select
                value={formData.businessDivision}
                onChange={(e) => setFormData({ ...formData, businessDivision: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="construction">Jay Malhar Construction</option>
                <option value="solar">Sundatta Renewables</option>
                <option value="suppliers">Jay Malhar Traders</option>
                <option value="group">Group Corporate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Site Address *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Shriram Chowk, Pathre Budruk or Client Site"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Client Contact Name</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Ramesh Patil"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="10-digit mobile"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Employee</label>
            <select
              value={formData.assignedEmployeeId}
              onChange={(e) => setFormData({ ...formData, assignedEmployeeId: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">Unassigned</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Site specific requirements, tool prerequisites, etc."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-semibold rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Saving...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
