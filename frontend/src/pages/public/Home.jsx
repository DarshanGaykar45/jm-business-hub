import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Wrench, Sun, Layers, ArrowRight, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, MapPin, Phone } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/company.config';
import { MEDIA, getHeroStyle } from '../../theme/media';
import TiltCard from '../../components/public/TiltCard';

export default function Home() {
  const { openLeadModal } = useOutletContext();
  const [openFaq, setOpenFaq] = useState(0);

  const heroStyle = getHeroStyle(MEDIA.heroHome, 'home');

  const faqs = [
    {
      q: "How does equipment rental booking work for Tamping Rammers and Plate Compactors?",
      a: "You can book directly by clicking 'Rent Equipment' or messaging our Sinnar office on WhatsApp. Equipment is dispatched with full mechanical inspection. Security deposit is refundable upon safe return."
    },
    {
      q: "Are your solar installations eligible for the PM Surya Ghar Muft Bijli Yojana subsidy?",
      a: "Yes! Sundatta Renewables is an approved installer. We handle complete documentation, site survey, DISCOM (MSEDCL) net-metering approvals, and direct-to-bank subsidy disbursement of up to ₹78,000."
    },
    {
      q: "What is the minimum order quantity for crushing stones and construction sand?",
      a: "We supply from single-tipper quantities (10 tons of stone / 100 CFT sand) up to large commercial project volumes with swift site delivery across Nashik and Sinnar taluka."
    },
    {
      q: "Where is Jay Malhar Udyog Samuha physically located?",
      a: `Our main operations hub is at ${COMPANY_CONFIG.address}. You are welcome to visit our yard or request on-site machine delivery.`
    }
  ];

  return (
    <div className="space-y-24">
      {/* 1. HERO SECTION */}
      <section
        style={heroStyle}
        className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Subtle Particle overlay */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8 animate-fadeIn">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Jay Malhar Udyog Samuha · Nashik Region</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Construction Equipment & <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              Solar Solutions
            </span>{' '}
            for Nashik Region
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
            Rent, Buy, Install — From Equipment to Energy. Verified heavy compaction machinery, PM Surya Ghar solar rooftop plants, and quarry stone aggregates.
          </p>

          {/* 3 Pre-filled Lead CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
            <button
              onClick={() => openLeadModal('construction', 'Inquiry for Construction Equipment Rental (Tamping Rammer / Plate Compactor)', 'Rent Construction Equipment')}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-xl shadow-amber-500/25 flex items-center gap-2 transition active:scale-95 text-sm sm:text-base"
            >
              <Wrench className="w-4 h-4" />
              <span>Rent Equipment</span>
            </button>

            <button
              onClick={() => openLeadModal('solar', 'Inquiry for Sundatta Renewables PM Surya Ghar Solar Rooftop Installation', 'Get Solar Subsidy Quote')}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xl shadow-emerald-600/25 flex items-center gap-2 transition active:scale-95 text-sm sm:text-base"
            >
              <Sun className="w-4 h-4" />
              <span>Get Solar Quote</span>
            </button>

            <button
              onClick={() => openLeadModal('suppliers', 'Inquiry for Crushing Stones / River Sand / Aggregate Supply', 'Order Building Materials')}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition active:scale-95 text-sm sm:text-base"
            >
              <Layers className="w-4 h-4" />
              <span>Buy Materials</span>
            </button>
          </div>

          {/* Quick Contact Line */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Shriram Chowk, Pathre Budruk, Sinnar</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct: 9096547260 / 9158494138</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR (No fake numbers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-20">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400">12+</div>
            <div className="text-xs sm:text-sm font-medium text-slate-300">Equipment in Fleet</div>
            <div className="text-[11px] text-slate-500">Rammers, Compactors, Rollers</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">450+ kW</div>
            <div className="text-xs sm:text-sm font-medium text-slate-300">Solar Installed</div>
            <div className="text-[11px] text-slate-500">PM Surya Ghar Approved</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-400">100%</div>
            <div className="text-xs sm:text-sm font-medium text-slate-300">Honest Quarry Billing</div>
            <div className="text-[11px] text-slate-500">Certified Weighbridge Slips</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-purple-400">Nashik & Sinnar</div>
            <div className="text-xs sm:text-sm font-medium text-slate-300">Regions Served</div>
            <div className="text-[11px] text-slate-500">Fast Local Site Delivery</div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED DIVISIONS (3 Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-500">Our Enterprise Divisions</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Three Pillars of Infrastructure Excellence</h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Each business division operates with dedicated technicians, reliable machinery, and fair pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Division 1: Construction */}
          <TiltCard className="h-full">
            <div className="h-full bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-8 flex flex-col justify-between shadow-xl transition-all">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Wrench className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Jay Malhar Construction</h3>
                  <p className="text-xs font-semibold text-amber-400 mt-0.5">Quality · Strength · Durability</p>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Specialists in murum (soil) compaction work at fair rates. Featuring Tamping Rammer TR-001 (₹1,200/day)
                  and Plate Compactor PC-001 (₹1,500/day).
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Soil & foundation compaction</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Operator assistance available</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  to="/equipment"
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>Explore Equipment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </TiltCard>

          {/* Division 2: Solar */}
          <TiltCard className="h-full">
            <div className="h-full bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-8 flex flex-col justify-between shadow-xl transition-all">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sun className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Sundatta Renewables</h3>
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5">Your Roof Your Power</p>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  PM Surya Ghar Yojana approved rooftop solar installations. Tier-1 panels, 25-year warranty,
                  and direct government subsidy assistance up to ₹78,000.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>1 kW to 10 kW residential systems</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>MSEDCL Net-metering approval</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  to="/solar"
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>Solar Savings & Subsidy</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </TiltCard>

          {/* Division 3: Suppliers */}
          <TiltCard className="h-full">
            <div className="h-full bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-8 flex flex-col justify-between shadow-xl transition-all">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Layers className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Jay Malhar Suppliers & Traders</h3>
                  <p className="text-xs font-semibold text-cyan-400 mt-0.5">Quality Materials, Fair Prices</p>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Direct quarry supply of high-grade crushing stones, washed river sand, and graded aggregates.
                  Prompt tipper delivery across construction projects in Nashik district.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Crushed stone pitching & base</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>10mm / 20mm blue metal aggregate</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  to="/materials"
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>Material Quantity Estimator</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* 4. TESTIMONIALS SECTION (EMPTY per spec) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-3 bg-slate-900/30">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Client Feedback</span>
          <h3 className="text-xl font-bold text-slate-300">Customer Testimonials</h3>
          {/* Note in code: Add real customer testimonials here once verified reviews from Nashik clients are provided */}
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            We value authentic client relationships. Verified reviews from our Sinnar and Nashik civil engineering and residential solar clients will be published here.
          </p>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-500">Answers to Common Questions</span>
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-semibold text-white hover:text-amber-400 transition"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-5 h-5 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 flex-shrink-0 text-slate-500" />}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
