import React, { useState } from 'react';
import { Compass, Volume2, VolumeX, Menu, X, ArrowLeft, Sparkles, MapPin } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export default function Header({
  viewMode,
  onBackToOrbit,
  onOpenCulture,
  onOpenDestinations,
  onOpenBooking,
  activeDestination
}) {
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAudioToggle = () => {
    const active = soundEngine.toggleMute();
    setIsAudioActive(active);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3.5 rounded-2xl glass-panel shadow-2xl backdrop-blur-xl border border-white/10">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={viewMode === 'destination' ? onBackToOrbit : undefined}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-400/30 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform duration-300">
            <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-heading font-black text-xl tracking-[0.22em] text-white">
                TRAVELO
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            </div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-amber-200/60 font-medium">
              3D Expedition Explorer
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {viewMode === 'destination' ? (
            <button
              onClick={onBackToOrbit}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs uppercase tracking-widest text-amber-300 bg-amber-500/10 border border-amber-400/20 hover:bg-amber-500/20 transition-all duration-200 group mr-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Orbit</span>
            </button>
          ) : (
            <button
              onClick={() => {
                const el = document.getElementById('globe-container');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl text-xs uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              Explore
            </button>
          )}

          <button
            onClick={onOpenDestinations}
            className="px-4 py-2 rounded-xl text-xs uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            Destinations
          </button>

          <button
            onClick={onOpenCulture}
            className="px-4 py-2 rounded-xl text-xs uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            Culture
          </button>

          <button
            onClick={onOpenBooking}
            className="ml-2 flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Book Visit</span>
          </button>
        </nav>

        {/* Right utility actions (Audio & Mobile Toggle) */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAudioToggle}
            title={isAudioActive ? 'Mute ambient desert winds' : 'Play ambient desert winds'}
            className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center space-x-2 ${
              isAudioActive
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {isAudioActive ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4" />}
            {isAudioActive && (
              <div className="flex items-end space-x-0.5 h-3">
                <span className="w-0.5 h-full bg-amber-400 animate-pulse rounded-full" style={{ animationDuration: '0.6s' }}></span>
                <span className="w-0.5 h-2/3 bg-amber-300 animate-pulse rounded-full" style={{ animationDuration: '0.4s' }}></span>
                <span className="w-0.5 h-full bg-amber-400 animate-pulse rounded-full" style={{ animationDuration: '0.8s' }}></span>
              </div>
            )}
            <span className="hidden sm:inline text-[11px] tracking-wider uppercase font-medium">
              {isAudioActive ? 'Sound On' : 'Ambience'}
            </span>
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 mx-auto max-w-7xl px-6 py-5 rounded-2xl glass-panel border border-white/10 flex flex-col space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          {viewMode === 'destination' && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBackToOrbit();
              }}
              className="flex items-center space-x-2 text-left px-3 py-2 text-sm text-amber-400 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to 3D Globe Orbit</span>
            </button>
          )}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDestinations();
            }}
            className="text-left px-3 py-2 text-sm text-slate-200 hover:text-white"
          >
            Explore Destinations
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCulture();
            }}
            className="text-left px-3 py-2 text-sm text-slate-200 hover:text-white"
          >
            Kutchi Culture & Traditions
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenBooking();
            }}
            className="w-full text-center py-2.5 px-4 rounded-xl text-xs uppercase tracking-widest font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 shadow-md shadow-amber-500/20"
          >
            Book Visit
          </button>
        </div>
      )}
    </header>
  );
}

