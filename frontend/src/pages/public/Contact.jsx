import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { COMPANY_CONFIG } from '../../config/company.config';
import { MEDIA } from '../../theme/media';
import { useToast } from '../../components/Toast';

export default function Contact() {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    division: 'construction',
    requirement: '',
    preferredTime: 'Morning (9 AM - 12 PM)',
    source: 'Contact Page Form'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const visitingCards = MEDIA.visitingCard;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/public/leads', {
        ...formData,
        phone: formData.phone.trim()
      });

      if (res.data.success) {
        setSubmitted(true);
        toast.success('Your message has been received! Our team will call you shortly.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      const msg = err.response?.data?.message || 'Could not send message. Please call or WhatsApp us directly.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const constructionDiv = COMPANY_CONFIG.divisions.find(d => d.key === 'construction');
  const solarDiv = COMPANY_CONFIG.divisions.find(d => d.key === 'solar');

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-500">Direct Inquiries & Bookings</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Contact Our Team</h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Reach out for machine bookings, solar subsidy assessments, or quarry material dispatch across Sinnar and Nashik.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">Send Direct Inquiry</h3>
            <p className="text-xs text-slate-400">All submissions are instantly recorded in our management portal for rapid callback.</p>
          </div>

          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-white">Message Dispatched!</h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Thank you, {formData.name}. Our representative for <span className="text-amber-400 capitalize">{formData.division}</span> will contact you at {formData.phone} shortly.
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ ...formData, requirement: '' }); }}
                className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="flex items-start gap-2 p-3 text-xs bg-red-950/50 border border-red-800 text-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Business Division</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'construction', label: 'Equipment Rental' },
                    { key: 'solar', label: 'Sundatta Solar' },
                    { key: 'suppliers', label: 'Stone & Sand' }
                  ].map(d => (
                    <button
                      type="button"
                      key={d.key}
                      onClick={() => setFormData({ ...formData, division: d.key })}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition ${
                        formData.division === d.key
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kadam"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Phone (10-Digit Mobile) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9822000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Requirement / Site Details *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Specify equipment needed, location, duration, or material tonnage..."
                  value={formData.requirement}
                  onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95 text-sm"
              >
                {submitting ? <span>Processing...</span> : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message to Team</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Digital Visiting Card & Direct Numbers */}
        <div className="space-y-8 flex flex-col justify-between">
          {/* Visiting Card 1: Jay Malhar Construction */}
          <div className="bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-amber-400">॥ ॐ साई राम ॥</span>
              <span className="text-xs px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-bold">Visiting Card 1</span>
            </div>
            <h4 className="text-2xl font-black text-white">{visitingCards.construction.name}</h4>
            <p className="text-xs text-amber-300/90 mt-1 font-medium">{visitingCards.construction.description}</p>
            <div className="mt-4 pt-4 border-t border-amber-500/20 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono font-bold text-white">
                  {visitingCards.construction.phone1} / {visitingCards.construction.phone2}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{visitingCards.construction.location}</span>
              </div>
            </div>
          </div>

          {/* Visiting Card 2: Sundatta Renewables */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-emerald-400">PM Surya Ghar Approved</span>
              <span className="text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold">Visiting Card 2</span>
            </div>
            <h4 className="text-2xl font-black text-white">{visitingCards.solar.name}</h4>
            <p className="text-xs text-emerald-300 font-semibold mt-1">"{visitingCards.solar.tagline}"</p>
            <div className="mt-4 pt-4 border-t border-emerald-500/20 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono font-bold text-white">
                  {visitingCards.solar.phone1} / {visitingCards.solar.phone2}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{visitingCards.solar.location}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Action */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <h5 className="font-bold text-white text-sm">Instant WhatsApp Assistance</h5>
              <p className="text-xs text-slate-400">Connect with Abhishek Satav on WhatsApp directly.</p>
            </div>
            <a
              href={`https://wa.me/91${COMPANY_CONFIG.primaryWhatsapp}?text=Hello%20Jay%20Malhar,%20I%20have%20an%20urgent%20inquiry.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message Now</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
