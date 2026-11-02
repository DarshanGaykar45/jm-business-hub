import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Sun, ShieldCheck, CheckCircle2, ExternalLink, ArrowRight, FileText, Banknote, HelpCircle } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/company.config';

export default function SolarSubsidy() {
  const { openLeadModal } = useOutletContext();
  const solar = COMPANY_CONFIG.divisions.find(d => d.key === 'solar');
  const subsidy = solar?.subsidy;

  const eligibilityCriteria = [
    "Applicant must be an Indian citizen with a residential electricity consumer number (MSEDCL/Mahavitaran).",
    "Must possess legal ownership of the residential rooftop or open terrace space.",
    "Property must have a shadow-free roof area suitable for module installation (approx. 100 sq.ft per kW).",
    "Applicant must possess an active Aadhaar-linked savings bank account for direct DBT subsidy transfer.",
    "Only new, uninstalled Tier-1 Made-in-India (DCR compliant) solar cells & modules are eligible."
  ];

  const steps = [
    {
      step: "01",
      title: "National Portal Registration",
      desc: "Register on pmsuryaghar.gov.in using your MSEDCL Consumer Number and active mobile number."
    },
    {
      step: "02",
      title: "Technical Feasibility Approval",
      desc: "Our engineers submit the Net Metering technical feasibility request directly to MSEDCL."
    },
    {
      step: "03",
      title: "Installation by Sundatta Renewables",
      desc: "We install certified Tier-1 panels, inverter, and earthing system as an approved installer."
    },
    {
      step: "04",
      title: "Net Metering & Subsidy Credit",
      desc: "MSEDCL inspects and installs the Bi-directional meter. Subsidy is credited to your bank account within 30 days."
    }
  ];

  const subsidyFaqs = [
    {
      q: "How is the subsidy amount transferred to my account?",
      a: "The subsidy is transferred via Direct Benefit Transfer (DBT) directly from the Ministry of New and Renewable Energy (MNRE) into your Aadhaar-seeded bank account upon commissioning."
    },
    {
      q: "Can commercial shops or factories get the PM Surya Ghar subsidy?",
      a: "The PM Surya Ghar scheme subsidy is specifically reserved for residential consumers. However, commercial and agricultural establishments receive accelerated depreciation and substantial electricity tariff savings."
    },
    {
      q: "Does Sundatta Renewables handle all the liaison and paperwork?",
      a: "Yes. From online application submission to physical site inspection coordination with MSEDCL engineers, our team manages the entire process for you."
    }
  ];

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <span>Official Government Portal Guidance</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          PM Surya Ghar: Muft Bijli Yojana Subsidy
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Comprehensive guide to securing up to ₹78,000 central government direct subsidy for residential solar rooftop plants in Maharashtra.
        </p>
      </div>

      {/* Subsidy Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 sm:p-8 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white">Central Subsidy Slabs Structure</h3>
          <p className="text-xs text-slate-400 mt-1">Direct credit to customer bank account upon net-meter activation</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">System Capacity</th>
                <th className="px-6 py-4">Subsidy Amount</th>
                <th className="px-6 py-4">Monthly Generation</th>
                <th className="px-6 py-4">Module Warranty</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {subsidy?.schemes?.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>{s.capacity}</span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-400 text-base">{s.subsidy}</td>
                  <td className="px-6 py-4 font-mono">
                    {idx === 0 ? '120 kWh/mo' : idx === 1 ? '240 kWh/mo' : '360+ kWh/mo'}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{s.warranty}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openLeadModal('solar', `Subsidy application for ${s.capacity}`, `Apply for ${s.capacity} Subsidy`)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
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
          <span>* Rates verified as per official guidelines ({subsidy?.lastUpdated}). Subject to site feasibility.</span>
          <a
            href="https://pmsuryaghar.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Visit PM Surya Ghar National Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Eligibility Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Eligibility Criteria</h3>
              <p className="text-xs text-slate-400">Check if your household qualifies</p>
            </div>
          </div>

          <ul className="space-y-3 text-sm text-slate-300">
            {eligibilityCriteria.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Application Process Steps */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">4-Step Application Flow</h3>
              <p className="text-xs text-slate-400">Handled completely by Sundatta Renewables</p>
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((s, idx) => (
              <div key={idx} className="flex gap-4 p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <span className="font-mono text-xl font-extrabold text-amber-400">{s.step}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">{s.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subsidy FAQ */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>Subsidy Frequently Asked Questions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subsidyFaqs.map((faq, idx) => (
            <div key={idx} className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-white">{faq.q}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
