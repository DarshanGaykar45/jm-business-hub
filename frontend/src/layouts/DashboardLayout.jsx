import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBusinessDivision, DIVISIONS } from '../context/BusinessDivisionContext';
import { useToast } from '../components/Toast';
import {
  LayoutDashboard, Users, FolderKanban, UserCircle, Package,
  Truck, Wrench, IndianRupee, FileText, Receipt, CalendarDays,
  ListTodo, Car, FolderLock, Bell, BarChart3, Settings, Shield,
  Building2, ChevronLeft, ChevronRight, Menu, X, LogOut,
  ChevronDown, Sun, Layers
} from 'lucide-react';

// Sidebar navigation groups
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ]
  },
  {
    label: 'Operations',
    items: [
      { to: '/dashboard/employees', icon: Users, label: 'Employees', roles: ['Owner', 'Manager'] },
      { to: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
      { to: '/dashboard/customers', icon: UserCircle, label: 'Customers' },
      { to: '/dashboard/leads', icon: Sun, label: 'Leads' },
    ]
  },
  {
    label: 'Assets',
    items: [
      { to: '/dashboard/inventory', icon: Package, label: 'Inventory' },
      { to: '/dashboard/equipment', icon: Wrench, label: 'Equipment' },
      { to: '/dashboard/rentals', icon: Truck, label: 'Rentals' },
      { to: '/dashboard/vehicles', icon: Car, label: 'Vehicles' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { to: '/dashboard/income-expense', icon: IndianRupee, label: 'Income & Expense', roles: ['Owner', 'Accountant'] },
      { to: '/dashboard/quotations', icon: FileText, label: 'Quotations', roles: ['Owner', 'Accountant'] },
      { to: '/dashboard/invoices', icon: Receipt, label: 'Invoices', roles: ['Owner', 'Accountant'] },
    ]
  },
  {
    label: 'Planning',
    items: [
      { to: '/dashboard/appointments', icon: CalendarDays, label: 'Appointments' },
      { to: '/dashboard/tasks', icon: ListTodo, label: 'Daily Planner' },
    ]
  },
  {
    label: 'System',
    items: [
      { to: '/dashboard/documents', icon: FolderLock, label: 'Document Vault' },
      { to: '/dashboard/reports', icon: BarChart3, label: 'Reports', roles: ['Owner', 'Accountant'] },
      { to: '/dashboard/users', icon: Shield, label: 'User Management', roles: ['Owner'] },
      { to: '/dashboard/settings', icon: Settings, label: 'Settings', roles: ['Owner'] },
    ]
  },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { currentDivision, setCurrentDivision, divisions } = useBusinessDivision();
  const toast = useToast();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [divDropdownOpen, setDivDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userRole = user?.role || '';
  const isDemo = user?.isDemo;

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out successfully.');
    navigate('/login', { replace: true });
  };

  // Get active division display info
  const activeDivision = divisions.find(d => d.key === currentDivision) || divisions[0];

  // Filter nav items by role
  const filterByRole = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  };

  const renderNavLink = (item, collapsed = false) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      onClick={() => setMobileMenuOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        } ${collapsed ? 'justify-center' : ''}`
      }
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );

  const sidebarContent = (collapsed = false) => (
    <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
      {NAV_GROUPS.map(group => {
        const visibleItems = group.items.filter(filterByRole);
        if (visibleItems.length === 0) return null;
        return (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {visibleItems.map(item => renderNavLink(item, collapsed))}
            </div>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-800 bg-navy-950/80 transition-all duration-300 flex-shrink-0 ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center border-b border-slate-800 px-3 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-extrabold font-display text-navy-950">JM</span>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">JM Business Hub</p>
              <p className="text-[10px] text-slate-500 truncate">Internal Platform</p>
            </div>
          )}
        </div>

        {sidebarContent(sidebarCollapsed)}

        {/* Collapse Toggle */}
        <div className="border-t border-slate-800 p-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-navy-950 border-r border-slate-800 flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                  <span className="text-sm font-extrabold font-display text-navy-950">JM</span>
                </div>
                <p className="text-sm font-bold text-white">JM Business Hub</p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent(false)}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Demo Banner */}
        {isDemo && (
          <div className="bg-amber-600/20 border-b border-amber-500/30 px-4 py-1.5 text-xs text-center text-amber-300 font-semibold">
            ⚠️ DEMO MODE — You are viewing sample data. All records marked with "SAMPLE DATA" badges are fictional.
          </div>
        )}

        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800 bg-navy-950/90 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-40 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Division Switcher */}
            <div className="relative">
              <button
                onClick={() => setDivDropdownOpen(!divDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-navy-900/60 text-sm text-slate-200 hover:border-slate-600 transition-colors"
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline font-medium">{activeDivision.shortName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${divDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {divDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDivDropdownOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 w-56 bg-navy-900 border border-slate-700 rounded-xl shadow-xl shadow-black/40 z-20 py-1">
                    {divisions.map(div => (
                      <button
                        key={div.key}
                        onClick={() => { setCurrentDivision(div.key); setDivDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                          currentDivision === div.key
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: div.color }}
                        />
                        <span className="font-medium">{div.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications Bell (placeholder count) */}
            <button className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xs font-bold text-navy-950">
                  {(user?.name || 'U')[0].toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{user?.name}</p>
                  <p className="text-[10px] text-slate-500">{userRole}</p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-navy-900 border border-slate-700 rounded-xl shadow-xl shadow-black/40 z-20 py-1">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
