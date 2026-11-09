import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle, Compass, Sparkles, Luggage, Coffee } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export default function ItineraryModal({ isOpen, onClose, destination, onBookNow }) {
  if (!isOpen || !destination) return null;

  const [activeDay, setActiveDay] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#05070a]/95 border border-white/15 shadow-2xl overflow-hidden backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 sm:px-8 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-0.5">
                <span className="text-[9.5px] uppercase font-sans tracking-[0.25em] text-white/50">
                  Curated Expedition
                </span>
                <span className="w-1 h-1 rounded-full bg-white/30"></span>
                <span className="text-[11px] text-slate-400 font-sans">3 Days / 2 Nights</span>
              </div>
              <h2 className="font-['Cinzel',serif] text-lg sm:text-xl text-white font-medium tracking-wide">
                THE WHITE DESERT EXPEDITION
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

        {/* Content Body with Days Navigation */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          
          {/* Day Tabs */}
          <div className="flex space-x-2 border-b border-white/10 pb-4 mb-6">
            {destination.itinerary.map((item, idx) => (
              <button
                key={item.day}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveDay(idx);
                }}
                className={`flex-1 py-3 px-4 rounded-2xl text-left transition-all cursor-pointer ${
                  activeDay === idx
                    ? 'bg-white/[0.10] border border-white/35 text-white shadow-lg'
                    : 'bg-white/[0.02] border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }`}
              >
                <p className="text-[9px] font-sans uppercase tracking-[0.22em] text-white/50 mb-0.5">
                  {item.day}
                </p>
                <p className="font-['Cinzel',serif] text-xs sm:text-sm text-white font-medium truncate">
                  {item.title}
                </p>
              </button>
            ))}
          </div>

          {/* Active Day Detail */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-full text-[9px] bg-white/[0.06] text-white/70 font-sans tracking-widest uppercase border border-white/15">
                  {destination.itinerary[activeDay].day} Schedule
                </span>
              </div>
              <h3 className="font-['Cinzel',serif] text-lg sm:text-xl text-white font-medium">
                {destination.itinerary[activeDay].title}
              </h3>
            </div>

            {/* Activities Timeline */}
            <div className="space-y-3.5">
              {destination.itinerary[activeDay].activities.map((act, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all"
                >
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-white/[0.08] text-white/90 border border-white/15 flex items-center justify-center flex-shrink-0 text-xs font-mono font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-light">
                    {act}
                  </p>
                </div>
              ))}
            </div>

            {/* Travel Essentials Pill Box */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-2 rounded-xl bg-white/[0.06] border border-white/10 text-white/70">
                  <Luggage className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-white tracking-wide uppercase font-sans">Desert Essentials</p>
                  <p className="text-[11px] text-slate-400 font-light">Warm winter fleece for night chill, polarized sunglasses for daytime salt glare.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                  onBookNow();
                }}
                className="px-6 py-2.5 rounded-full bg-white/[0.12] hover:bg-white/[0.22] border border-white/30 text-white font-sans text-[10px] uppercase tracking-[0.25em] font-medium transition-all flex items-center justify-center space-x-1.5 flex-shrink-0 cursor-pointer shadow-lg"
              >
                <span>Reserve Itinerary</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 sm:px-8 py-4 border-t border-white/10 bg-black/60 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-light">
            Guided by certified local Kutchi naturalists & historians.
          </div>
          <button
            onClick={() => {
              soundEngine.playModalClose();
              onClose();
            }}
            className="px-5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/15 text-white/80 text-[10px] uppercase tracking-widest font-sans transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

