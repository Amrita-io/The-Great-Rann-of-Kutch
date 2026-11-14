const fs = require('fs');
const path = require('path');

// 1. Load dom_text_dump.json
const rawDump = JSON.parse(fs.readFileSync('dom_text_dump.json', 'utf8'));

// 2. Parse source strings from src to catch any unrendered/fallback strings
const sourceStrings = [];
function scanSrcDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist'].includes(entry.name)) {
        scanSrcDir(fullPath);
      }
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const relPath = path.relative('.', fullPath).replace(/\\/g, '/');
      
      // Extract string literals in quotes or template literals with > 3 chars
      const strRegex = /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g;
      let match;
      while ((match = strRegex.exec(content)) !== null) {
        const str = match[2].trim();
        // Skip code symbols, classes, styles, paths
        if (
          str.length > 3 &&
          !str.startsWith('/') &&
          !str.startsWith('http') &&
          !str.includes('flex') &&
          !str.includes('bg-') &&
          !str.includes('text-') &&
          !str.includes('px-') &&
          !str.includes('py-') &&
          !str.includes('border-') &&
          !str.includes('rounded-') &&
          !str.includes('className') &&
          !str.includes('import ') &&
          !str.includes('export ') &&
          /[a-zA-Z]/.test(str)
        ) {
          sourceStrings.push({
            file: relPath,
            text: str.replace(/\\n/g, ' ').replace(/\s+/g, ' ')
          });
        }
      }
    }
  }
}
scanSrcDir('src');

// Set of crawled clean texts
const crawledTexts = new Set(rawDump.map(d => d.text.trim().toLowerCase()));

// Identify source strings missed by crawler
const missedSourceStrings = [];
for (const s of sourceStrings) {
  const clean = s.text.trim().toLowerCase();
  if (!crawledTexts.has(clean) && clean.length > 5) {
    missedSourceStrings.push(s);
  }
}

console.log(`Loaded ${rawDump.length} crawled DOM entries.`);
console.log(`Found ${sourceStrings.length} source string candidates, of which ${missedSourceStrings.length} were not directly matching crawled text.`);

// 3. Atomize claims into atomic rows
// Types:
// 1: instrument_product
// 2: raster_derived
// 3: physics_derived
// 4: geology_history
// 5: ecology_wildlife
// 6: culture_architecture
// 7: geography_coordinates
// 8: comparison_analogy
// 9: ui_label

// UI Label patterns
const uiLabelRegex = /^(next|prev|orbit|back|close|sound:.*|proceed to.*|click anywhere.*|discover.*|start story|compress stack|expand 3d strata|data provenance|view.*|chapter \d+.*|season \d+.*|station \d+.*|pass \d+.*|layman|science|optical|radar|led pixel.*|3d turntable|kids|physics|everyone|fullscreen|reset|zoom.*|reload.*|\d+\.\s*[A-Z\s]+|m|select.*|filter.*)$/i;

// Unit & Value Regexes
const valueUnitRegex = /([+-]?\d+(?:\.\d+)?)\s*(km²|sq km|km|m|cm|mm|db|ghz|mhz|°c|%|mg\/ha|t\/ha|g\/l|cows\/ha|ha|days|chicks|herds|head|generations|years|mw)/i;
const coordRegex = /(\d+(?:\.\d+)?°\s*[NSEW])\s*,\s*(\d+(?:\.\d+)?°\s*[NSEW])/i;

const claims = [];
let claimSeq = 1;

function classifyClaim(text, route, state) {
  const lower = text.toLowerCase();
  
  if (uiLabelRegex.test(text.trim()) && !valueUnitRegex.test(text)) {
    return { type: 'ui_label', verdict: 'UI_LABEL', method: 'none' };
  }

  // Instrument / Product
  if (
    lower.includes('nisar') ||
    lower.includes('l-band') ||
    lower.includes('lsar') ||
    lower.includes('gcov') ||
    lower.includes('orbit') ||
    lower.includes('repeat cycle') ||
    lower.includes('track 063') ||
    lower.includes('frame 076') ||
    lower.includes('sun-synchronous') ||
    lower.includes('swath') ||
    lower.includes('nesz') ||
    lower.includes('gamma0') ||
    lower.includes('sigma0') ||
    lower.includes('asf') ||
    lower.includes('earthdata')
  ) {
    return { type: 'instrument_product', verdict: 'UNVERIFIED', method: 'instrument_spec_check' };
  }

  // Physics / dielectric / backscatter
  if (
    lower.includes('permittivity') ||
    lower.includes("ε'") ||
    lower.includes('epsilon') ||
    lower.includes('dielectric') ||
    lower.includes('bragg') ||
    lower.includes('skin depth') ||
    lower.includes('attenuation') ||
    lower.includes('depolarization') ||
    lower.includes('refraction') ||
    lower.includes('specular') ||
    lower.includes('fresnel') ||
    lower.includes('halite') ||
    lower.includes('thermal comfort') ||
    lower.includes('°c')
  ) {
    return { type: 'physics_derived', verdict: 'UNVERIFIED', method: 'physics_model' };
  }

  // Raster derived (dB, flooded area, backscatter return)
  if (
    lower.includes('backscatter') ||
    lower.includes(' db') ||
    lower.includes('flooded') ||
    lower.includes('flood extent') ||
    lower.includes('inundation') ||
    lower.includes('retro-reflection') ||
    lower.includes('mirror null') ||
    lower.includes('volume scatter')
  ) {
    return { type: 'raster_derived', verdict: 'UNVERIFIED', method: 'granule_calc' };
  }

  // Geology / History (Allah Bund, Bhuj 2001, 1819, fault scarp, paleochannel, Indus, Nara, Puran)
  if (
    lower.includes('allah bund') ||
    lower.includes('earthquake') ||
    lower.includes('fault scarp') ||
    lower.includes('paleochannel') ||
    lower.includes('1819') ||
    lower.includes('2001') ||
    lower.includes('bhuj') ||
    lower.includes('dam of god') ||
    lower.includes('indus') ||
    lower.includes('nara') ||
    lower.includes('puran')
  ) {
    return { type: 'geology_history', verdict: 'UNVERIFIED', method: 'literature_tier1' };
  }

  // Ecology / Wildlife (Flamingo, Wild Ass, Khur, Chinkara, Fox, Banni, Prosopis, Gando Baval, sweet grass, Artemia, biomass)
  if (
    lower.includes('flamingo') ||
    lower.includes('khur') ||
    lower.includes('wild ass') ||
    lower.includes('chinkara') ||
    lower.includes('desert fox') ||
    lower.includes('artemia') ||
    lower.includes('prosopis') ||
    lower.includes('gando baval') ||
    lower.includes('dicanthium') ||
    lower.includes('dichanthium') ||
    lower.includes('cenchrus') ||
    lower.includes('sweet grass') ||
    lower.includes('biomass') ||
    lower.includes('mg/ha') ||
    lower.includes('t/ha') ||
    lower.includes('forage') ||
    lower.includes('banni') ||
    lower.includes('cattle') ||
    lower.includes('buffalo') ||
    lower.includes('kundi') ||
    lower.includes('fauna')
  ) {
    return { type: 'ecology_wildlife', verdict: 'UNVERIFIED', method: 'literature_tier1' };
  }

  // Culture / Architecture (Maldhari, Bhunga, Lippan, Kalash, Rabari, Jat, Dholavira, Harappan, Rogan, Rann Utsav)
  if (
    lower.includes('maldhari') ||
    lower.includes('bhunga') ||
    lower.includes('lippan') ||
    lower.includes('lipan') ||
    lower.includes('kalash') ||
    lower.includes('rabari') ||
    lower.includes('dholavira') ||
    lower.includes('harappan') ||
    lower.includes('rogan') ||
    lower.includes('rann utsav') ||
    lower.includes('pastoral')
  ) {
    return { type: 'culture_architecture', verdict: 'UNVERIFIED', method: 'literature_tier1' };
  }

  // Geography / Coordinates
  if (
    coordRegex.test(text) ||
    lower.includes('latitude') ||
    lower.includes('longitude') ||
    lower.includes('kala dungar') ||
    lower.includes('khadir') ||
    lower.includes('kori creek') ||
    lower.includes('sir creek') ||
    lower.includes('great rann') ||
    lower.includes('elevation') ||
    lower.includes('altitude')
  ) {
    return { type: 'geography_coordinates', verdict: 'UNVERIFIED', method: 'literature_tier1' };
  }

  // Comparison / Analogy (like a mirror, like a bicycle reflector, like a flashlight)
  if (
    lower.includes('like a ') ||
    lower.includes('like turning') ||
    lower.includes('analogy') ||
    lower.includes('bathroom mirror') ||
    lower.includes('bicycle reflector') ||
    lower.includes('superhero') ||
    lower.includes('x-ray')
  ) {
    return { type: 'comparison_analogy', verdict: 'UNVERIFIED', method: 'physics_model' };
  }

  // Fallback: if short and no numbers -> UI label, else check
  if (text.length < 35 && !/\d/.test(text)) {
    return { type: 'ui_label', verdict: 'UI_LABEL', method: 'none' };
  }

  return { type: 'comparison_analogy', verdict: 'UNVERIFIED', method: 'literature_tier2' };
}

function extractValueAndUnit(text) {
  // Check coordinates
  const cMatch = text.match(coordRegex);
  if (cMatch) {
    return { value: `${cMatch[1]}, ${cMatch[2]}`, unit: 'deg' };
  }
  // Check value + unit
  const m = text.match(valueUnitRegex);
  if (m) {
    return { value: m[1], unit: m[2] };
  }
  // Standalone numbers
  const numMatch = text.match(/([+-]?\d+(?:\.\d+)?)/);
  if (numMatch && !text.includes('STEP') && !text.includes('SEASON') && !text.includes('CHAPTER')) {
    return { value: numMatch[1], unit: '' };
  }
  return { value: '', unit: '' };
}

// Atomize text into sentences/clauses
function atomize(text) {
  if (text.length < 50 || uiLabelRegex.test(text.trim())) {
    return [text.trim()];
  }
  // Split on periods followed by space, or semicolons, or bullet points
  const parts = text.split(/(?<=[.?!;•&bull;])\s+/);
  return parts.map(p => p.trim()).filter(p => p.length > 2);
}

// Process all dumped items
for (const item of rawDump) {
  const atoms = atomize(item.text);
  for (const atom of atoms) {
    const classification = classifyClaim(atom, item.route, item.state);
    const { value, unit } = extractValueAndUnit(atom);
    const id = `CLM_${String(claimSeq++).padStart(4, '0')}`;
    claims.push({
      claim_id: id,
      route: item.route,
      state: item.state,
      exact_text: atom,
      claim_type: classification.type,
      value: value,
      unit: unit,
      verdict: classification.verdict,
      method: classification.method,
      source_ids: '',
      notes: ''
    });
  }
}

// Add unrendered source strings as unrendered state claims
for (const m of missedSourceStrings) {
  const atoms = atomize(m.text);
  for (const atom of atoms) {
    const classification = classifyClaim(atom, 'source_file', m.file);
    const { value, unit } = extractValueAndUnit(atom);
    const id = `CLM_${String(claimSeq++).padStart(4, '0')}`;
    claims.push({
      claim_id: id,
      route: 'source_file',
      state: m.file,
      exact_text: atom,
      claim_type: classification.type,
      value: value,
      unit: unit,
      verdict: classification.verdict,
      method: classification.method,
      source_ids: '',
      notes: 'Harvested from source file string'
    });
  }
}

// CSV Escaping
function escapeCsv(val) {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
  return `"${str}"`;
}

const csvHeader = [
  'claim_id',
  'route',
  'state',
  'exact_text',
  'claim_type',
  'value',
  'unit',
  'verdict',
  'method',
  'source_ids',
  'notes'
];

const csvRows = [csvHeader.join(',')];
for (const c of claims) {
  csvRows.push([
    escapeCsv(c.claim_id),
    escapeCsv(c.route),
    escapeCsv(c.state),
    escapeCsv(c.exact_text),
    escapeCsv(c.claim_type),
    escapeCsv(c.value),
    escapeCsv(c.unit),
    escapeCsv(c.verdict),
    escapeCsv(c.method),
    escapeCsv(c.source_ids),
    escapeCsv(c.notes)
  ].join(','));
}

fs.writeFileSync('CLAIM_LEDGER.csv', csvRows.join('\n'), 'utf8');
console.log(`[Claim Ledger] Wrote ${claims.length} claims to CLAIM_LEDGER.csv.`);

// Print Statistics
const typeCounts = {};
const verdictCounts = {};
for (const c of claims) {
  typeCounts[c.claim_type] = (typeCounts[c.claim_type] || 0) + 1;
  verdictCounts[c.verdict] = (verdictCounts[c.verdict] || 0) + 1;
}

console.log('\n--- CLAIM LEDGER STATISTICS ---');
console.log(`Total Atomic Claims: ${claims.length}`);
console.log('Breakdown by Claim Type:');
for (const [t, cnt] of Object.entries(typeCounts)) {
  console.log(`  ${t}: ${cnt}`);
}
console.log('Breakdown by Verdict:');
for (const [v, cnt] of Object.entries(verdictCounts)) {
  console.log(`  ${v}: ${cnt}`);
}
