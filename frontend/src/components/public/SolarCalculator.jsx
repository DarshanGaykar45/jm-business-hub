import React, { useState } from 'react';
import { Sun, Zap, IndianRupee, Clock, ArrowRight, ShieldCheck, Calculator } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/company.config';

export default function SolarCalculator({ onOpenLeadModal }) {
  const [monthlyBill, setMonthlyBill] = useState(2500); // ₹2500 default
  const [roofArea, setRoofArea] = useState(300); // 300 sq ft (~28 sqm)

  // Solar sizing formulas based on Maharashtra MSEDCL tariff & irradiance
  // Average unit rate: ~₹7.50 / kWh
  const estimatedUnitsPerMonth = Math.round(monthlyBill / 7.5);
  // 1 kW generates ~120 units/month and requires ~100 sq ft
  const neededKWByBill = Math.max(1, Math.round((estimatedUnitsPerMonth / 120) * 10) / 10);
  const maxKWByRoof = Math.max(1, Math.floor(roofArea / 100));
  const systemSizeKW = Math.min(neededKWByBill, Math.max(1, maxKWByRoof));

  // Generation
  const monthlyGenerationUnits = Math.round(systemSizeKW * 120);
  const annualSavings = Math.round(monthlyGenerationUnits * 12 * 7.5);

  // PM Surya Ghar Subsidy (from config)
  // 1 kW = ₹30,000 | 2 kW = ₹60,000 | 3 kW+ = ₹78,000 max
  let subsidyAmount = 0;
  if (systemSizeKW <= 1.2) {
    subsidyAmount = 30000;
  } else if (systemSizeKW <= 2.2) {
    subsidyAmount = 60000;
  } else {
    subsidyAmount = 78000;
  }

  // Estimated Gross Cost: ~₹55,000 / kW
  const grossCost = Math.round(systemSizeKW * 55000);
  const netCost = Math.max(0, grossCost - subsidyAmount);
  const paybackYears = (netCost / (annualSavings || 1)).toFixed(1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Sundatta Renewables</span>
          <h3 className="text-xl font-bold text-white">Solar Savings Calculator</h3>
        </div>
      </div>

      {/* Input Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-slate-300">Average Monthly Electricity Bill</label>
            <span className="text-lg font-bold font-mono text-amber-400">₹{monthlyBill.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min={1000}
            max={25000}
            step={500}
            value={monthlyBill}
            onChange={(e) => setMonthlyBill(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>₹1,000</span>
            <span>₹10,000</span>
            <span>₹25,000+</span>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-slate-300">Available Shadow-free Rooftop</label>
            <span className="text-lg font-bold font-mono text-amber-400">{roofArea} sq. ft.</span>
          </div>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={roofArea}
            onChange={(e) => setRoofArea(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>100 sq ft</span>
            <span>1,000 sq ft</span>
            <span>2,000+ sq ft</span>
          </div>
        </div>
      </div>

      {/* Calculated Output Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl text-center">
          <div className="flex justify-center text-amber-400 mb-1">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400">Recommended Size</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{systemSizeKW} kW</div>
        </div>

        <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl text-center">
          <div className="flex justify-center text-emerald-400 mb-1">
            <Sun className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400">Monthly Generation</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">~{monthlyGenerationUnits} Units</div>
        </div>

        <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl text-center">
          <div className="flex justify-center text-cyan-400 mb-1">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400">Govt Subsidy Slabs</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">₹{subsidyAmount.toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl text-center">
          <div className="flex justify-center text-purple-400 mb-1">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400">Payback Period</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">~{paybackYears} Years</div>
        </div>
      </div>

      {/* Net Investment summary & CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-amber-500/10 via-slate-800/40 to-emerald-500/10 border border-amber-500/20 rounded-2xl">
        <div>
          <div className="text-xs text-slate-400">Estimated Net Investment (After PM Surya Ghar Subsidy)</div>
          <div className="text-2xl font-extrabold font-mono text-white mt-0.5">
            ₹{netCost.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-400 line-through">₹{grossCost.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-xs text-emerald-400 mt-1">Saves approximately ₹{annualSavings.toLocaleString('en-IN')}/year</div>
        </div>

        <button
          onClick={() => onOpenLeadModal('solar', `Solar Calculator estimate: ${systemSizeKW} kW system for monthly bill ₹${monthlyBill}`)}
          className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95 whitespace-nowrap"
        >
          <span>Get Official Subsidy Quote</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-slate-500 mt-4 text-center">
        * Disclaimer: Calculations are indicative based on standard Maharashtra irradiance. Final size and subsidy eligibility subject to physical site survey.
      </p>
    </div>
  );
}
