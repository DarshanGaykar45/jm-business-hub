import React, { useState } from 'react';
import { Layers, ArrowRight, Calculator } from 'lucide-react';

export default function MaterialEstimator({ onOpenLeadModal }) {
  const [projectType, setProjectType] = useState('foundation'); // foundation | road | slab
  const [length, setLength] = useState(40); // ft
  const [width, setWidth] = useState(30); // ft
  const [depth, setDepth] = useState(0.5); // ft (6 inches)

  // Volume in Cubic Feet (CFT)
  const volumeCFT = Math.round(length * width * depth);
  // Brass = CFT / 100
  const brass = (volumeCFT / 100).toFixed(1);

  // Estimations based on mix ratio
  // Standard foundation: 1:2:4 (Cement:Sand:Aggregate) + rubble stone base
  let stoneTons = 0;
  let sandCFT = 0;
  let aggregateTons = 0;

  if (projectType === 'foundation') {
    stoneTons = Math.round((volumeCFT * 0.05) * 10) / 10;
    sandCFT = Math.round(volumeCFT * 0.4);
    aggregateTons = Math.round((volumeCFT * 0.04) * 10) / 10;
  } else if (projectType === 'road') {
    stoneTons = Math.round((volumeCFT * 0.07) * 10) / 10;
    sandCFT = Math.round(volumeCFT * 0.2);
    aggregateTons = Math.round((volumeCFT * 0.06) * 10) / 10;
  } else {
    // RCC Slab
    stoneTons = 0;
    sandCFT = Math.round(volumeCFT * 0.45);
    aggregateTons = Math.round((volumeCFT * 0.06) * 10) / 10;
  }

  const handleGetQuote = () => {
    const summary = `Material Estimation for ${projectType.toUpperCase()} (${length}x${width}x${depth} ft): ${stoneTons > 0 ? `${stoneTons} Tons Stones, ` : ''}${sandCFT} CFT Sand, ${aggregateTons} Tons Aggregates (${brass} Brass total volume).`;
    onOpenLeadModal('suppliers', summary);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Jay Malhar Suppliers & Traders</span>
          <h3 className="text-xl font-bold text-white">Construction Material Quantity Estimator</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Structure</label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          >
            <option value="foundation">Building Foundation / Murum Bed</option>
            <option value="road">Internal Road / Paving Base</option>
            <option value="slab">RCC Floor / Roof Slab</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Length (Feet)</label>
          <input
            type="number"
            min={1}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Width (Feet)</label>
          <input
            type="number"
            min={1}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Depth / Thickness (Feet)</label>
          <input
            type="number"
            step={0.1}
            min={0.1}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition font-mono"
          />
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-center">
          <div className="text-xs text-slate-400">Total Volume</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{volumeCFT} CFT</div>
          <div className="text-[11px] text-amber-400 mt-0.5">({brass} Brass)</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-center">
          <div className="text-xs text-slate-400">Crushing Stones</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{stoneTons} Tons</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Base Murum & Pitching</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-center">
          <div className="text-xs text-slate-400">River/Coarse Sand</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{sandCFT} CFT</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Washed & Sifted</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-center">
          <div className="text-xs text-slate-400">Aggregates (10/20mm)</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{aggregateTons} Tons</div>
          <div className="text-[11px] text-slate-500 mt-0.5">High Density Blue Metal</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
        <div className="text-xs text-slate-400">
          Need tipper truck dispatch to your site in Nashik or Sinnar taluka?
        </div>
        <button
          onClick={handleGetQuote}
          className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95"
        >
          <span>Get Quote for This List</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
