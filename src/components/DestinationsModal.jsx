import React from 'react';
import { X, Globe2, Compass, MapPin, ChevronRight } from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';
import { soundEngine } from '../utils/audio';

export default function DestinationsModal({ isOpen, onClose, onSelectDestination }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl glass-panel border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 sm:px-8 py-5 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-sky-400">
                Curated Expeditions
              </span>
              <h2 className="font-heading font-black text-xl text-white">
                DESERT & SALT FLAT EXPEDITIONS
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playModalClose();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-4">
          {DESTINATIONS.map((dest) => {
            const isFeatured = dest.id === 'rann-of-kutch';

            return (
              <div
                key={dest.id}
                onClick={() => {
                  soundEngine.playClick();
                  onSelectDestination(dest);
                  onClose();
                }}
                className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  isFeatured
                    ? 'bg-sky-950/60 border border-sky-400/50 shadow-xl shadow-sky-500/15'
                    : 'bg-white/5 border border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] uppercase font-semibold text-sky-400 tracking-wider">
                      {dest.region}
                    </span>
                    {isFeatured && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-bold bg-sky-400/20 text-sky-300 border border-sky-400/40">
                        Primary 3D Showcase
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading font-extrabold text-lg text-white group-hover:text-sky-300 transition-colors">
                    {dest.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-light mt-1 max-w-xl">
                    {dest.tagline}
                  </p>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Coordinates</p>
                    <p className="text-xs font-semibold text-sky-300">{dest.coordinates.label}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-sky-400 group-hover:text-slate-950 text-white flex items-center justify-center transition-all">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

