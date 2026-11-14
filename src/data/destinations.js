export const DESTINATIONS = [
  {
    id: 'rann-of-kutch',
    featured: true,
    title: 'GREAT RANN OF KUTCH',
    region: 'GUJARAT, INDIA',
    coordinates: {
      lat: 23.83,
      lon: 70.03,
      label: '23.83° N, 70.03° E'
    },
    subtitle: 'The Endless White Desert',
    tagline: 'Where the Earth dissolves into boundless crystalline white under moonlit skies.',
    heroImage: '/assets/wild_ass_herd.jpg',
    auraImage: '/assets/layers/kutch_optical_satellite_true.jpg',
    description:
      'Stretching across the 7,505 square kilometer Kutch Desert Wildlife Sanctuary along the Tropic of Cancer, the Great Rann of Kutch is one of the world\'s largest seasonal salt deserts. During winter twilights and full-moon nights, the vast white salt bed mirrors the celestial expanse, glowing like an ethereal silver ocean.',
    weather: {
      temp: '24°C',
      tempF: '75°F',
      condition: 'Clear Twilight Horizon',
      humidity: '34%',
      wind: '12 km/h NE',
      visibility: '25 km',
      crustState: '100% Crisp Salt Crystal',
      nightSky: 'Bortle Class 1 (Pristine Stargazing)'
    },
    stats: [
      { label: 'Surface Area', value: '7,505 km²' },
      { label: 'Salt Crust Depth', value: 'Up to 1.5m' },
      { label: 'Peak Season', value: 'Nov — Feb (Rann Utsav)' },
      { label: 'Full Moon Glow', value: 'Luminous Silver' }
    ],
    highlights: [
      {
        id: 'full-moon',
        title: 'Full Moon Salt Walk',
        description: 'Under the nocturnal full moon, the stark white salt desert radiates an ambient celestial glow that stretches infinitely into the horizon.',
        tag: 'Iconic Experience'
      },
      {
        id: 'rann-utsav',
        title: 'Rann Utsav Cultural Haven',
        description: 'Vibrant tents, authentic Kutchi folk music, traditional Garba dances, and twilight camel safaris at Dhordo village.',
        tag: 'Festival & Living Arts'
      },
      {
        id: 'rogan-craft',
        title: 'Heritage Rogan Art & Weaving',
        description: 'Witness master artisans practicing 400-year-old castor seed paint techniques in Nirona and vibrant mirror-embroidered textiles.',
        tag: 'Artisan Legacy'
      },
      {
        id: 'kala-dungar',
        title: 'Kala Dungar (Black Hill)',
        description: 'The highest summit in Kutch (462m) offering breathtaking panoramic views of the immense white desert merging into the sea.',
        tag: 'Panoramic Vantage'
      }
    ],
    itinerary: [
      {
        day: 'Day 01',
        title: 'Arrival in Bhuj & Gateway to White Rann',
        activities: [
          'Arrive at Bhuj Gateway and scenic private transfer through the desert flatlands to Dhordo Tent City.',
          'Check-in to luxury air-conditioned Bhunga / Swiss tents with traditional Kutchi interiors.',
          'Golden hour camel ride across the crisp crystalline salt flats as the sun melts into twilight shades of rose and amber.',
          'Evening Kutchi buffet featuring hot Bajra rotla, fresh butter, garlic chutney, and spiced Khichdi.'
        ]
      },
      {
        day: 'Day 02',
        title: 'Artisan Trail & The Enchanted Moonlit Walk',
        activities: [
          'Dawn excursion to witness sunrise reflecting against the pristine white salt expanse.',
          'Cultural expedition to Nirona Village: meet Khatri masters of Rogan Art, copper bell smiths, and lacquer woodturners.',
          'Afternoon rest and luxury desert high tea accompanied by soulful Morchang & Jodiya Pawa flute performances.',
          'Late-night guided walk deep into the silent white salt desert beneath a dazzling canopy of millions of stars and the silver moon.'
        ]
      },
      {
        day: 'Day 03',
        title: 'Summit of Kala Dungar & Harappan Dholavira',
        activities: [
          'Ascent to Kala Dungar (Black Hills) for bird-eye view of the international border horizon and the historic Dattatreya Temple.',
          'Optional scenic drive across the dramatic "Road to Heaven" causeway cutting straight through the white salt waters towards UNESCO World Heritage Dholavira.',
          'Exploration of the 4,500-year-old Indus Valley civilization water reservoirs and stone fortifications.',
          'Private stargazing session with optical telescopes before farewell luxury banquet.'
        ]
      }
    ],
    packages: [
      {
        tier: 'Royal Bhunga Suite',
        nights: '3 Days / 2 Nights',
        priceINR: '₹ 42,000',
        priceUSD: '$ 510',
        features: ['Circular Mud Bhunga Architecture', 'VIP Full Moon Desert Access', 'Private Camel Caravan', 'All-Inclusive Kutchi Gourmet Meals']
      },
      {
        tier: 'Premium Swiss Tent',
        nights: '3 Days / 2 Nights',
        priceINR: '₹ 32,000',
        priceUSD: '$ 390',
        features: ['Climate-Controlled Tent', 'Rann Utsav Cultural Passes', 'Guided Artisan Village Tour', 'Desert Safari Transfer']
      },
      {
        tier: 'Nomad Glamping Pod',
        nights: '2 Days / 1 Night',
        priceINR: '₹ 18,500',
        priceUSD: '$ 225',
        features: ['Minimalist Luxury Tent', 'Sunset Salt Point Access', 'Stargazing Guide', 'Traditional Dinner & Breakfast']
      }
    ]
  },
  {
    id: 'salar-de-uyuni',
    featured: false,
    title: 'SALAR DE UYUNI',
    region: 'POTOSÍ, BOLIVIA',
    coordinates: {
      lat: -20.13,
      lon: -67.48,
      label: '20.13° S, 67.48° W'
    },
    subtitle: 'The Giant Mirror of the World',
    tagline: 'A seamless liquid reflection where sky and earth merge in pure solitude.',
    description: 'The world\'s largest salt flat, sitting 3,656 meters above sea level in the high Andes plateau.'
  },
  {
    id: 'wadi-rum',
    featured: false,
    title: 'WADI RUM',
    region: 'AQABA, JORDAN',
    coordinates: {
      lat: 29.57,
      lon: 35.42,
      label: '29.57° N, 35.42° E'
    },
    subtitle: 'The Valley of the Moon',
    tagline: 'Dramatic sandstone monoliths rising from fiery crimson desert dunes.',
    description: 'A timeless protected desert wilderness celebrated for prehistoric rock carvings and astronomical clarity.'
  },
  {
    id: 'sahara-erg-chebbi',
    featured: false,
    title: 'ERG CHEBBI',
    region: 'MERZOUGA, MOROCCO',
    coordinates: {
      lat: 31.11,
      lon: -4.01,
      label: '31.11° N, 4.01° W'
    },
    subtitle: 'The Golden Sea of Dunes',
    tagline: 'Towering orange sand dunes shaped by eternal Saharan winds.',
    description: 'Rising up to 150 meters, the dunes of Erg Chebbi glow like liquid gold in the Sahara sunset.'
  }
];

