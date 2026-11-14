import {
  PHYSICAL_CONSTANTS,
  calculateWavelengthRatio,
  calculateBraggSpacing,
  calculateFresnelReflectivityHH,
  calculateLowLossPenetrationDepth,
  calculateConductorSkinDepth
} from './physics.js';

console.log('--- RUNNING PHYSICS.JS UNIT TESTS ---');

// Test 1: Wavelength ratio
const ratio = calculateWavelengthRatio();
console.assert(ratio > 400000 && ratio < 450000, `Unexpected ratio: ${ratio}`);
console.log(`[PASS] Wavelength Ratio: ${Math.round(ratio).toLocaleString()}x visible light`);

// Test 2: Bragg spacing at theta = 37 deg
const dBragg = calculateBraggSpacing(37);
console.assert(dBragg > 0.19 && dBragg < 0.21, `Unexpected dBragg: ${dBragg}`);
console.log(`[PASS] Bragg spacing at 37° incidence: ${(dBragg * 100).toFixed(1)} cm`);

// Test 3: Fresnel Reflectivity over smooth water
// Water eps' = 75, eps'' = 20, theta = 37 deg
const rHH = calculateFresnelReflectivityHH(37, 75, 20);
console.assert(rHH > 0.60 && rHH < 0.95, `Unexpected rHH: ${rHH}`);
console.log(`[PASS] Fresnel HH Reflectivity over water (37°): ${(rHH * 100).toFixed(1)}% specular bounce`);

// Test 4: Low-loss penetration depth in dry halite
// Solid halite eps' = 5.9, pure tan delta ~ 1e-4 -> eps'' ~ 5.9e-4
const depthHalite = calculateLowLossPenetrationDepth(5.9, 0.005, 0.24);
console.assert(depthHalite > 10.0, `Unexpected halite depth: ${depthHalite}`);
console.log(`[PASS] Penetration in low-loss dry halite crust (eps'=5.9, eps''=0.005): ${depthHalite.toFixed(2)} m`);

// Test 5: Conductor skin depth in saline brine
// Brine conductivity sigma = 20 S/m, f = 1.25 GHz
const skinDepth = calculateConductorSkinDepth(20, 1.25e9);
console.assert(skinDepth > 0.002 && skinDepth < 0.005, `Unexpected skin depth: ${skinDepth}`);
console.log(`[PASS] Conductor skin depth in hyper-saline brine (20 S/m): ${(skinDepth * 1000).toFixed(2)} mm`);

console.log('ALL PHYSICS UNIT TESTS PASSED CLEANLY!');
