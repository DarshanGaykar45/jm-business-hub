import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Shield, Target, Users, Award, MapPin, ArrowRight, Phone } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/company.config';
import { MEDIA, getHeroStyle } from '../../theme/media';

export default function About() {
  const { openLeadModal } = useOutletContext();
  const heroStyle = getHeroStyle(MEDIA.aboutBanner, 'default');

  const milestones = [
    {
      year: "2018",
      title: "Foundations in Soil Compaction",
      desc: "Founded by Santosh Vaman Satav in Pathre Budruk, Sinnar. Started with tamping rammers and plate compactors serving local road and house foundation contractors."
    },
    {
      year: "2021",
      title: "Expansion into Quarry Material Logistics",
      desc: "Established Jay Malhar Suppliers & Traders to meet high local demand for certified crushing stones, river sand, and graded aggregates."
    },
    {
      year: "2024",
      title: "Sundatta Renewables Launch",
      desc: "Partnered with premier solar manufacturers (TATA, Adani, Premier Energies) to bring PM Surya Ghar Yojana approved rooftop solar installations to Nashik district."
    },
    {
      year: "2026",
      title: "Integrated Enterprise Hub",
      desc: "Consolidated all operations under Jay Malhar Udyog Samuha with digital fleet dispatch, automated quotation generator, and real-time inventory management."
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Banner */}
      <section style={heroStyle} className="min-h-[50vh] flex items-center justify-center pt-28 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4 animate-fadeIn">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">About Jay Malhar Udyog Samuha</span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white">Built on Trust, Precision & Rural Enterprise</h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            From heavy soil compaction on Sinnar highways to generating clean rooftop solar energy across Nashik homes.
          </p>
        </div>
      </section>

      {/* Leadership & Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-500">Proprietor & Leadership</span>
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              A Family Tradition of Uncompromising Civil Engineering Quality
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              Jay Malhar Udyog Samuha was established under the stewardship of <strong>Santosh Vaman Satav</strong> and{' '}
              <strong>Abhishek Santosh Satav</strong> at Shriram Chowk, Pathre Budruk, Tal. Sinnar, Dist. Nashik.
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              Our guiding philosophy is simple: honesty in measurement, uncompromising reliability of machinery, and
              long-term partnership with builders, farmers, and residential homeowners.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <Shield className="w-6 h-6 text-amber-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Zero Breakdown Policy</h4>
                <p className="text-xs text-slate-400 mt-1">Pre-rental testing on all rammers and compactors.</p>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <Target className="w-6 h-6 text-emerald-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Fair Indian Rates</h4>
                <p className="text-xs text-slate-400 mt-1">Transparent rental and material pricing without hidden fees.</p>
              </div>
            </div>
          </div>

          {/* Business card snapshot */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
            <div className="text-xs uppercase font-bold text-amber-500 tracking-wider">Registered Operations Office</div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">{COMPANY_CONFIG.groupName}</h3>
              <p className="text-sm text-slate-400">{COMPANY_CONFIG.address}</p>
            </div>
            <div className="border-t border-slate-800 pt-4 space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Proprietor:</span>
                <span className="font-bold text-white">{COMPANY_CONFIG.proprietor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Contact Person:</span>
                <span className="font-bold text-white">{COMPANY_CONFIG.contactPerson}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Primary Phone:</span>
                <span className="font-mono text-amber-400 font-bold">{COMPANY_CONFIG.primaryPhone}</span>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => openLeadModal('construction', 'Inquiry from About Us page', 'Contact Management')}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-center text-sm transition"
              >
                Inquire With Management
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Timeline */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-500">Milestones</span>
          <h2 className="text-3xl font-extrabold text-white">Our Journey of Growth</h2>
        </div>

        <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-32 space-y-10 py-4">
          {milestones.map((item, idx) => (
            <div key={idx} className="relative pl-6 sm:pl-10">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-slate-950" />
              <div className="hidden sm:block absolute -left-28 top-0.5 text-sm font-bold font-mono text-amber-400">
                {item.year}
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
                <div className="sm:hidden text-xs font-bold font-mono text-amber-400 mb-1">{item.year}</div>
                <h4 className="text-lg font-bold text-white">{item.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
