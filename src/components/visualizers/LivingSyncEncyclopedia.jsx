import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  Compass,
  Leaf,
  Shield,
  Sparkles,
  AlertTriangle,
  Heart,
  Droplets,
  Eye,
  CheckCircle2,
  X,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';

/**
 * LivingSyncEncyclopedia (Interactive Pictorial Field Guide & Human-Nature Sync)
 * 
 * Explains the deep, millennium-old ecological harmony of the Banni Savanna & Great Rann:
 * - 01. Indigenous Sweet Grasses (Savanna Flora)
 * - 02. Maldhari Pastoralists (Nomadic Herdsmen & Bhunga Architecture)
 * - 03. The Nocturnal Banni Buffalo (Kundi Breed)
 * - 04. Flamingo City & Protective Water Moats (Avian Sanctuary)
 * - 05. The Indian Wild Ass (Khur of the Salt Flats)
 * - 06. The Invasive Disruptor (Prosopis juliflora / Gando Baval)
 */
export default function LivingSyncEncyclopedia({ onClose }) {
  const [activeTab, setActiveTab] = useState('maldhari');

  const ENCYCLOPEDIA_ENTRIES = [
    {
      id: 'maldhari',
      category: 'HUMAN HARMONY',
      title: 'THE MALDHARI HERDSMEN',
      subtitle: 'The Custodians of Banni for Over 500 Years',
      icon: Users,
      accentColor: '#f59e0b',
      tag: 'CULTURAL CO-EXISTENCE',
      badge: '50,000+ HERD HEAD',
      heroImage: '/assets/kutch_loupe_bhunga.png',
      statLabel: 'Tradition Span',
      statValue: '15+ Generations',
      summary:
        'The Maldharis (from "Mal" meaning livestock, and "Dhari" meaning keeper) are nomadic pastoralist communities—primarily Rabari and Muslim Maldharis—who have lived in complete symbiosis with the Banni Grasslands for over five centuries.',
      syncPillars: [
        {
          heading: 'Bhungas: The Earthquake-Proof Mud Castles',
          detail:
            'Maldhari homes are circular earthen structures called Bhungas, crafted from local clay, cow dung, and straw, topped with conical thatch. In the devastating 2001 Gujarat 7.7 earthquake, modern concrete buildings flattened, but traditional Bhungas remained virtually undamaged due to their circular seismic dissipation.'
        },
        {
          heading: 'Common Pasture Custodianship',
          detail:
            'Without individual land deeds or fencing, Maldharis practice traditional rotational grazing across 2,500 km² of commons. When monsoon rains desalinate the soil, they guide their herds across traditional paths ("Vandhs"), ensuring no single patch is overgrazed.'
        },
        {
          heading: 'The Radar Connection',
          detail:
            'NISAR 24cm L-Band radar provides village panchayats with weekly subsoil moisture maps, eliminating guesswork about which migratory corridors have sprouted fresh palatable grass.'
        }
      ]
    },
    {
      id: 'buffalo',
      category: 'ADAPTIVE BIOLOGY',
      title: 'THE BANNI BUFFALO (KUNDI)',
      subtitle: 'India’s 11th Registered Breed & Nocturnal Wonder',
      icon: Heart,
      accentColor: '#10b981',
      tag: 'INDIGENOUS GENETICS',
      badge: 'GI-TAGGED LANDRACE',
      heroImage: '/assets/desert-aura.jpg',
      statLabel: 'Daily Grazing Pattern',
      statValue: 'Nighttime (Sunset to Dawn)',
      summary:
        'Bred over centuries by the Maldharis, the Banni Buffalo is globally famous for its supernatural resilience to arid heat and saline drinking water, producing up to 18 liters of high-fat milk per day on coarse native desert grasses.',
      syncPillars: [
        {
          heading: 'The Nocturnal Grazing Habit (Ratari)',
          detail:
            'To survive summer temperatures exceeding 48°C, Banni buffalo have evolved a miraculous behavioral rhythm: they leave the village unescorted at sunset, graze unattended in the cool darkness across 10–15 km of open savanna, and return to their specific owners’ Bhungas at sunrise on their own.'
        },
        {
          heading: 'Halophyte Digestion',
          detail:
            'Unlike European cattle that perish on saline forage, the Banni buffalo’s digestive biome easily metabolizes drought-hardy halophytic plants, transforming tough scrub into world-renowned dairy products (Kutch Mawa and ghee).'
        },
        {
          heading: 'The Radar Connection',
          detail:
            'NISAR’s HV cross-polarization measures biomass density (Mg/ha), helping communities protect the high-yield sweet grass meadows that fuel this ancient dairy economy.'
        }
      ]
    },
    {
      id: 'grasses',
      category: 'SAVANNA FLORA',
      title: 'THE 40 SWEET DESERT GRASSES',
      subtitle: 'One of Western India’s Largest Arid Grasslands (~2,618 km²)',
      icon: Leaf,
      accentColor: '#34d399',
      tag: 'ECOLOGICAL FOUNDATION',
      badge: '2,618 km² SAVANNA',
      heroImage: '/assets/layers/nisar_square_biomass_carbon.webp',
      statLabel: 'Germination Speed',
      statValue: '< 72 Hours Post-Rain',
      summary:
        'The Banni was originally formed by the alluvial silt of the Indus and Saraswati river systems. Beneath a saline surface lie dormant seed banks of over 40 species of nutritious indigenous grasses.',
      syncPillars: [
        {
          heading: 'The 72-Hour Desalination Miracle',
          detail:
            'Top grasses like Dichanthium annulatum (Jirayan), Cenchrus ciliaris (Dhaman), and Sporobolus helvolus lie dormant beneath dry crust for up to 9 months. The instant monsoon floodwaters wash the top 5 cm of surface salts downward, the seeds awaken and create a carpet of green within 3 days.'
        },
        {
          heading: 'Deep Fibrous Root Anchors',
          detail:
            'These perennial grasses send root networks 1.5 to 2.5 meters deep into the clay-silt subsoil, binding the desert sand and preventing wind erosion during the harsh pre-monsoon dust storms.'
        },
        {
          heading: 'The Radar Connection',
          detail:
            'Because optical satellites are blinded by monsoon cloud decks, NISAR’s 24cm microwaves are the ONLY sensor capable of measuring the exact timing and vertical canopy height of the grass burst.'
        }
      ]
    },
    {
      id: 'flamingos',
      category: 'AVIAN SANCTUARY',
      title: 'FLAMINGO CITY (KHADIR BET)',
      subtitle: 'Great Rann Flamingo Breeding Sanctuary',
      icon: Droplets,
      accentColor: '#38bdf8',
      tag: 'WETLAND ECOLOGY',
      badge: 'HISTORIC COLONY ~500k',
      heroImage: '/assets/kutch_loupe_water.png',
      statLabel: 'Water Barrier Depth',
      statValue: '0.5 – 1.5 m Brine',
      summary:
        'Every monsoon, when the Great Rann floods, over half a million Greater and Lesser Flamingos descend upon the isolated mud banks north of Khadir Island, turning the barren salt desert into the largest flamingo nursery on the Asian continent.',
      syncPillars: [
        {
          heading: 'The Protective Saltwater Moat',
          detail:
            'Flamingos build elevated conical mud nests rising 30 cm above the water. They can only breed when the surrounding salt flats are submerged by 25–45 cm of brine. This water creates an impassable barrier that prevents desert wolves, jackals, and foxes from reaching the vulnerable eggs.'
        },
        {
          heading: 'Hyper-Saline Algal Bloom',
          detail:
            'The flooded brine basin creates an explosive bloom of microscopic brine shrimp (Artemia) and blue-green algae, rich in carotenoids that give the flamingos their radiant pink plumage.'
        },
        {
          heading: 'The Radar Connection',
          detail:
            'NISAR tracks water extent and recession rates. If the monsoon dries out too quickly before chicks can fly, ground predators invade. NISAR gives wildlife rangers real-time hydrological warnings.'
        }
      ]
    },
    {
      id: 'wildass',
      category: 'DESERT FAUNA',
      title: 'THE INDIAN WILD ASS (KHUR)',
      subtitle: 'Equus hemionus khur • The Last Survivors on Earth',
      icon: Compass,
      accentColor: '#fbbf24',
      tag: 'PROTECTED SPECIES',
      badge: '7,672 HEAD (2024 CENSUS)',
      heroImage: '/assets/rann-of-kutch-twilight.jpg',
      statLabel: 'Conservation Status',
      statValue: 'Schedule I / Near Threatened',
      summary:
        'The Indian Wild Ass Sanctuary in the Rann is the only place left on Earth where this magnificent, golden-maned subspecies survives in the wild, perfectly adapted to sprinting across flat, crystalline salt pans.',
      syncPillars: [
        {
          heading: 'The "Bet" Refuge Strategy',
          detail:
            'When the monsoon inundates the salt flats, the Khur retreat to elevated, shrub-covered mounds called "Bets" (islands such as Khadir, Pachham, and Pung Bet) where they graze on saline shrubs (Suaeda nudiflora and Salvadora).'
        },
        {
          heading: 'Subsurface Saline Water Adaptation',
          detail:
            'The Khur can dig shallow pits ("Vidas") in dry riverbeds to access shallow subsurface freshwater lenses floating atop the deeper hyper-saline groundwater table.'
        },
        {
          heading: 'The Radar Connection',
          detail:
            'NISAR’s dielectric permittivity mapping tracks these subsurface freshwater pockets, mapping critical watering points for wildlife protection.'
        }
      ]
    },
    {
      id: 'prosopis',
      category: 'ECOLOGICAL CRISIS',
      title: 'GANDO BAVAL (PROSOPIS JULIFLORA)',
      subtitle: 'The Invasive Weed That Threatens the Ancient Sync',
      icon: AlertTriangle,
      accentColor: '#ef4444',
      tag: 'ECOLOGICAL INVASION',
      badge: '50%+ SAVANNA INVADED',
      heroImage: '/assets/kutch_island_diorama.jpg',
      statLabel: 'Taproot Depth',
      statValue: 'Up to 25+ Meters',
      summary:
        'Introduced in the 1960s by forest officials to halt the advancing salt desert, the thorny exotic shrub Prosopis juliflora (locally dubbed "Gando Baval", or Mad Tree) has become an ecological catastrophe, choking out indigenous sweet grasses.',
      syncPillars: [
        {
          heading: 'The Groundwater Vampire',
          detail:
            'With taproots penetrating over 25 meters, Prosopis drains deep freshwater aquifers, exuding toxic tannins through its fallen leaves that inhibit the germination of all native grass species.'
        },
        {
          heading: 'Loss of Maldhari Grazing Lands',
          detail:
            'Over 50% of prime Banni savanna has been lost to impenetrable thorny thickets. Buffalo pods that eat Prosopis pods suffer tooth decay and metabolic acidosis, threatening the pastoral way of life.'
        },
        {
          heading: 'The Radar Solution',
          detail:
            'Optical satellites cannot distinguish native grasses from green Prosopis. But NISAR’s 24cm L-Band penetrates the thorny canopy to detect the woody tree branch structure (depolarization ratio), providing the Forest Department with the first accurate eradication maps.'
        }
      ]
    }
  ];

  const currentEntry = ENCYCLOPEDIA_ENTRIES.find((e) => e.id === activeTab) || ENCYCLOPEDIA_ENTRIES[0];

  return (
    <div className="relative w-full max-w-6xl mx-auto rounded-3xl bg-stone-950/90 border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden text-stone-100 flex flex-col font-sans select-none animate-in fade-in zoom-in-95 duration-300">

      {/* Top Header */}
      <div className="px-6 sm:px-8 py-5 border-b border-white/10 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] uppercase text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>LIVING ENCYCLOPEDIA &bull; BANNI BIOSPHERE</span>
            </div>
            <h3 className="font-['Cinzel',serif] text-base sm:text-lg font-bold text-[#faf7f2] tracking-wider uppercase">
              THE SACRED SYNC: NATURE, HERDS & HERDSMEN
            </h3>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Grid: Left Tabs + Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">

        {/* Left Column: Interactive Chapter Directory */}
        <div className="lg:col-span-4 p-4 border-b lg:border-b-0 lg:border-r border-white/10 bg-stone-950/60 flex flex-col gap-2 overflow-y-auto max-h-[600px]">
          <div className="px-2 pb-2 text-[10px] font-mono tracking-[0.25em] text-stone-400 uppercase font-semibold">
            SELECT ECOSYSTEM PILLAR ({ENCYCLOPEDIA_ENTRIES.length})
          </div>

          {ENCYCLOPEDIA_ENTRIES.map((entry) => {
            const isSelected = activeTab === entry.id;
            const Icon = entry.icon;

            return (
              <button
                key={entry.id}
                onClick={() => {
                  try { soundEngine.playHover(); } catch (e) { }
                  setActiveTab(entry.id);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${isSelected
                  ? 'bg-stone-900 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-[1.01]'
                  : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-xl border flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: isSelected ? `${entry.accentColor}20` : 'rgba(255,255,255,0.05)',
                      borderColor: isSelected ? entry.accentColor : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: isSelected ? entry.accentColor : '#a8a29e' }}
                    />
                  </div>
                  <div>
                    <div className="text-[9.5px] font-mono uppercase tracking-wider text-stone-400">
                      {entry.category}
                    </div>
                    <div className="font-['Cinzel',serif] text-xs font-bold text-white uppercase group-hover:text-amber-200 transition-colors">
                      {entry.title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[9px] font-mono px-2 py-0.5 rounded-full border"
                    style={{
                      borderColor: isSelected ? `${entry.accentColor}40` : 'rgba(255,255,255,0.1)',
                      color: isSelected ? entry.accentColor : '#a8a29e',
                      backgroundColor: isSelected ? `${entry.accentColor}10` : 'transparent'
                    }}
                  >
                    {entry.badge}
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-amber-300 translate-x-0.5' : 'text-stone-500 group-hover:translate-x-0.5'
                      }`}
                  />
                </div>
              </button>
            );
          })}

          {/* Quick Context Callout */}
          <div className="mt-auto p-3.5 rounded-2xl bg-amber-400/[0.06] border border-amber-400/20 text-stone-300 text-[11px] font-sans leading-relaxed">
            <span className="font-mono font-bold text-amber-300 block mb-1">
              THE MILLENNIUM-OLD EQUILIBRIUM:
            </span>
            Without the monsoon flood, salt chokes the grass. Without the grass, the Maldhari culture vanishes. Without NISAR, humanity cannot monitor the strain.
          </div>
        </div>

        {/* Right Column: Deep-Dive Pictorial Article */}
        <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[600px] bg-gradient-to-b from-stone-950/40 via-stone-900/20 to-stone-950/60">
          <div>
            {/* Header Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase border"
                  style={{
                    backgroundColor: `${currentEntry.accentColor}15`,
                    borderColor: `${currentEntry.accentColor}50`,
                    color: currentEntry.accentColor
                  }}
                >
                  {currentEntry.tag}
                </span>
                <span className="text-stone-400 text-xs font-mono">&bull;</span>
                <span className="text-stone-400 text-xs font-mono">{currentEntry.category}</span>
              </div>

              <div className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-amber-200 font-mono text-[11px] flex items-center gap-2">
                <span className="text-stone-400">{currentEntry.statLabel}:</span>
                <strong className="text-white">{currentEntry.statValue}</strong>
              </div>
            </div>

            {/* Article Titles */}
            <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl md:text-4xl font-normal text-[#faf7f2] uppercase mb-2 drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">
              {currentEntry.title}
            </h2>
            <div className="text-sm font-sans text-amber-300/90 font-light mb-5">
              {currentEntry.subtitle}
            </div>

            {/* Summary Lead */}
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans font-light p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-6">
              {currentEntry.summary}
            </p>

            {/* 3 Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
              {currentEntry.syncPillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-stone-900/70 border border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[10px] font-mono font-bold text-amber-300/90 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{pillar.heading}</span>
                    </div>
                    <p className="text-[11.5px] text-stone-300 font-sans leading-relaxed font-light">
                      {pillar.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Info Banner */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-stone-400">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>All telemetry cross-referenced with NASA-ISRO NISAR L2 GCOV observations</span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold uppercase tracking-wider text-[11px] transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                RETURN TO RADAR CUBE &rarr;
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

