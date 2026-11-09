import React, { useState } from 'react';
import { X, Sparkles, Check, CheckCircle2, Calendar, Users, Shield, CreditCard } from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';
import { soundEngine } from '../utils/audio';

export default function BookingModal({ isOpen, onClose, destination = DESTINATIONS[0] }) {
  if (!isOpen) return null;

  const packages = destination.packages || [];
  const [selectedTier, setSelectedTier] = useState(0);
  const [guests, setGuests] = useState(2);
  const [checkInDate, setCheckInDate] = useState('2026-12-15');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    requests: ''
  });

  const currentPkg = packages[selectedTier] || {
    tier: 'Royal Suite',
    priceINR: '₹ 38,000',
    priceUSD: '$ 450'
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    soundEngine.playChime(659.25, 'triangle', 1.0);
    setIsConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#05070a]/95 border border-white/15 shadow-2xl overflow-hidden backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-sans tracking-[0.25em] text-white/50 block mb-0.5">
                Reserve Experience
              </span>
              <h2 className="font-['Cinzel',serif] text-lg sm:text-xl text-white font-medium tracking-wide">
                GREAT RANN LUXURY EXPEDITION
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playModalClose();
              onClose();
            }}
            className="p-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {isConfirmed ? (
            <div className="py-8 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-white/[0.08] border border-white/20 text-white flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-['Cinzel',serif] text-2xl text-white mb-2 font-medium">
                RESERVATION CONFIRMED
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto mb-6 font-light leading-relaxed">
                Your reservation for the <strong className="text-white font-medium">{currentPkg.tier}</strong> at Dhordo, Great Rann of Kutch has been recorded. Our travel concierge will reach out to {formData.email || 'your email'} with your entry permits and itinerary dossier.
              </p>
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left text-xs space-y-2 w-full max-w-sm mb-6">
                <div className="flex justify-between text-slate-400">
                  <span>Destination:</span>
                  <span className="text-white font-medium">Great Rann of Kutch</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Expedition Date:</span>
                  <span className="text-white font-medium">{checkInDate}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Guests:</span>
                  <span className="text-white font-medium">{guests} Adults</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-white/10">
                  <span>Total Tier Package:</span>
                  <span className="text-white font-semibold">{currentPkg.priceINR}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEngine.playModalClose();
                  onClose();
                }}
                className="px-8 py-3 rounded-full bg-white/[0.12] hover:bg-white/[0.22] border border-white/30 text-white font-sans text-[10px] uppercase tracking-[0.25em] font-medium transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleConfirm} className="space-y-6">
              {/* Package Tiers */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-sans font-medium mb-3">
                  Select Accommodation Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {packages.map((pkg, idx) => (
                    <button
                      key={pkg.tier}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedTier(idx);
                      }}
                      className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                        selectedTier === idx
                          ? 'bg-white/[0.12] border-white/40 shadow-lg text-white'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-slate-300'
                      }`}
                    >
                      <p className="text-[9px] uppercase font-sans tracking-widest text-white/50 mb-1">
                        {pkg.nights}
                      </p>
                      <h4 className="font-['Cinzel',serif] font-medium text-sm text-white mb-1.5">
                        {pkg.tier}
                      </h4>
                      <p className="text-xs font-semibold text-white/90">
                        {pkg.priceINR}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Guests Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-sans font-medium mb-2">
                    Expedition Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-white/40"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-sans font-medium mb-2">
                    Number of Guests
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setGuests(Math.max(1, guests - 1));
                      }}
                      className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/15 text-white font-medium flex items-center justify-center hover:bg-white/[0.10] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-sans text-xs text-white">
                      {guests} Guests
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setGuests(Math.min(10, guests + 1));
                      }}
                      className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/15 text-white font-medium flex items-center justify-center hover:bg-white/[0.10] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Guest Details */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-sans font-medium">
                  Primary Traveler Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-white/40"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              {/* Summary and Perks */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/12 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-white/80 font-medium">
                  <Shield className="w-4 h-4" />
                  <span>Complimentary Full Moon Salt Pass & Camel Safari Included</span>
                </div>
                <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                  Includes government border permits, Dhordo tent city hospitality, local folk performances, and round-trip transfers from Bhuj.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-white/[0.12] hover:bg-white/[0.22] border border-white/30 text-white font-sans font-medium text-[11px] uppercase tracking-[0.25em] shadow-xl hover:shadow-[0_0_24px_rgba(255,255,255,0.2)] transition-all cursor-pointer"
              >
                Confirm Expedition Reservation • {currentPkg.priceINR}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

