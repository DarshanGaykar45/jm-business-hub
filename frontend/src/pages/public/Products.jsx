import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Wrench, Sun, Layers, ArrowRight, CheckCircle2, ShieldCheck, Filter } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/company.config';
import { MEDIA } from '../../theme/media';
import TiltCard from '../../components/public/TiltCard';

export default function Products() {
  const { openLeadModal } = useOutletContext();
  const [activeTab, setActiveTab] = useState('all');

  const catalogue = [
    {
      id: 'TR-001',
      name: 'Tamping Rammer',
      division: 'construction',
      divisionLabel: 'Construction Equipment',
      specs: '3-5.5 HP engine, 80 kg weight, petrol/electric options, high-impact soil compaction',
      price: '₹1,200/day',
      deposit: '₹5,000',
      availability: 'Available',
      image: MEDIA.rammerSVG,
      type: 'Equipment Rental'
    },
    {
      id: 'PC-001',
      name: 'Plate Compactor',
      division: 'construction',
      divisionLabel: 'Construction Equipment',
      specs: '5.5-6.5 HP, petrol/diesel/electric, 15-20 kN centrifugal force, smooth surface compaction',
      price: '₹1,500/day',
      deposit: '₹8,000',
      availability: 'Available',
      image: MEDIA.compactorSVG,
      type: 'Equipment Rental'
    },
    {
      id: 'SOL-1KW',
      name: '1 kW Rooftop Solar System',
      division: 'solar',
      divisionLabel: 'Sundatta Renewables',
      specs: 'Mono PERC Tier-1 modules, generates ~120 units/mo, requires 100 sq.ft roof, 25-yr warranty',
      price: 'Net ~₹25,000',
      deposit: 'Subsidy: ₹30,000',
      availability: 'In Stock',
      image: MEDIA.solarPanelSVG,
      type: 'Solar EPC Turnkey'
    },
    {
      id: 'SOL-3KW',
      name: '3 kW Rooftop Solar System',
      division: 'solar',
      divisionLabel: 'Sundatta Renewables',
      specs: 'Bifacial/Mono PERC modules + Grid Tie Inverter, generates ~360 units/mo, 300 sq.ft roof',
      price: 'Net ~₹87,000',
      deposit: 'Subsidy: ₹78,000 (Max)',
      availability: 'In Stock',
      image: MEDIA.solarPanelSVG,
      type: 'Solar EPC Turnkey'
    },
    {
      id: 'MAT-STONE',
      name: 'Crushed Basalt Stone',
      division: 'suppliers',
      divisionLabel: 'Suppliers & Traders',
      specs: 'High density blue metal crushing stone for foundation pitching, subgrade, and embankment base',
      price: 'Market Fair Rate / Ton',
      deposit: 'Min 10 Tons',
      availability: 'In Stock',
      image: null,
      type: 'Quarry Material'
    },
    {
      id: 'MAT-SAND',
      name: 'Washed River Sand',
      division: 'suppliers',
      divisionLabel: 'Suppliers & Traders',
      specs: 'Double-washed, silt-free river sand for structural RCC concrete casting and premium wall plaster',
      price: 'Market Fair Rate / CFT',
      deposit: 'Min 100 CFT',
      availability: 'In Stock',
      image: null,
      type: 'Quarry Material'
    },
    {
      id: 'MAT-AGG',
      name: '10mm & 20mm Aggregates',
      division: 'suppliers',
      divisionLabel: 'Suppliers & Traders',
      specs: 'Graded cubical blue metal aggregate for high-grade column, beam, and slab structural concrete',
      price: 'Market Fair Rate / Ton',
      deposit: 'Min 5 Tons',
      availability: 'In Stock',
      image: null,
      type: 'Quarry Material'
    }
  ];

  const filtered = activeTab === 'all' ? catalogue : catalogue.filter(c => c.division === activeTab);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-500">Products & Equipment</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Full Enterprise Catalogue</h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Browse our fleet of compaction machinery, solar rooftop systems, and quarry building materials.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl gap-1">
          {[
            { key: 'all', label: 'All Items' },
            { key: 'construction', label: 'Construction Machines' },
            { key: 'solar', label: 'Solar Systems' },
            { key: 'suppliers', label: 'Building Materials' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
                activeTab === tab.key
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(item => (
          <TiltCard key={item.id} className="h-full">
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 flex flex-col justify-between h-full shadow-xl transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {item.id}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {item.availability}
                  </span>
                </div>

                {/* Silhouette or Icon */}
                <div className="w-full h-44 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-center p-4">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="max-h-36 object-contain filter drop-shadow-md" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <Layers className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{item.divisionLabel}</div>
                  <h3 className="text-xl font-bold text-white mt-0.5">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.specs}</p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Tariff / Price</span>
                    <span className="font-mono font-bold text-white text-sm">{item.price}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px]">Details</span>
                    <span className="font-mono text-amber-400">{item.deposit}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => openLeadModal(item.division, `Inquiry for ${item.name} (${item.id})`, `Inquire ${item.name}`)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
                >
                  <span>Request Availability</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  );
}
