/**
 * src/lib/physics.js
 * 
 * Verified microwave remote sensing physics formulas for NASA-ISRO NISAR L-Band (24 cm, 1.25 GHz).
 * Each formula is strictly documented with its governing physical equation, inputs, units,
 * and academic citation ID linked to SOURCES.json.
 */

export const PHYSICAL_CONSTANTS = {
  SPEED_OF_LIGHT: 299792458, // m/s
  PERMITTIVITY_FREE_SPACE: 8.8541878128e-12, // F/m (eps0)
  PERMEABILITY_FREE_SPACE: 1.25663706212e-6, // H/m (mu0)
  NISAR_L_BAND_FREQUENCY_HZ: 1.25e9, // 1.25 GHz nominal center frequency
  NISAR_L_BAND_WAVELENGTH_M: 0.24, // 24.0 cm nominal wavelength
  VISIBLE_LIGHT_GREEN_M: 5.5e-7 // 550 nm reference green wavelength
};

/**
 * 1. Ratio of NISAR L-Band wavelength to visible light
 * Citation: CIT_ULABY_2014 (Ulaby & Long, Microwave Radar Remote Sensing)
 * @param {number} lambdaRadar - Radar wavelength in meters (default 0.24m)
 * @param {number} lambdaVisible - Visible light wavelength in meters (default 5.5e-7m)
 * @returns {number} Ratio (approx. 436,000x)
 */
export function calculateWavelengthRatio(
  lambdaRadar = PHYSICAL_CONSTANTS.NISAR_L_BAND_WAVELENGTH_M,
  lambdaVisible = PHYSICAL_CONSTANTS.VISIBLE_LIGHT_GREEN_M
) {
  if (lambdaVisible <= 0) throw new Error("Visible wavelength must be positive");
  return lambdaRadar / lambdaVisible;
}

/**
 * 2. Bragg Resonance Spacing
 * For a given incidence angle theta, resonant surface roughness wavelength is:
 * d_Bragg = lambda / (2 * sin(theta))
 * Citation: CIT_ELACHI_2006 (Elachi & van Zyl, Spaceborne Radar Remote Sensing)
 * @param {number} thetaDeg - Incidence angle in degrees (NISAR operational range: 33° to 47°)
 * @param {number} lambda - Radar wavelength in meters (default 0.24m)
 * @returns {number} Resonant roughness spacing in meters
 */
export function calculateBraggSpacing(
  thetaDeg,
  lambda = PHYSICAL_CONSTANTS.NISAR_L_BAND_WAVELENGTH_M
) {
  if (thetaDeg <= 0 || thetaDeg >= 90) {
    throw new Error("Incidence angle theta must be strictly between 0 and 90 degrees");
  }
  const thetaRad = (thetaDeg * Math.PI) / 180;
  return lambda / (2 * Math.sin(thetaRad));
}

/**
 * 3. Fresnel Reflectivity for Horizontal Polarization (HH) over Water
 * Computes power reflection coefficient for a smooth dielectric interface.
 * R_HH = |(cos(theta) - sqrt(eps_c - sin^2(theta))) / (cos(theta) + sqrt(eps_c - sin^2(theta)))|^2
 * Citation: CIT_STRATTON_1941 (Electromagnetic Theory); CIT_ULABY_2014
 * @param {number} thetaDeg - Incidence angle in degrees
 * @param {number} epsPrime - Real part of dielectric permittivity (e.g. 70 - 80 for water)
 * @param {number} epsDoublePrime - Imaginary loss factor (e.g. 10 - 40 for saline brine)
 * @returns {number} Power reflectivity (0.0 to 1.0)
 */
export function calculateFresnelReflectivityHH(thetaDeg, epsPrime, epsDoublePrime = 0) {
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const sinTheta = Math.sin(thetaRad);
  const cosTheta = Math.cos(thetaRad);

  // Complex permittivity: eps_c = eps' - j*eps''
  // sqrt(eps_c - sin^2(theta)) = sqrt((eps' - sin^2(theta)) - j*eps'')
  const u = epsPrime - sinTheta * sinTheta;
  const v = -epsDoublePrime;

  // Polar form of (u + j*v)
  const mag = Math.hypot(u, v);
  const phase = Math.atan2(v, u);

  // Square root in complex plane
  const sqrtMag = Math.sqrt(mag);
  const sqrtPhase = phase / 2;
  const reSqrt = sqrtMag * Math.cos(sqrtPhase);
  const imSqrt = sqrtMag * Math.sin(sqrtPhase);

  // Numerator: cos(theta) - (reSqrt + j*imSqrt) = (cos(theta) - reSqrt) - j*imSqrt
  const numRe = cosTheta - reSqrt;
  const numIm = -imSqrt;
  const numMagSq = numRe * numRe + numIm * numIm;

  // Denominator: cos(theta) + (reSqrt + j*imSqrt) = (cos(theta) + reSqrt) + j*imSqrt
  const denRe = cosTheta + reSqrt;
  const denIm = imSqrt;
  const denMagSq = denRe * denRe + denIm * denIm;

  return numMagSq / denMagSq;
}

/**
 * 4. Low-Loss Dielectric Penetration Depth
 * In a low-loss dielectric medium (tan delta = eps''/eps' << 1):
 * delta_p = (lambda * sqrt(eps')) / (2 * pi * eps'')
 * Citation: CIT_ULABY_2014 (Ulaby & Long 2014, Section 2-8); CIT_GORHAM_2002 (Halite loss)
 * @param {number} epsPrime - Real relative permittivity (e.g. 5.9 for solid halite)
 * @param {number} epsDoublePrime - Imaginary dielectric loss factor
 * @param {number} lambda - Radar wavelength in meters (default 0.24m)
 * @returns {number} Penetration depth in meters
 */
export function calculateLowLossPenetrationDepth(
  epsPrime,
  epsDoublePrime,
  lambda = PHYSICAL_CONSTANTS.NISAR_L_BAND_WAVELENGTH_M
) {
  if (epsPrime <= 0 || epsDoublePrime <= 0) {
    throw new Error("Permittivity real part and loss factor must be strictly positive");
  }
  return (lambda * Math.sqrt(epsPrime)) / (2 * Math.PI * epsDoublePrime);
}

/**
 * 5. High-Conductivity Conductor Skin Depth
 * For highly conductive media like hyper-saline brine or moist silt:
 * delta_s = sqrt(2 / (omega * mu0 * sigma))
 * Citation: CIT_JACKSON_1999 (Classical Electrodynamics, Chapter 7)
 * @param {number} sigmaSiemensPerMeter - Electrical conductivity in S/m (e.g. 15 to 30 S/m for Rann brine)
 * @param {number} freqHz - Radar frequency in Hz (default 1.25 GHz)
 * @returns {number} Skin depth in meters
 */
export function calculateConductorSkinDepth(
  sigmaSiemensPerMeter,
  freqHz = PHYSICAL_CONSTANTS.NISAR_L_BAND_FREQUENCY_HZ
) {
  if (sigmaSiemensPerMeter <= 0) {
    throw new Error("Electrical conductivity must be strictly positive");
  }
  const omega = 2 * Math.PI * freqHz;
  const mu0 = PHYSICAL_CONSTANTS.PERMEABILITY_FREE_SPACE;
  return Math.sqrt(2 / (omega * mu0 * sigmaSiemensPerMeter));
}
