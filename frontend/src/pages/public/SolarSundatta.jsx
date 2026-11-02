import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Sun, Zap, ShieldCheck, Award, ExternalLink, ArrowRight, BatteryCharging, CheckCircle, Info } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/company.config';
import { MEDIA, getHeroStyle } from '../../theme/media';
import SolarCalculator from '../../components/public/SolarCalculator';

export default function SolarSundatta() {
  const { openLeadModal } = useOutletContext();
  const heroStyle = getHeroStyle(MEDIA.heroSolar, 'solar');

  const solar = COMPANY_CONFIG.divisions.find(d => d.key === 'solar');
  const subsidy = solar?.subsidy;
  const partnerBrands = solar?.partners || ["Premier Energies", "Xwatt", "TATA", "Polycab", "Adani Solar", "Waaree"];

  const systemTypes = [
    {
      name: "On-Grid Solar System",
      badge: "Most Popular & Subsidized",
      desc: "Directly synchronized with the MSEDCL electricity grid. Surplus solar energy generated during the day is exported to the grid via a Bi-directional Net Meter, reducing your monthly power bill to near zero.",
      features: [
        "100% Eligible for PM Surya Ghar Yojana Subsidy",
        "Lowest capital cost per kW",
        "No battery replacement expenses",
        "Net-metering adjustments on MSEDCL bill"
      ]
    },
    {
      name: "Hybrid Solar System",
      badge: "Grid + Battery Backup",
      desc: "Combines grid net-metering benefits with lithium/tubular battery backup. Powers your essential lights, fans, and refrigeration during power cuts while still earning solar credits.",
      features: [
        "Uninterrupted power during outages",
        "Smart inverter power prioritization",
        "Partial subsidy eligibility for on-grid portion",
        "Ideal for rural & industrial areas with load shedding"
      ]
    },
    {
      name: "Off-Grid Solar System",
      badge: "Complete Energy Independence",
      desc: "Self-contained solar system with high-capacity battery storage. Designed for remote agricultural farmhouses, poultry units, and farm pumping where grid connectivity is unstable.",
      features: [
        "Operates 100% independent of the grid",
        "Heavy-duty battery bank storage",
        "Custom designed for farm pumps & machinery",
        "Zero electricity bills for life"
      ]
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO */}
      <section style={heroStyle} className="min-h-[60vh] flex items-center justify-center pt-28 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <span>Sundatta Renewables · PM Surya Ghar Yojana</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Your Roof Your Power — Clean Solar Energy
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto">
            {solar?.description} Cut your electricity bill by up to 90% with approved central government subsidy up to ₹78,000.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openLeadModal('solar', 'Free solar site survey request', 'Request Free Solar Consultation')}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xl shadow-emerald-600/25 flex items-center gap-2 transition"
            >
              <span>Get Free Site Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/subsidy"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
            >
              <span>Subsidy Rules & Guide</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SOLAR SAVINGS CALCULATOR */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SolarCalculator onOpenLeadModal={openLeadModal} />
      </section>

      {/* 3. GOVERNMENT SUBSIDY SCHEMES TABLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">PM Surya Ghar: Muft Bijli Yojana</span>
          <h2 className="text-3xl font-extrabold text-white">Central Government Subsidy Slabs</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            {subsidy?.disclaimer} Rates applicable across Maharashtra through the National Portal.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">System Capacity</th>
                  <th className="px-6 py-4">Central Subsidy Amount</th>
                  <th className="px-6 py-4">Monthly Generation</th>
                  <th className="px-6 py-4">Module Warranty</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                {subsidy?.schemes?.map((sch, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>{sch.capacity}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">{sch.subsidy}</td>
                    <td className="px-6 py-4 font-mono">
                      {idx === 0 ? '120 Units/mo' : idx === 1 ? '240 Units/mo' : '360 - 1200 Units/mo'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{sch.warranty}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openLeadModal('solar', `Inquiry for ${sch.capacity} solar system with ${sch.subsidy} subsidy`, `Quote for ${sch.capacity}`)}
                        className="px-4 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold rounded-lg transition"
                      >
                        Apply Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Last updated: {subsidy?.lastUpdated}. Direct credit to customer bank account.</span>
            </span>
            <a
              href="https://pmsuryaghar.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Official National Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 4. SYSTEM TYPES (On-Grid, Hybrid, Off-Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Architecture & Technology</span>
          <h2 className="text-3xl font-extrabold text-white">Solar System Configurations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {systemTypes.map((sys, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-lg inline-block">
                  {sys.badge}
                </span>
                <h3 className="text-xl font-bold text-white">{sys.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{sys.desc}</p>
                <div className="pt-2 space-y-2 text-xs text-slate-300">
                  {sys.features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => openLeadModal('solar', `Inquiry for ${sys.name}`, `Consult on ${sys.name}`)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Inquire For Your Property
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TIER-1 PARTNER BRANDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Certified Hardware</span>
          <h2 className="text-2xl font-bold text-white">Authorized Partner Brands & Modules</h2>
          <p className="text-xs text-slate-400">We only deploy ALMM-listed Tier-1 photovoltaic modules and MNRE approved inverters.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {partnerBrands.map((brand, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-center text-center font-bold text-sm text-slate-300 hover:text-white hover:border-emerald-500/40 transition shadow-md"
            >
              {brand}
            </div>
          ))}
        </div>
      </section>

      {/* 6. FREE CONSULTATION CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-600/20 via-slate-900 to-emerald-600/10 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <h3 className="text-3xl font-extrabold text-white">Ready to Turn Your Roof Into a Power Plant?</h3>
          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
            Book a complimentary rooftop shadow and structural feasibility inspection by our certified engineers in Sinnar & Nashik.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => openLeadModal('solar', 'Free rooftop solar feasibility survey', 'Book Rooftop Survey')}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xl shadow-emerald-600/25 flex items-center gap-2 transition active:scale-95"
            >
              <span>Book Free Rooftop Survey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={`https://wa.me/91${solar?.whatsapp}?text=Hello%20Sundatta%20Solar,%20I%20want%20to%20consult%20about%20rooftop%20solar.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-slate-900 border border-slate-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
            >
              <span>WhatsApp Engineer</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
