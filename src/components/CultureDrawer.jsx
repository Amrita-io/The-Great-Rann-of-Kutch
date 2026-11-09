import React from 'react';
import { X, Sparkles, Heart, Music, Palette, Utensils, Feather } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export default function CultureDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleClose = () => {
    soundEngine.playModalClose();
    onClose();
  };

  const culturalPillars = [
    {
      icon: Palette,
      title: 'Rogan Art Heritage',
      tag: 'Nirona Village Guild',
      desc: 'An ancient 400-year-old art form practiced by the Khatri family, utilizing castor seed oil boiled into a thick paste and blended with natural mineral pigments. The artisan paints intricate motifs onto fabric using a fine metal stylus without touching the cloth.'
    },
    {
      icon: Feather,
      title: 'Kutchi Mirror Work & Bandhani',
      tag: 'Nomadic Embroidery',
      desc: 'Handcrafted by women of the Rabari, Ahir, and Mutwa tribes. Intricate geometric stitch-work embellished with reflective mirrors (Abhla) protects against desert glare and evil eyes while telling ancestral stories.'
    },
    {
      icon: Music,
      title: 'Sufi & Folk Harmonies',
      tag: 'Desert Acoustics',
      desc: 'The nocturnal desert comes alive with the haunting melodies of the Jodiya Pawa (double flute), Morchang, and Surando, singing ballads of mystic Sufi poet Shah Abdul Latif Bhittai under starlit skies.'
    },
    {
      icon: Utensils,
      title: 'Traditional Kutchi Gastronomy',
      tag: 'Desert Nourishment',
      desc: 'Wood-fired Bajra Rotla with homemade white butter (Makhan), smoked eggplant bharta (Ringna no Olo), sweet Gulab Pak, spicy garlic chutney, and refreshing buttermilk (Chaas) crafted to thrive in desert climates.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl h-full bg-[#05070a] border-l border-white/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <span className="text-[9.5px] uppercase font-sans tracking-[0.28em] text-white/50 block mb-1">
                Heritage & Traditions
              </span>
              <h2 className="font-['Cinzel',serif] text-xl sm:text-2xl text-white font-medium tracking-[0.08em]">
                THE SOUL OF KUTCH
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-300/80 mt-5 mb-7 leading-relaxed font-light">
            Beyond the white horizon lies one of India’s most resilient and artistic civilizational cradles. From nomadic Rabari pastoralists to world-renowned textile guilds, Kutch pulses with color, music, and centuries of preserved craft.
          </p>

          {/* Pillars List */}
          <div className="space-y-4">
            {culturalPillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/30 hover:bg-white/[0.05] transition-all group"
                >
                  <div className="flex items-center space-x-3 mb-2.5">
                    <div className="p-2 rounded-xl bg-white/[0.06] border border-white/10 text-white/80 group-hover:text-white transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.24em] text-white/50 font-sans block">
                        {p.tag}
                      </span>
                      <h3 className="font-['Cinzel',serif] text-sm sm:text-base text-white font-medium">
                        {p.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-light pl-1">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-light">
            Experiences include guided masterclasses with national awardee artisans.
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2.5 rounded-full bg-white/[0.10] hover:bg-white/[0.20] border border-white/25 text-white font-sans text-[10px] uppercase tracking-[0.25em] font-medium transition-all shadow-lg cursor-pointer flex-shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

