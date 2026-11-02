import React, { useState } from 'react';
import { X, ZoomIn, Filter } from 'lucide-react';
import { MEDIA } from '../../theme/media';

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activePhoto, setActivePhoto] = useState(null);

  const galleryItems = [
    {
      title: 'Jay Malhar Group Operations Billboard',
      division: 'all',
      divisionLabel: 'Group Billboard',
      caption: 'Official billboard displayed at Sinnar highway junction featuring all three divisions.',
      src: MEDIA.heroHome
    },
    {
      title: 'Commercial Solar Installation Array',
      division: 'solar',
      divisionLabel: 'Sundatta Renewables',
      caption: 'Turnkey industrial rooftop solar power plant installation in Sinnar MIDC.',
      src: MEDIA.heroSolar
    },
    {
      title: 'Foundation Compaction Earthwork',
      division: 'construction',
      divisionLabel: 'Jay Malhar Construction',
      caption: 'Tamping rammer and vibratory soil compaction bed preparation for residential foundation.',
      src: MEDIA.heroConstruction
    },
    {
      title: 'Quarry Stone Aggregate Crushing Plant',
      division: 'suppliers',
      divisionLabel: 'Suppliers & Traders',
      caption: 'Graded blue metal aggregate crushing and tipper loading yard in Nashik district.',
      src: MEDIA.heroSuppliers
    }
  ];

  const filtered = activeFilter === 'all' ? galleryItems : galleryItems.filter(i => i.division === activeFilter);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-500">Project & Facility Portfolio</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Visual Project Showcase</h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Real operations, equipment on field, and solar installation projects across Nashik & Sinnar.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl gap-1">
          {[
            { key: 'all', label: 'All Photos' },
            { key: 'construction', label: 'Compaction Equipment' },
            { key: 'solar', label: 'Solar Projects' },
            { key: 'suppliers', label: 'Quarry Materials' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
                activeFilter === f.key
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setActivePhoto(item)}
            className="group relative bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-2xl cursor-pointer transition-all"
          >
            <div className="aspect-video w-full overflow-hidden bg-slate-950">
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>
            <div className="p-6 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{item.divisionLabel}</span>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.caption}</p>
            </div>
            <div className="absolute top-4 right-4 p-2 bg-slate-950/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
              <ZoomIn className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-950/80 rounded-full text-white hover:bg-slate-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={activePhoto.src} alt={activePhoto.title} className="w-full max-h-[70vh] object-contain bg-slate-950" />
            <div className="p-6 bg-slate-900 space-y-1 border-t border-slate-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{activePhoto.divisionLabel}</span>
              <h3 className="text-xl font-bold text-white">{activePhoto.title}</h3>
              <p className="text-sm text-slate-400">{activePhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
