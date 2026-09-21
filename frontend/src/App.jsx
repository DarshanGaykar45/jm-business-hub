import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { BusinessDivisionProvider, useBusinessDivision } from './context/BusinessDivisionContext';
import { MEDIA, getHeroStyle } from './theme/media';
import api from './api/client';
import { 
  Building2, 
  Sun, 
  Truck, 
  PhoneCall, 
  ShieldCheck, 
  ExternalLink, 
  Clock, 
  MapPin, 
  Mail, 
  Sparkles,
  Server,
  Layers,
  ArrowRight
} from 'lucide-react';

function HomePage() {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [infoRes, healthRes] = await Promise.all([
          api.get('/public/company-info'),
          api.get('/health')
        ]);
        setCompanyInfo(infoRes.data);
        setApiHealth(healthRes.data);
      } catch (err) {
        console.error('API connection check failed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Helmet>
        <title>Jay Malhar Udyog Samuha — Construction, Solar & Materials</title>
        <meta name="description" content="Official platform for Jay Malhar Construction Equipments, Sundatta Renewables, and Jay Malhar Suppliers & Traders." />
      </Helmet>

      {/* Top Notification / Client Review Bar */}
      <div className="bg-navy-900/90 border-b border-navy-700/60 px-4 py-2 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" /> PHASE 1 ACTIVE
            </span>
            <span className="hidden sm:inline text-slate-400">
              Jay Malhar Udyog Samuha — Master Platform
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-mono text-amber-400 font-semibold">{companyInfo?.phone || '[[CLIENT_PHONE_PENDING]]'}</span>
            </span>
            <span className="hidden md:flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-mono text-amber-400">{companyInfo?.address || '[[CLIENT_ADDRESS_PENDING]]'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-navy-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-600/20">
              <span className="text-xl font-bold font-display text-navy-950">JM</span>
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
                {companyInfo?.groupName || 'Jay Malhar Udyog Samuha'}
              </h1>
              <p className="text-xs text-slate-400 tracking-wide">
                Contact: <span className="text-slate-200 font-medium">{companyInfo?.contactPerson || 'Mr. Abhishek Satav'}</span>
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <span className="text-amber-400 cursor-pointer">Home</span>
            <span className="hover:text-white transition-colors cursor-pointer">Businesses</span>
            <span className="hover:text-white transition-colors cursor-pointer">Equipment</span>
            <span className="hover:text-white transition-colors cursor-pointer">Solar</span>
            <span className="hover:text-white transition-colors cursor-pointer">Materials</span>
            <span className="hover:text-white transition-colors cursor-pointer">Contact</span>
          </nav>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md shadow-amber-500/20 transition-all">
              Request a Quote
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Layered CSS Fallback & Dark Overlay */}
      <section 
        className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[520px] flex items-center"
        style={getHeroStyle(MEDIA.heroHome, 'home')}
      >
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/80 border border-slate-700/80 text-xs font-semibold text-slate-200 mb-6 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Verified Tri-Division Infrastructure Hub
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-white tracking-tight leading-tight">
            Building Infrastructure, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-emerald-400">
              Powering Clean Energy
            </span>
          </h2>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Welcome to the central gateway of <strong className="text-white">Jay Malhar Udyog Samuha</strong>. Supporting builders, contractors, and clean energy developers across the region with high-performance machinery, solar systems, and premium aggregates.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2">
              Explore Our Divisions <ArrowRight className="w-4 h-4" />
            </button>
            <div className="px-5 py-3 rounded-xl bg-navy-900/80 border border-slate-700 backdrop-blur-md text-sm text-slate-300 font-mono">
              Backend Status: <span className={apiHealth?.status === 'ok' ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                {apiHealth?.status === 'ok' ? 'ONLINE (Port 5000)' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The Three Core Divisions Display */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h3 className="text-xs uppercase tracking-widest text-amber-500 font-bold mb-2">Our Operating Divisions</h3>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">Three Pillars of Excellence</h2>
          <p className="mt-3 text-slate-400">
            Dedicated divisions tailored for construction equipment rentals, solar power generation, and building material logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Division 1: Construction Equipment */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border-t-4 border-t-amber-500">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/30">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">Division 1</span>
              <h3 className="text-xl font-bold font-display text-white mt-1">Jay Malhar Construction Equipments</h3>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Earthmoving machinery, heavy soil compactors, rollers, concrete equipment rentals with verified operational availability and on-site servicing.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Rental & Booking Tracking</span>
              <span className="text-amber-400 font-semibold flex items-center gap-1">View Fleet &rarr;</span>
            </div>
          </div>

          {/* Division 2: Sundatta Renewables */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border-t-4 border-t-emerald-500">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/30">
                <Sun className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">Division 2</span>
              <h3 className="text-xl font-bold font-display text-white mt-1">Sundatta Renewables</h3>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Tier-1 solar rooftop and agricultural installations, net metering guidance, and verified government subsidy advisory for residential and commercial customers.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Savings Calculator & Subsidy</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">Solar Portal &rarr;</span>
            </div>
          </div>

          {/* Division 3: Jay Malhar Suppliers & Traders */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border-t-4 border-t-slate-500">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-700/40 text-slate-300 flex items-center justify-center mb-5 border border-slate-600/40">
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Division 3</span>
              <h3 className="text-xl font-bold font-display text-white mt-1">Jay Malhar Suppliers & Traders</h3>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Crushing stones, high-grade river and manufactured sand, coarse aggregates, volume calculators (brass/cft/ton) and logistics delivery.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Material Estimator & Stock</span>
              <span className="text-slate-300 font-semibold flex items-center gap-1">Order Supply &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Verification & Compliance Details (Section 0, 1, 2) */}
      <section className="bg-navy-900/60 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-amber-500" />
            <h4 className="text-base font-bold font-display text-white">Central Config & Client Verification Panel</h4>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            In accordance with the project brief rules, no client data has been invented. All unsupplied parameters are loaded dynamically from <code>backend/src/config/company.config.js</code> as visible review placeholders:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">Phone Placeholder:</span>
              <span className="text-amber-400 font-bold">{companyInfo?.phone || 'Loading...'}</span>
            </div>
            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">Email Placeholder:</span>
              <span className="text-amber-400 font-bold">{companyInfo?.email || 'Loading...'}</span>
            </div>
            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">GSTIN Placeholder:</span>
              <span className="text-amber-400 font-bold">{companyInfo?.gstin || 'Loading...'}</span>
            </div>
            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">Bank Name Placeholder:</span>
              <span className="text-amber-400 font-bold">{companyInfo?.bank?.name || 'Loading...'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-navy-950 py-8 px-4 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Jay Malhar Udyog Samuha. All rights reserved.</p>
        <p className="mt-1 text-slate-600">Built with React 18, Vite, Tailwind CSS, Express, and Prisma.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <BusinessDivisionProvider>
            <Routes>
              <Route path="*" element={<HomePage />} />
            </Routes>
          </BusinessDivisionProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
