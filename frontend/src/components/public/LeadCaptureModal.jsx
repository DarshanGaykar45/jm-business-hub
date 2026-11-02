import React, { useState, useEffect } from 'react';
import { X, Send, Phone, User, Mail, Clock, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../Toast';

export default function LeadCaptureModal({ isOpen, onClose, initialDivision = 'construction', title, defaultRequirement = '' }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    division: initialDivision,
    requirement: defaultRequirement,
    preferredTime: 'Morning (9 AM - 12 PM)',
    source: 'Public Website Modal'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        division: initialDivision || 'construction',
        requirement: defaultRequirement || prev.requirement
      }));
      setSubmitted(false);
      setErrorMsg('');
    }
  }, [isOpen, initialDivision, defaultRequirement]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Indian 10-digit validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9822000000)');
      return;
    }

    if (!formData.requirement || formData.requirement.trim().length < 3) {
      setErrorMsg('Please enter your project or equipment requirements');
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
        toast.success('Thank you! Your inquiry has been dispatched to our team.');
        setTimeout(() => {
          onClose();
        }, 2200);
      }
    } catch (err) {
      console.error('Lead submission failed:', err);
      const msg = err.response?.data?.message || 'Could not submit your inquiry. Please call or WhatsApp us directly.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Strip */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-500">Jay Malhar Udyog Samuha</span>
            <h3 className="text-lg font-bold text-white">{title || 'Instant Quotation & Inquiry'}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-4 animate-scaleUp">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-white">Inquiry Received!</h4>
              <p className="text-sm text-slate-300 max-w-sm mx-auto">
                Thank you, <span className="font-semibold text-white">{formData.name}</span>. Our representative for{' '}
                <span className="text-amber-400 capitalize">{formData.division}</span> will contact you at{' '}
                <span className="font-semibold text-white">{formData.phone}</span> shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="flex items-start gap-2 p-3 text-xs bg-red-950/50 border border-red-800 text-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Division Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Business Division</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'construction', label: 'Equipment' },
                    { key: 'solar', label: 'Solar' },
                    { key: 'suppliers', label: 'Materials' }
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

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Your Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Santosh Shinde"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number (10-Digit) *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9822000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none transition font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Preferred Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Preferred Callback Time</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none transition"
                    >
                      <option>Morning (9 AM - 12 PM)</option>
                      <option>Afternoon (12 PM - 4 PM)</option>
                      <option>Evening (4 PM - 8 PM)</option>
                      <option>Anytime / Urgent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Requirement */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Requirement Details *</label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Need Tamping Rammer TR-001 for 3 days at Sinnar construction site"
                    value={formData.requirement}
                    onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none transition resize-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting Inquiry...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
