import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Wrench, Sun, Layers, ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/company.config';
import TiltCard from '../../components/public/TiltCard';

export default function OurBusinesses() {
  const { openLeadModal } = useOutletContext();

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-500">Jay Malhar Udyog Samuha</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Our Business Divisions</h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Integrated solutions covering heavy ground compaction, rooftop renewable power generation, and quarry raw materials logistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: Construction */}
        <TiltCard>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between h-full hover:border-amber-500/50 transition shadow-2xl">
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Wrench className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Jay Malhar Construction</h3>
                <p className="text-xs font-semibold text-amber-400 mt-1">Quality · Strength · Durability</p>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                All types of murum (soil) compaction work at fair rates. Featuring our core fleet of Tamping Rammers and Plate Compactors.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Key Services:</div>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Tamping Rammer (TR-001) Rentals (₹1,200/day)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Plate Compactor (PC-001) Rentals (₹1,500/day)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Earthwork & Soil Bed Compaction Contracting</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <Link
                to="/equipment"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <span>View Equipment Fleet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => openLeadModal('construction', 'Rental inquiry for construction division')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Book Machine
              </button>
            </div>
          </div>
        </TiltCard>

        {/* Card 2: Solar */}
        <TiltCard>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between h-full hover:border-emerald-500/50 transition shadow-2xl">
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sun className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Sundatta Renewables</h3>
                <p className="text-xs font-semibold text-emerald-400 mt-1">Your Roof Your Power</p>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                PM Surya Ghar Yojana approved rooftop solar installation. Turnkey EPC execution with guaranteed DISCOM net-metering.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Key Services:</div>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Up to ₹78,000 Direct Central Subsidy Assistance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>1 kW – 10 kW Residential Rooftop Systems</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Tier-1 Partner Modules (TATA, Adani, Premier)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <Link
                to="/solar"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <span>Solar Calculator & Plans</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => openLeadModal('solar', 'Consultation inquiry for Sundatta Solar')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Request Free Survey
              </button>
            </div>
          </div>
        </TiltCard>

        {/* Card 3: Suppliers */}
        <TiltCard>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between h-full hover:border-cyan-500/50 transition shadow-2xl">
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Jay Malhar Suppliers & Traders</h3>
                <p className="text-xs font-semibold text-cyan-400 mt-1">Quality Materials, Fair Prices</p>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Construction materials supply including blue metal crushing stones, washed river sand, and graded aggregates with verified weighbridge slips.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Key Services:</div>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Crushed Stone Pitching (Min order 10 tons)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Washed River & Coarse Sand (Min 100 CFT)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>10mm & 20mm RCC Aggregates</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <Link
                to="/materials"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <span>Material Estimator</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => openLeadModal('suppliers', 'Inquiry for bulk materials dispatch')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Get Tipper Rates
              </button>
            </div>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}
