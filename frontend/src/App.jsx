import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { BusinessDivisionProvider } from './context/BusinessDivisionContext';
import { ToastProvider } from './components/Toast';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Guard & Pages
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import OurBusinesses from './pages/public/OurBusinesses';
import ConstructionEquipment from './pages/public/ConstructionEquipment';
import SolarSundatta from './pages/public/SolarSundatta';
import ConstructionMaterials from './pages/public/ConstructionMaterials';
import Services from './pages/public/Services';
import Products from './pages/public/Products';
import Gallery from './pages/public/Gallery';
import Contact from './pages/public/Contact';
import Location from './pages/public/Location';
import SolarSubsidy from './pages/public/SolarSubsidy';

// Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome';
import EmployeeManagement from './pages/dashboard/EmployeeManagement';
import ProjectManagement from './pages/dashboard/ProjectManagement';
import CustomerManagement from './pages/dashboard/CustomerManagement';
import LeadManagement from './pages/dashboard/LeadManagement';
import InventoryManagement from './pages/dashboard/InventoryManagement';
import EquipmentManagement from './pages/dashboard/EquipmentManagement';
import RentalTracking from './pages/dashboard/RentalTracking';
import VehicleEquipment from './pages/dashboard/VehicleEquipment';
import IncomeExpense from './pages/dashboard/IncomeExpense';
import QuotationGenerator from './pages/dashboard/QuotationGenerator';
import InvoiceAndBilling from './pages/dashboard/InvoiceAndBilling';
import Appointments from './pages/dashboard/Appointments';
import TaskPlanner from './pages/dashboard/TaskPlanner';
import Notifications from './pages/dashboard/Notifications';
import DocumentVault from './pages/dashboard/DocumentVault';
import Reports from './pages/dashboard/Reports';
import UserManagement from './pages/dashboard/UserManagement';
import BusinessDivisionMgmt from './pages/dashboard/BusinessDivisionMgmt';
import ErrorBoundary from './components/ErrorBoundary';
import Settings from './pages/dashboard/Settings';

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <BusinessDivisionProvider>
              <ToastProvider>
              <Routes>
                {/* Public Website Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/businesses" element={<OurBusinesses />} />
                  <Route path="/equipment" element={<ConstructionEquipment />} />
                  <Route path="/solar" element={<SolarSundatta />} />
                  <Route path="/materials" element={<ConstructionMaterials />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/location" element={<Location />} />
                  <Route path="/subsidy" element={<SolarSubsidy />} />
                </Route>

                {/* Authentication */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Admin & Operations Dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardHome />} />

                  {/* Operations Modules */}
                  <Route path="employees" element={<EmployeeManagement />} />
                  <Route path="projects" element={<ProjectManagement />} />
                  <Route path="customers" element={<CustomerManagement />} />
                  <Route path="leads" element={<LeadManagement />} />

                  {/* Assets & Machinery Modules */}
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route path="equipment" element={<EquipmentManagement />} />
                  <Route path="rentals" element={<RentalTracking />} />
                  <Route path="vehicles" element={<VehicleEquipment />} />

                  {/* Finance & Invoicing Modules */}
                  <Route path="income-expense" element={<IncomeExpense />} />
                  <Route path="quotations" element={<QuotationGenerator />} />
                  <Route path="invoices" element={<InvoiceAndBilling />} />

                  {/* Planning & Schedule Modules */}
                  <Route path="appointments" element={<Appointments />} />
                  <Route path="tasks" element={<TaskPlanner />} />

                  {/* System & Analytics Modules */}
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="documents" element={<DocumentVault />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="divisions" element={<BusinessDivisionMgmt />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ToastProvider>
          </BusinessDivisionProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </ErrorBoundary>
);
}
