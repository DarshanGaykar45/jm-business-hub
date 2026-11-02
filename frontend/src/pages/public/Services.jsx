import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Wrench, Sun, Layers, ArrowRight, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/company.config';

export default function Services() {
  const { openLeadModal } = useOutletContext();

  const services = [
    {
      division: 'construction',
      divisionName: 'Jay Malhar Construction',
      accentColor: 'border-amber-500/40 text-amber-400',
      title: 'Heavy Machinery & Compactor Rentals',
      desc: 'Tamping rammers (TR-001) and vibratory plate compactors (PC-001) for soil, murum, and gravel sub-base compaction. Available on daily or weekly contracts with full mechanical warranty.',
      points: [
        '3-5.5 HP Tamping Rammers for trench & footing compaction',
        '5.5-6.5 HP Plate Compactors with 15-20 kN force for paving & murum',
        'Optional operator deployment for fast site turnover',
        'Emergency breakdown replacement guarantee in Sinnar region'
      ],
      cta: 'Rent Compactor'
    },
    {
      division: 'solar',
      divisionName: 'Sundatta Renewables',
      accentColor: 'border-emerald-500/40 text-emerald-400',
      title: 'Turnkey Solar EPC & Subsidy Assistance',
      desc: 'Complete rooftop solar installation from engineering design, shadow analysis, structure fabrication, DISCOM net-metering synchronization, to direct PM Surya Ghar subsidy processing.',
      points: [
        'Tier-1 Photovoltaic Modules with 25-Year Performance Warranty',
        'Single-Phase and Three-Phase Grid-Tied / Hybrid Inverters',
        'Full Liaison with MSEDCL for Bi-directional Net Metering',
        'Up to ₹78,000 Direct Central Subsidy Assistance'
      ],
      cta: 'Consult on Solar'
    },
    {
      division: 'suppliers',
      divisionName: 'Jay Malhar Suppliers & Traders',
      accentColor: 'border-cyan-500/40 text-cyan-400',
      title: 'Quarry Sourcing & Site Material Logistics',
      desc: 'Direct dispatch of crushing stones, washed river sand, and graded blue metal aggregates for foundations, roadwork, and structural RCC concreting.',
      points: [
        'Certified digital weighbridge measurement slips provided',
        'Same-day or scheduled tipper deliveries to site',
        'Bulk wholesale commercial rates for civil contractors',
        'Tested clean river sand free from organic contaminants'
      ],
      cta: 'Order Materials'
    },
    {
      division: 'group',
      divisionName: 'Jay Malhar Udyog Samuha',
      accentColor: 'border-purple-500/40 text-purple-400',
      title: 'Integrated Project Earthwork & Civil Consultancy',
      desc: 'Comprehensive earthmoving, soil compaction bed preparation, and renewable power planning for new industrial sheds, agricultural warehouses, and residential complexes.',
      points: [
        'Site soil density compaction assessments',
        'Rooftop solar capacity feasibility studies',
        'Comprehensive material requirement estimation',
        'Single accountable point of contact for contractor logistics'
      ],
      cta: 'Consult Our Engineers'
    }
  ];

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-500">Comprehensive Capabilities</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Our Complete Service Spectrum</h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          From heavy earthwork machinery rentals to renewable solar engineering and certified raw building materials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((srv, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-2xl hover:border-slate-700 transition"
          >
            <div className="space-y-4">
              <span className={`px-3 py-1 bg-slate-950 border text-xs font-bold rounded-lg inline-block ${srv.accentColor}`}>
                {srv.divisionName}
              </span>
              <h3 className="text-2xl font-bold text-white">{srv.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{srv.desc}</p>
              <ul className="space-y-2 pt-2 text-xs text-slate-300">
                {srv.points.map((p, pidx) => (
                  <li key={pidx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => openLeadModal(srv.division, `Inquiry for ${srv.title}`, srv.title)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95 text-sm"
              >
                <span>{srv.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
