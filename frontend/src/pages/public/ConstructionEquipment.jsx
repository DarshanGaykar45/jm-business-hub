import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Wrench, Shield, Clock, CheckCircle2, Phone, MessageSquare, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/company.config';
import { MEDIA, getHeroStyle } from '../../theme/media';
import TiltCard from '../../components/public/TiltCard';

export default function ConstructionEquipment() {
  const { openLeadModal } = useOutletContext();
  const heroStyle = getHeroStyle(MEDIA.heroConstruction, 'construction');

  const construction = COMPANY_CONFIG.divisions.find(d => d.key === 'construction');
  const machines = construction?.machines || [];

  const benefits = [
    {
      title: "Maintained & Tested",
      desc: "Every rammer and compactor undergoes pre-delivery spark plug, engine oil, and vibration test before dispatch."
    },
    {
      title: "Same-Day Dispatch in Sinnar",
      desc: "Instant pickup from Shriram Chowk yard, or site tipper delivery across Pathre Budruk, Sinnar, and Sangamner."
    },
    {
      title: "Fair Daily & Weekly Rates",
      desc: "Transparent rental tariffs with zero hidden charges. Operator guidance provided for new users."
    },
    {
      title: "Prompt On-Site Support",
      desc: "If any machine encounters difficulties in the field, our mobile service team replaces or fixes it within hours."
    }
  ];

  const steps = [
    { step: "01", title: "Select Machine", desc: "Choose between Tamping Rammer (TR-001) or Plate Compactor (PC-001)." },
    { step: "02", title: "Confirm Dates", desc: "Specify start date, duration, and whether you need operator assistance." },
    { step: "03", title: "Pickup or Delivery", desc: "Collect from our yard at Shriram Chowk or get site drop-off in Sinnar." },
    { step: "04", title: "Return & Refund", desc: "Return machine after compaction work; security deposit refunded instantly." }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO */}
      <section style={heroStyle} className="min-h-[60vh] flex items-center justify-center pt-28 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <span>Jay Malhar Construction</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            High-Impact Soil Compaction Equipment
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto">
            {construction?.description} Professional heavy-duty tamping rammers and vibratory plate compactors for road, foundation, and trench compaction.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openLeadModal('construction', 'Inquiry for equipment availability', 'Check Equipment Fleet')}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-xl shadow-amber-500/20 flex items-center gap-2 transition"
            >
              <span>Check Fleet Availability</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. WHAT WE OFFER — MACHINE FLEET CARDS (WITH 3D TILT & SVG SILHOUETTES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-500">Fleet Catalogue</span>
          <h2 className="text-3xl font-extrabold text-white">What We Offer For Rent</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Heavy-duty, job-site ready compaction machines with verified mechanical condition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {machines.map((machine) => {
            const svgPath = machine.id === 'TR-001' ? MEDIA.rammerSVG : MEDIA.compactorSVG;
            return (
              <TiltCard key={machine.id} className="h-full">
                <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-8 flex flex-col justify-between h-full shadow-2xl transition-all">
                  <div className="space-y-6">
                    {/* Top machine badge & code */}
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold rounded-lg">
                        ID: {machine.id}
                      </span>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-lg flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{machine.availability}</span>
                      </span>
                    </div>

                    {/* Machine SVG Silhouette in 3D Stage */}
                    <div className="w-full h-48 bg-slate-950/60 rounded-2xl flex items-center justify-center p-4 border border-slate-800/80 group overflow-hidden">
                      <img
                        src={svgPath}
                        alt={machine.name}
                        className="max-h-40 object-contain filter drop-shadow-[0_10px_20px_rgba(242,169,59,0.15)] group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    </div>

                    {/* Name & Specs */}
                    <div>
                      <h3 className="text-2xl font-bold text-white">{machine.name}</h3>
                      <p className="text-sm text-slate-400 mt-1 leading-relaxed">{machine.specs}</p>
                    </div>

                    {/* Rates & Deposit */}
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                      <div>
                        <div className="text-xs text-slate-500">Rental Rate</div>
                        <div className="text-lg font-bold font-mono text-amber-400">{machine.rentalPrice}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Security Deposit</div>
                        <div className="text-lg font-bold font-mono text-slate-300">{machine.depositRequired}</div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-6">
                    <button
                      onClick={() => openLeadModal('construction', `Rental booking inquiry for ${machine.name} (${machine.id})`, `Book ${machine.name}`)}
                      className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
                    >
                      <span>Check Availability & Book</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* 3. WHY RENT FROM US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-500">Contractor Advantage</span>
          <h2 className="text-3xl font-extrabold text-white">Why Rent From Jay Malhar?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <h4 className="text-base font-bold text-white">{b.title}</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. RENTAL PROCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-500">Seamless Workflow</span>
          <h2 className="text-3xl font-extrabold text-white">Simple 4-Step Rental Process</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-2 relative">
              <div className="text-3xl font-black font-mono text-amber-500/30">{s.step}</div>
              <h4 className="text-lg font-bold text-white">{s.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CONTACT FOR BOOKING BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border border-amber-500/30 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Need Urgent Machinery on Site Today?</h3>
            <p className="text-sm text-slate-300">
              Call our equipment manager directly at Sinnar or message via WhatsApp for immediate machine mobilization.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-amber-300 pt-1 justify-center md:justify-start">
              <span>Santosh Satav: 9158494138</span>
              <span>•</span>
              <span>Abhishek Satav: 9096547260</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href={`https://wa.me/91${construction?.whatsapp}?text=Hello,%20I%20want%20to%20rent%20equipment%20from%20Jay%20Malhar.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Booking</span>
            </a>
            <button
              onClick={() => openLeadModal('construction', 'Urgent rental booking request', 'Quick Machine Booking')}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              <span>Instant Request</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
