import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export default function SoundControl() {
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Subscribe to sound engine state changes
    const unsubscribe = soundEngine.subscribe((muted) => {
      setIsMuted(muted);
    });

    // Keyboard shortcut: Press 'M' to toggle sound anywhere
    const handleKeyDown = (e) => {
      // Don't toggle if user is typing inside an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (e.key === 'm' || e.key === 'M') {
        soundEngine.toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggle = () => {
    soundEngine.toggleMute();
  };

  return (
    <div
      className="fixed bottom-5 left-5 sm:bottom-7 sm:left-7 z-50 flex items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        @keyframes eq-bar-1 {
          0%, 100% { height: 30%; }
          50% { height: 85%; }
        }
        @keyframes eq-bar-2 {
          0%, 100% { height: 95%; }
          50% { height: 40%; }
        }
        @keyframes eq-bar-3 {
          0%, 100% { height: 55%; }
          50% { height: 100%; }
        }
        @keyframes eq-bar-4 {
          0%, 100% { height: 40%; }
          50% { height: 75%; }
        }
        .eq-anim-1 { animation: eq-bar-1 1.15s ease-in-out infinite; }
        .eq-anim-2 { animation: eq-bar-2 0.85s ease-in-out infinite; }
        .eq-anim-3 { animation: eq-bar-3 1.30s ease-in-out infinite; }
        .eq-anim-4 { animation: eq-bar-4 0.95s ease-in-out infinite; }
      `}</style>

      <button
        onClick={handleToggle}
        onMouseEnter={() => soundEngine.playHover()}
        aria-label={isMuted ? "Enable sound (Press M)" : "Mute sound (Press M)"}
        title={isMuted ? "Sound Disabled (Press M)" : "Sound Enabled (Press M)"}
        className={`group relative flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-300 backdrop-blur-2xl cursor-pointer ${
          isMuted
            ? 'bg-black/55 border-white/10 text-white/40 hover:text-white/80 hover:border-white/25 hover:bg-black/75 shadow-lg'
            : 'bg-black/60 border-white/18 text-white hover:border-white/45 hover:bg-black/80 shadow-[0_8px_32px_rgba(0,0,0,0.65)]'
        }`}
      >
        {/* Minimalist 4-Bar Hi-Fi Audio Equalizer */}
        {!isMuted ? (
          <div className="flex items-end justify-center gap-[2.5px] h-3.5 w-3.5 pb-0.5">
            <span className="w-[1.5px] bg-white rounded-full eq-anim-1" />
            <span className="w-[1.5px] bg-white rounded-full eq-anim-2" />
            <span className="w-[1.5px] bg-white rounded-full eq-anim-3" />
            <span className="w-[1.5px] bg-white rounded-full eq-anim-4" />
          </div>
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
        )}

        {/* Crisp Architectural Typography */}
        <span className="text-[9.5px] font-sans tracking-[0.26em] uppercase font-medium text-white/85 group-hover:text-white transition-colors">
          {isMuted ? 'Muted' : 'Sound'}
        </span>

        {/* Minimalist Keyboard Shortcut Pill */}
        <span className="text-[8px] font-mono text-white/40 px-1.5 py-0.5 rounded border border-white/10 group-hover:text-white/70 group-hover:border-white/25 transition-colors uppercase">
          M
        </span>
      </button>

      {/* Floating Micro Tooltip on Hover */}
      <div
        className={`absolute bottom-full left-0 mb-2.5 whitespace-nowrap pointer-events-none transition-all duration-200 ease-out ${
          isHovered
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-1'
        }`}
      >
        <div className="px-3 py-1 rounded-full bg-black/90 border border-white/15 backdrop-blur-2xl text-[9px] tracking-[0.22em] font-sans text-white/80 uppercase shadow-2xl">
          {isMuted ? 'Click or Press M to Play' : 'Click or Press M to Mute'}
        </div>
      </div>
    </div>
  );
}

