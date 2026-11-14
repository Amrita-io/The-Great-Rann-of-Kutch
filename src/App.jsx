import React, { useState } from 'react';
import Globe3D from './components/Globe3D';
import DestinationView from './components/DestinationView';
import SoundControl from './components/SoundControl';
import ItineraryModal from './components/ItineraryModal';
import BookingModal from './components/BookingModal';
import DestinationsModal from './components/DestinationsModal';
import { DESTINATIONS } from './data/destinations';
import { soundEngine } from './utils/audio';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#030611] text-white font-mono text-center">
          <div className="max-w-md p-6 rounded-2xl bg-stone-950/90 border border-amber-300/30 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-amber-300 uppercase tracking-widest font-mono">Observatory Initializing</h2>
            <p className="text-xs text-stone-300">{this.state.error?.message || "An unexpected state was encountered."}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 border border-amber-300/50 text-stone-100 hover:text-amber-100 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.2)]"
            >
              RELOAD EXPEDITION
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('view') || 'globe';
    }
    return 'globe';
  }); // 'globe' | 'destination'

  const [activeDestination, setActiveDestination] = useState(DESTINATIONS[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  // Modals state
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);

  // Triggered when camera zoom completes into Rann of Kutch
  const handleSelectDestination = (dest) => {
    setActiveDestination(dest);
    setIsTransitioning(false);
    setIsReturning(false);
    setViewMode('destination');
    soundEngine.setMode('destination');
  };

  const handleBackToOrbit = () => {
    setIsReturning(true);
    setViewMode('globe');
    soundEngine.setMode('globe');
    soundEngine.playReturnSound();
    setTimeout(() => setIsReturning(false), 2200);
  };

  // Sound coordination
  React.useEffect(() => {
    if (viewMode === 'destination') {
      soundEngine.silenceAllBackgroundMusic();
    } else if (viewMode === 'globe') {
      soundEngine.setMode('globe');
      soundEngine.playOrbitMusic(0.25);
    }
  }, [viewMode]);

  // Keyboard navigation & accessibility
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (itineraryOpen) setItineraryOpen(false);
        else if (bookingOpen) setBookingOpen(false);
        else if (destinationsOpen) setDestinationsOpen(false);
        else if (viewMode === 'destination') handleBackToOrbit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itineraryOpen, bookingOpen, destinationsOpen, viewMode]);

  return (
    <div className={`relative w-full min-h-screen bg-[#030408] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 ${viewMode === 'globe' ? 'overflow-hidden' : 'overflow-x-hidden'}`}>
      {/* Main View Router */}
      <main className="w-full h-full">
        {viewMode === 'globe' ? (
          <ErrorBoundary>
            <Globe3D
              onSelectDestination={handleSelectDestination}
              isTransitioning={isTransitioning}
              setIsTransitioning={setIsTransitioning}
              isReturning={isReturning}
            />
          </ErrorBoundary>
        ) : (
          <ErrorBoundary>
            <DestinationView
              destination={activeDestination}
              onBackToOrbit={handleBackToOrbit}
              onOpenItinerary={() => setItineraryOpen(true)}
              onOpenBooking={() => setBookingOpen(true)}
            />
          </ErrorBoundary>
        )}
      </main>

      {/* Floating Sound Toggle Control (Only rendered in Globe view; settled in the footer in Destination view) */}
      {viewMode === 'globe' && <SoundControl />}

      {/* Modals & Slide-out Drawers */}
      <ItineraryModal
        isOpen={itineraryOpen}
        onClose={() => setItineraryOpen(false)}
        destination={activeDestination}
        onBookNow={() => setBookingOpen(true)}
      />

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        destination={activeDestination}
      />

      <DestinationsModal
        isOpen={destinationsOpen}
        onClose={() => setDestinationsOpen(false)}
        onSelectDestination={(dest) => {
          setActiveDestination(dest);
          if (dest.id === 'rann-of-kutch') {
            setViewMode('destination');
          }
        }}
      />
    </div>
  );
}

