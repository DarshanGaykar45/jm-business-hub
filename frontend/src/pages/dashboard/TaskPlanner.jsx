import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import {
  ListTodo, Plus, Search, CheckCircle2, Clock, AlertTriangle,
  Calendar, User, FolderKanban, Filter, ChevronRight, ArrowRight, Check, Trash2
} from 'lucide-react';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import StatCard from '../../components/StatCard';

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

export default function TaskPlanner() {
  const { currentDivision } = useBusinessDivision();
  const { user } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    businessDivision: currentDivision !== 'all' ? currentDivision : 'construction',
    employeeId: '',
    projectId: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending'
  });

  useEffect(() => {
    fetchTasks();
    fetchMetadata();
  }, [currentDivision]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentDivision !== 'all') params.division = currentDivision;
      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [empRes, projRes] = await Promise.all([
        api.get('/employees').catch(() => ({ data: { employees: [] } })),
        api.get('/projects').catch(() => ({ data: { projects: [] } }))
      ]);
      setEmployees(empRes.data.employees || []);
      setProjects(projRes.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch task dependencies:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/tasks', formData);
      toast.success('Task created successfully!');
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        businessDivision: currentDivision !== 'all' ? currentDivision : 'construction',
        employeeId: '',
        projectId: '',
        dueDate: '',
        priority: 'Medium',
        status: 'Pending'
      });
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const updateTaskStatus = async (id, newStatus) => {
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      toast.success(`Task status updated to ${newStatus}`);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete task "${title}"?`)) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const pendingTasks = filteredTasks.filter(t => t.status === 'Pending');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'In Progress');
  const completedTasks = filteredTasks.filter(t => t.status === 'Completed');

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">Urgent</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-700/50 text-slate-400 border border-slate-700">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Daily Work Planner | JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Daily Work Planner</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Organize operational schedules, machinery dispatches, site work, and team deliverables.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-semibold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={tasks.length}
          subtitle="All recorded items"
          icon={ListTodo}
          trend={0}
        />
        <StatCard
          title="Pending"
          value={tasks.filter(t => t.status === 'Pending').length}
          subtitle="Awaiting action"
          icon={Clock}
          trend={0}
        />
        <StatCard
          title="In Progress"
          value={tasks.filter(t => t.status === 'In Progress').length}
          subtitle="Active execution"
          icon={AlertTriangle}
          trend={0}
        />
        <StatCard
          title="Completed"
          value={tasks.filter(t => t.status === 'Completed').length}
          subtitle="Finished deliverables"
          icon={CheckCircle2}
          trend={0}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p} Priority</option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex border border-slate-700 rounded-lg overflow-hidden bg-slate-800">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 text-xs font-semibold ${
                viewMode === 'board' ? 'bg-amber-500 text-navy-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-semibold ${
                viewMode === 'list' ? 'bg-amber-500 text-navy-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Task Board / List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading planner...</div>
      ) : viewMode === 'board' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                Pending ({pendingTasks.length})
              </span>
            </div>
            <div className="space-y-3">
              {pendingTasks.map(task => renderTaskCard(task, 'Pending'))}
              {pendingTasks.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-8">No pending tasks</p>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                In Progress ({inProgressTasks.length})
              </span>
            </div>
            <div className="space-y-3">
              {inProgressTasks.map(task => renderTaskCard(task, 'In Progress'))}
              {inProgressTasks.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-8">No tasks in progress</p>
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Completed ({completedTasks.length})
              </span>
            </div>
            <div className="space-y-3">
              {completedTasks.map(task => renderTaskCard(task, 'Completed'))}
              {completedTasks.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-8">No completed tasks</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No tasks match your criteria.</div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(task.priority)}
                    <h4 className="text-sm font-bold text-white">{task.title}</h4>
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-400">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    {task.employee && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <User className="w-3 h-3 text-slate-500" /> {task.employee.name}
                      </span>
                    )}
                    {task.project && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <FolderKanban className="w-3 h-3 text-slate-500" /> {task.project.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <button
                    onClick={() => handleDeleteTask(task.id, task.title)}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Task Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Operational Task"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Inspect TR-001 rammer oil before dispatch"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed instructions, checklist items..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assign to Employee</label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Unassigned</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Link to Project</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">None / General</option>
                {projects.map(proj => (
                  <option key={proj.id} value={proj.id}>{proj.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );

  function renderTaskCard(task, currentColStatus) {
    return (
      <div
        key={task.id}
        className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2.5 transition-all shadow-sm"
      >
        <div className="flex items-start justify-between gap-2">
          {getPriorityBadge(task.priority)}
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            {task.businessDivision}
          </span>
        </div>

        <h4 className="text-sm font-semibold text-white leading-snug">{task.title}</h4>
        {task.description && (
          <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
        )}

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate max-w-[140px]">
            <User className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="truncate">{task.employee?.name || 'Unassigned'}</span>
          </div>

          {task.dueDate && (
            <span className="text-[11px] text-slate-500">
              {new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Quick Transition buttons */}
        <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-800/60">
          <button
            onClick={() => handleDeleteTask(task.id, task.title)}
            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5">
            {currentColStatus === 'Pending' && (
              <button
                onClick={() => updateTaskStatus(task.id, 'In Progress')}
                className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-medium transition-colors"
              >
                Start →
              </button>
            )}
            {currentColStatus === 'In Progress' && (
              <>
                <button
                  onClick={() => updateTaskStatus(task.id, 'Pending')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-medium transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => updateTaskStatus(task.id, 'Completed')}
                  className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[11px] font-medium transition-colors"
                >
                  Complete ✓
                </button>
              </>
            )}
            {currentColStatus === 'Completed' && (
              <button
                onClick={() => updateTaskStatus(task.id, 'In Progress')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-medium transition-colors"
              >
                Reopen
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
