import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, MessageSquare, Shield, ArrowUpRight, ExternalLink } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/company.config';

export default function Footer({ onOpenLeadModal }) {
  const constructionDiv = COMPANY_CONFIG.divisions.find(d => d.key === 'construction');
  const solarDiv = COMPANY_CONFIG.divisions.find(d => d.key === 'solar');
  const suppliersDiv = COMPANY_CONFIG.divisions.find(d => d.key === 'suppliers');

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: Group Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
                JM
              </div>
              <div>
                <span className="text-xl font-extrabold text-white tracking-tight">{COMPANY_CONFIG.groupName}</span>
                <p className="text-xs text-amber-500 font-medium">Nashik & Sinnar Region, Maharashtra</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Integrated infrastructure powerhouse. Serving rural and industrial Maharashtra with high-performance
              compaction machinery, approved PM Surya Ghar rooftop solar systems, and certified quarry materials.
            </p>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{COMPANY_CONFIG.address}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Proprietor: {COMPANY_CONFIG.proprietor} | Contact: {COMPANY_CONFIG.contactPerson} ({COMPANY_CONFIG.primaryPhone})</span>
              </div>
            </div>
          </div>

          {/* Col 2: Jay Malhar Construction */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Construction</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/equipment" className="hover:text-amber-400 transition flex items-center justify-between">
                  <span>Tamping Rammer (TR-001)</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
              <li>
                <Link to="/equipment" className="hover:text-amber-400 transition flex items-center justify-between">
                  <span>Plate Compactor (PC-001)</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
              <li>
                <Link to="/equipment" className="hover:text-amber-400 transition">Soil & Murum Compaction</Link>
              </li>
              <li>
                <Link to="/equipment" className="hover:text-amber-400 transition">Machinery Rentals</Link>
              </li>
              <li className="pt-2 text-slate-300 font-mono text-[11px]">
                📞 {constructionDiv?.phones?.join(', ')}
              </li>
            </ul>
          </div>

          {/* Col 3: Sundatta Renewables */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Sundatta Solar</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/solar" className="hover:text-emerald-400 transition">Solar Savings Calculator</Link>
              </li>
              <li>
                <Link to="/subsidy" className="hover:text-emerald-400 transition flex items-center justify-between">
                  <span>PM Surya Ghar Yojana</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
              <li>
                <Link to="/solar" className="hover:text-emerald-400 transition">On-Grid & Hybrid EPC</Link>
              </li>
              <li>
                <Link to="/solar" className="hover:text-emerald-400 transition">Tier-1 Approved Panels</Link>
              </li>
              <li className="pt-2 text-slate-300 font-mono text-[11px]">
                📞 {solarDiv?.phones?.join(', ')}
              </li>
            </ul>
          </div>

          {/* Col 4: Suppliers & Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-400" />
              <span>Materials & Quick</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/materials" className="hover:text-white transition">Crushed Stone Supply</Link>
              </li>
              <li>
                <Link to="/materials" className="hover:text-white transition">River & Coarse Sand</Link>
              </li>
              <li>
                <Link to="/materials" className="hover:text-white transition">Blue Metal Aggregates</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-white transition">Project Gallery</Link>
              </li>
              <li>
                <Link to="/location" className="hover:text-white transition">Site Location Map</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-amber-400 hover:underline flex items-center gap-1 font-semibold">
                  <Shield className="w-3 h-3" />
                  <span>Admin Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {COMPANY_CONFIG.groupName}. All rights reserved. Registered in Nashik, Maharashtra.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-300 transition">About Group</Link>
            <Link to="/contact" className="hover:text-slate-300 transition">Direct Contact</Link>
            <a
              href="https://pmsuryaghar.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition flex items-center gap-1"
            >
              <span>National Solar Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
