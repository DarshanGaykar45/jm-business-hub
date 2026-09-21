import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { BusinessDivisionProvider } from './context/BusinessDivisionContext';
import { ToastProvider } from './components/Toast';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/dashboard/DashboardHome';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';

/**
 * Placeholder page for modules not yet implemented (Phase 4+)
 */
function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm text-slate-400">This module will be built in a future phase.</p>
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <BusinessDivisionProvider>
            <ToastProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Redirect root to dashboard (or a future public home page) */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardHome />} />

                  {/* Phase 4: Operations */}
                  <Route path="employees" element={<ComingSoon title="Employee Management" />} />
                  <Route path="projects" element={<ComingSoon title="Project Management" />} />
                  <Route path="customers" element={<ComingSoon title="Customer Management (CRM)" />} />
                  <Route path="leads" element={<ComingSoon title="Lead Management" />} />

                  {/* Phase 5: Assets */}
                  <Route path="inventory" element={<ComingSoon title="Inventory Management" />} />
                  <Route path="equipment" element={<ComingSoon title="Equipment Management" />} />
                  <Route path="rentals" element={<ComingSoon title="Rental Tracking" />} />
                  <Route path="vehicles" element={<ComingSoon title="Vehicle Management" />} />

                  {/* Phase 6: Finance */}
                  <Route path="income-expense" element={<ComingSoon title="Income & Expense" />} />
                  <Route path="quotations" element={<ComingSoon title="Quotation Generator" />} />
                  <Route path="invoices" element={<ComingSoon title="Invoice & Billing" />} />

                  {/* Phase 7: Planning */}
                  <Route path="appointments" element={<ComingSoon title="Appointment Scheduler" />} />
                  <Route path="tasks" element={<ComingSoon title="Daily Work Planner" />} />

                  {/* Phase 7: System */}
                  <Route path="documents" element={<ComingSoon title="Document Vault" />} />

                  {/* Phase 8: Reports */}
                  <Route path="reports" element={<ComingSoon title="Reports & Analytics" />} />

                  {/* Phase 2: System (existing auth) */}
                  <Route path="users" element={<ComingSoon title="User Management" />} />
                  <Route path="settings" element={<ComingSoon title="Settings" />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ToastProvider>
          </BusinessDivisionProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
