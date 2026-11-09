import React, { useState } from 'react';
import Globe3D from './components/Globe3D';
import DestinationView from './components/DestinationView';
import SoundControl from './components/SoundControl';
import ItineraryModal from './components/ItineraryModal';
import BookingModal from './components/BookingModal';
import CultureDrawer from './components/CultureDrawer';
import DestinationsModal from './components/DestinationsModal';
import { DESTINATIONS } from './data/destinations';
import { soundEngine } from './utils/audio';

export default function App() {
  const [viewMode, setViewMode] = useState('globe'); // 'globe' | 'destination'
  const [activeDestination, setActiveDestination] = useState(DESTINATIONS[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  // Modals state
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [cultureOpen, setCultureOpen] = useState(false);
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

  // Keyboard navigation & accessibility
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (itineraryOpen) setItineraryOpen(false);
        else if (bookingOpen) setBookingOpen(false);
        else if (cultureOpen) setCultureOpen(false);
        else if (destinationsOpen) setDestinationsOpen(false);
        else if (viewMode === 'destination') handleBackToOrbit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itineraryOpen, bookingOpen, cultureOpen, destinationsOpen, viewMode]);

  return (
    <div className="relative w-full min-h-screen bg-[#030408] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 overflow-hidden">
      {/* Main View Router */}
      <main className="w-full h-full">
        {viewMode === 'globe' ? (
          <Globe3D
            onSelectDestination={handleSelectDestination}
            isTransitioning={isTransitioning}
            setIsTransitioning={setIsTransitioning}
            isReturning={isReturning}
          />
        ) : (
          <DestinationView
            destination={activeDestination}
            onBackToOrbit={handleBackToOrbit}
            onOpenItinerary={() => setItineraryOpen(true)}
            onOpenBooking={() => setBookingOpen(true)}
            onOpenCulture={() => setCultureOpen(true)}
          />
        )}
      </main>

      {/* Floating Sound Toggle Control (Sound ON by default, M to toggle) */}
      <SoundControl />

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

      <CultureDrawer
        isOpen={cultureOpen}
        onClose={() => setCultureOpen(false)}
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

