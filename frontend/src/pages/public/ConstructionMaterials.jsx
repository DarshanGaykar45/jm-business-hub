import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Layers, Truck, Scale, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/company.config';
import { MEDIA, getHeroStyle } from '../../theme/media';
import MaterialEstimator from '../../components/public/MaterialEstimator';
import TiltCard from '../../components/public/TiltCard';

export default function ConstructionMaterials() {
  const { openLeadModal } = useOutletContext();
  const heroStyle = getHeroStyle(MEDIA.heroSuppliers, 'suppliers');

  const suppliers = COMPANY_CONFIG.divisions.find(d => d.key === 'suppliers');
  const materials = suppliers?.materials || [];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO */}
      <section style={heroStyle} className="min-h-[60vh] flex items-center justify-center pt-28 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <span>Jay Malhar Suppliers & Traders</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Quarry-Direct Construction Materials
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto">
            {suppliers?.description} High-density crushing stones, washed river sand, and 10/20mm blue metal aggregates with certified weighbridge assurance.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openLeadModal('suppliers', 'Inquiry for bulk quarry material tipper dispatch', 'Order Raw Materials')}
              className="px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-xl shadow-cyan-600/25 flex items-center gap-2 transition"
            >
              <span>Request Tipper Delivery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. MATERIALS WE SUPPLY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">Inventory Supply</span>
          <h2 className="text-3xl font-extrabold text-white">Materials We Supply</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Supplying contractors, road developers, and residential homebuilders across Sinnar and Nashik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {materials.map((mat, idx) => (
            <TiltCard key={idx} className="h-full">
              <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-8 flex flex-col justify-between h-full shadow-2xl transition-all">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold rounded-lg">
                      Unit: {mat.unit}
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-lg flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{mat.availability}</span>
                    </span>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Layers className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white">{mat.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">Minimum Dispatch: {mat.minOrder}</p>
                  </div>

                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Quality Standard:</span>
                      <span className="font-semibold text-white">Heavy Basalt Blue Metal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery Mode:</span>
                      <span className="font-semibold text-white">Tipper Truck / Dumper</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => openLeadModal('suppliers', `Inquiry for ${mat.name} (Min Order: ${mat.minOrder})`, `Inquire ${mat.name}`)}
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition active:scale-95"
                  >
                    <span>Request Quotation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* 3. MATERIAL QUANTITY ESTIMATOR */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <MaterialEstimator onOpenLeadModal={openLeadModal} />
      </section>

      {/* 4. QUALITY STANDARDS & HONESTY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">Integrity in Sourcing</span>
          <h2 className="text-3xl font-extrabold text-white">Uncompromising Quality & Fair Weighing</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <Scale className="w-8 h-8 text-amber-400" />
            <h4 className="text-lg font-bold text-white">Government Weighbridge Slips</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every dispatched tipper is weighed gross and tare at verified digital weighbridges. You pay strictly for the exact tonnage delivered to your gate.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <h4 className="text-lg font-bold text-white">Sifted & Clean River Sand</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Free from silt, clay lumps, and excessive moisture. High compressive bonding strength for plaster and structural RCC works.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <Truck className="w-8 h-8 text-cyan-400" />
            <h4 className="text-lg font-bold text-white">Dedicated Fleet Logistics</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our company-managed tippers and dumper trucks ensure scheduled drops without contractor delays or third-party vehicle shortages.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
