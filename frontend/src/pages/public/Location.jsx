import React from 'react';
import { MapPin, Navigation, Phone, Clock, ExternalLink } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/company.config';

export default function Location() {
  const mapAddress = encodeURIComponent(COMPANY_CONFIG.address);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapAddress}`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapAddress}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-500">Find Our Operating Hub</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Office & Yard Location</h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Centrally situated in Sinnar taluka of Nashik district to facilitate swift machinery dispatch and client visits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Location Details Card */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Central Operations Yard</h3>
              <p className="text-xs text-amber-400">Jay Malhar Udyog Samuha</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <div>
              <span className="text-xs text-slate-500 block">Complete Address</span>
              <p className="font-semibold text-white mt-0.5">{COMPANY_CONFIG.address}</p>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Service Coverage Radius</span>
              <p className="font-medium text-slate-300 mt-0.5">
                Sinnar, Pathre Budruk, Sangamner, Niphad, Nashik City & Surrounding MIDC industrial belts.
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Operating Working Hours</span>
              <p className="font-medium text-slate-300 mt-0.5">
                Monday to Saturday: 8:00 AM – 8:00 PM <br />
                Sunday: On Call for Emergency Dispatches
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Direct Assistance</span>
              <p className="font-mono text-amber-400 font-bold mt-0.5">
                9096547260 / 9158494138
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
            >
              <Navigation className="w-4 h-4" />
              <span>Get GPS Directions</span>
            </a>
          </div>
        </div>

        {/* Google Map Embed */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-[480px] relative">
          <iframe
            title="Jay Malhar Location Map"
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full filter invert-[0.88] hue-rotate-[180deg] contrast-[1.2]"
          />
        </div>
      </div>
    </div>
  );
}
