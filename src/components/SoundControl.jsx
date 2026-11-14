import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export default function SoundControl() {
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);
  const [currentMode, setCurrentMode] = useState(soundEngine.mode);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState('Breath of the High Plateau');

  useEffect(() => {
    const checkPlaying = () => {
      const isOrbit = !!(soundEngine.orbitAudio && !soundEngine.orbitAudio.paused && !soundEngine.orbitAudio.muted);
      const isRann = !!(soundEngine.rannAudio && !soundEngine.rannAudio.paused && !soundEngine.rannAudio.muted);
      const isSalt = !!(soundEngine.saltMirrorAudio && !soundEngine.saltMirrorAudio.paused && !soundEngine.saltMirrorAudio.muted);
      setIsPlaying(isOrbit || isRann || isSalt);
      setCurrentMode(soundEngine.mode);

      // Track display based on active mode
      if (soundEngine.mode === 'destination') {
        setActiveTrack('Breath of the Rann (5 Acts Diorama)');
      } else if (soundEngine.mode === 'nisar') {
        setActiveTrack('The Vast Salt Mirror (Act 1 Radar)');
      } else {
        setActiveTrack('Breath of the High Plateau (Orbital View)');
      }
    };

    checkPlaying();
    const interval = setInterval(checkPlaying, 250);

    // Subscribe to sound engine state changes
    const unsubscribe = soundEngine.subscribe((muted) => {
      setIsMuted(muted);
      setCurrentMode(soundEngine.mode);
      checkPlaying();
    });

    // Keyboard shortcut: Press 'M' to toggle sound anywhere
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (e.key === 'm' || e.key === 'M') {
        soundEngine.toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(interval);
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // When inside the NISAR showcase view, the sound toggle is cleanly docked inside the footer bar
  const inNisarView = currentMode === 'nisar' || soundEngine.mode === 'nisar' || (typeof document !== 'undefined' && !!document.querySelector('[data-nisar-showcase]'));
  if (inNisarView) {
    return null;
  }

  const handleToggle = () => {
    soundEngine.playClick();
    soundEngine.toggleMute();
    if (!soundEngine.isMuted) {
      if (soundEngine.mode === 'globe') {
        soundEngine.playOrbitMusic(0.25);
      } else if (soundEngine.mode === 'destination') {
        soundEngine.playBreathOfTheRann(0.22);
      }
    }
  };

  return (
    <div
      className="fixed bottom-5 left-5 sm:bottom-7 sm:left-7 z-50 flex items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        @keyframes lux-eq-1 {
          0%, 100% { height: 4px; }
          50% { height: 13px; }
        }
        @keyframes lux-eq-2 {
          0%, 100% { height: 14px; }
          50% { height: 5px; }
        }
        @keyframes lux-eq-3 {
          0%, 100% { height: 7px; }
          50% { height: 15px; }
        }
        @keyframes lux-eq-4 {
          0%, 100% { height: 11px; }
          50% { height: 4px; }
        }
        .lux-bar-1 { animation: lux-eq-1 0.95s ease-in-out infinite; }
        .lux-bar-2 { animation: lux-eq-2 0.70s ease-in-out infinite; }
        .lux-bar-3 { animation: lux-eq-3 1.15s ease-in-out infinite; }
        .lux-bar-4 { animation: lux-eq-4 0.80s ease-in-out infinite; }

        @keyframes sound-subtle-glow {
          0%, 100% {
            border-color: rgba(229, 192, 123, 0.35);
            box-shadow: 0 0 14px rgba(229, 192, 123, 0.20), inset 0 1px 1px rgba(255, 255, 255, 0.2);
          }
          50% {
            border-color: rgba(229, 192, 123, 0.75);
            box-shadow: 0 0 24px rgba(229, 192, 123, 0.40), inset 0 1px 2px rgba(255, 255, 255, 0.4);
          }
        }
        .sound-subtle-pulse {
          animation: sound-subtle-glow 2.4s ease-in-out infinite;
        }
      `}</style>

      {/* Main Luxury Sound Capsule Button */}
      <button
        onClick={handleToggle}
        onMouseEnter={() => soundEngine.playHover()}
        aria-label={isMuted ? "Enable sound (Press M)" : "Mute sound (Press M)"}
        title={isMuted ? "Sound Disabled (Press M)" : "Sound Enabled (Press M)"}
        className={`group relative flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-300 backdrop-blur-2xl cursor-pointer ${
          isMuted
            ? 'bg-stone-950/70 border-white/10 text-stone-400 hover:text-stone-200 hover:border-white/25 hover:bg-stone-900/85 shadow-lg'
            : !isPlaying
            ? 'bg-stone-950/85 border-amber-300/50 text-amber-200 sound-subtle-pulse shadow-[0_4px_24px_rgba(0,0,0,0.7)]'
            : 'bg-stone-950/90 border-amber-300/40 hover:border-amber-300 text-stone-100 hover:bg-stone-900 shadow-[0_12px_36px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.18)]'
        }`}
      >
        {/* Visualizer Icon Section */}
        {!isMuted && isPlaying ? (
          <div className="flex items-end justify-center gap-[2.5px] h-3.5 w-3.5 pb-0.5" aria-hidden="true">
            <span className="w-[1.5px] bg-amber-300 rounded-full lux-bar-1" />
            <span className="w-[1.5px] bg-amber-300 rounded-full lux-bar-2" />
            <span className="w-[1.5px] bg-amber-300 rounded-full lux-bar-3" />
            <span className="w-[1.5px] bg-amber-300 rounded-full lux-bar-4" />
          </div>
        ) : !isMuted ? (
          <div className="relative flex items-center justify-center w-3.5 h-3.5">
            <Volume2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="absolute -inset-1 rounded-full border border-amber-400/30 animate-ping" />
          </div>
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-200 transition-colors" />
        )}

        {/* Crisp Architectural Typography */}
        <span className={`text-[9.5px] font-sans tracking-[0.26em] uppercase font-medium transition-colors ${
          isMuted 
            ? 'text-stone-400 group-hover:text-stone-200' 
            : !isPlaying 
            ? 'text-amber-200 font-semibold' 
            : 'text-stone-200 group-hover:text-amber-100'
        }`}>
          {isMuted ? 'Muted' : !isPlaying ? 'Play Sound' : 'Sound'}
        </span>

        {/* Machined Aluminum Keycap Shortcut Pill */}
        <span className="text-[8px] font-mono text-stone-400 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/12 group-hover:text-amber-200 group-hover:border-amber-300/40 transition-all uppercase">
          M
        </span>
      </button>

      {/* Floating Micro Dossier Tooltip on Hover */}
      <div
        className={`absolute bottom-full left-0 mb-3 whitespace-nowrap pointer-events-none transition-all duration-200 ease-out z-50 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        }`}
      >
        <div className="px-3.5 py-2 rounded-xl bg-stone-950/95 border border-amber-300/20 backdrop-blur-2xl text-[9px] font-mono tracking-wider shadow-2xl flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2 text-amber-300 font-bold uppercase">
            <Radio className="w-2.5 h-2.5 animate-pulse text-amber-400" />
            <span>{isMuted ? 'AUDIO MUTED' : isPlaying ? 'ACTIVE SOUNDSCAPE' : 'AWAITING ACTIVATION'}</span>
          </div>
          <div className="text-stone-200 font-sans text-[10px]">
            {activeTrack}
          </div>
          <div className="text-stone-400 text-[8px] pt-1 border-t border-white/10">
            Press <span className="text-stone-200 font-bold">M</span> or click pill to toggle sound
          </div>
        </div>
      </div>
    </div>
  );
}
