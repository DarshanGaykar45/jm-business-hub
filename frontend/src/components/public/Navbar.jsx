import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MessageSquare, ShieldCheck, ChevronRight } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/company.config';

export default function Navbar({ onOpenLeadModal }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/businesses', label: 'Businesses' },
    { to: '/equipment', label: 'Equipment' },
    { to: '/solar', label: 'Solar' },
    { to: '/materials', label: 'Materials' },
    { to: '/services', label: 'Services' },
    { to: '/products', label: 'Catalogue' },
    { to: '/subsidy', label: 'Govt Subsidy' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/location', label: 'Location' },
    { to: '/contact', label: 'Contact' },
  ];

  const whatsappUrl = `https://wa.me/91${COMPANY_CONFIG.primaryWhatsapp}?text=Hello%20Jay%20Malhar%20Udyog%20Samuha,%20I%20would%20like%20to%20inquire%20about%20your%20services.`;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-xl py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              JM
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5 leading-tight">
                <span>Jay Malhar</span>
                <span className="text-amber-400 font-normal text-xs sm:text-sm">Udyog Samuha</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Construction · Solar · Materials
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-xs xl:text-sm font-medium rounded-lg transition ${
                    isActive
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => onOpenLeadModal('construction', 'General business inquiry from navbar')}
              className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition active:scale-95"
            >
              <span>Get Quote</span>
            </button>

            <Link
              to="/dashboard"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Admin Portal"
            >
              <ShieldCheck className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 rounded-lg"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-5 shadow-2xl animate-fadeIn">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between ${
                      isActive
                        ? 'text-amber-400 bg-amber-500/10 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </NavLink>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <button
                onClick={() => onOpenLeadModal('construction', 'Quick inquiry from mobile menu')}
                className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-center text-sm shadow-md shadow-amber-500/20"
              >
                Request Quotation
              </button>
              <Link
                to="/dashboard"
                className="w-full py-2.5 bg-slate-900 border border-slate-800 text-slate-300 font-medium rounded-xl text-center text-sm hover:text-white"
              >
                Staff / Admin Portal
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Floating WhatsApp CTA Button (Sticky on mobile & desktop) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 p-3.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
        title="Chat with Jay Malhar on WhatsApp"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
          Chat on WhatsApp
        </span>
      </a>
    </>
  );
}
