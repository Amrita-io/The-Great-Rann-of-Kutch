/**
 * SarOverlayLayer.jsx
 * Modular, plug-and-play MapLibre GL SAR Data Layer & Utility for the Great Rann of Kutch.
 * 
 * Bounding Box (Top-Left, Top-Right, Bottom-Right, Bottom-Left):
 *   - Top-Left:     [69.45, 24.28]
 *   - Top-Right:    [70.75, 24.28]
 *   - Bottom-Right: [70.75, 23.68]
 *   - Bottom-Left:  [69.45, 23.68]
 */

import { useEffect } from 'react';

export const SAR_SOURCE_ID = 'act1-sar-layer';
export const SAR_LAYER_ID = 'act1-sar-raster';

export const SAR_QUAD_COORDINATES = [
  [69.45, 24.28], // Top-Left [lon, lat]
  [70.75, 24.28], // Top-Right [lon, lat]
  [70.75, 23.68], // Bottom-Right [lon, lat]
  [69.45, 23.68]  // Bottom-Left [lon, lat]
];

export const SAR_AOI_BBOX = {
  minLon: 69.45,
  minLat: 23.68,
  maxLon: 70.75,
  maxLat: 24.28
};

export const SAR_RASTER_URL = '/assets/layers/act1_silence.webp';
export const SAR_RASTER_FALLBACK_URL = '/assets/layers/act1_silence.png';
export const SAR_HEARTBEATS_URL = '/assets/data/heartbeats.json';

/**
 * Mount the SAR Raster Source and Layer to any MapLibre GL map instance.
 * @param {object} map - MapLibre GL map instance
 * @param {object} options - Optional configuration { opacity, visible, beforeLayerId, url }
 */
export function addSarRasterSource(map, options = {}) {
  if (!map) return;

  const url = options.url || SAR_RASTER_URL;
  const opacity = typeof options.opacity === 'number' ? options.opacity : 0.88;
  const isVisible = options.visible !== false;

  // Wait if style is not yet fully loaded
  if (!map.isStyleLoaded || !map.isStyleLoaded()) {
    map.once('load', () => addSarRasterSource(map, options));
    return;
  }

  // Register Image Source if not already present
  if (!map.getSource(SAR_SOURCE_ID)) {
    map.addSource(SAR_SOURCE_ID, {
      type: 'image',
      url: url,
      coordinates: SAR_QUAD_COORDINATES
    });
  }

  // Register Raster Layer if not already present
  if (!map.getLayer(SAR_LAYER_ID)) {
    map.addLayer({
      id: SAR_LAYER_ID,
      type: 'raster',
      source: SAR_SOURCE_ID,
      paint: {
        'raster-opacity': opacity,
        'raster-fade-duration': 300,
        'raster-resampling': 'linear'
      },
      layout: {
        visibility: isVisible ? 'visible' : 'none'
      }
    }, options.beforeLayerId);
  }
}

/**
 * Toggle SAR layer visibility to 'visible'
 * @param {object} map - MapLibre GL map instance
 */
export function showSarLayer(map) {
  if (map && map.getLayer && map.getLayer(SAR_LAYER_ID)) {
    map.setLayoutProperty(SAR_LAYER_ID, 'visibility', 'visible');
  }
}

/**
 * Toggle SAR layer visibility to 'none'
 * @param {object} map - MapLibre GL map instance
 */
export function hideSarLayer(map) {
  if (map && map.getLayer && map.getLayer(SAR_LAYER_ID)) {
    map.setLayoutProperty(SAR_LAYER_ID, 'visibility', 'none');
  }
}

/**
 * Set SAR layer opacity smoothly
 * @param {object} map - MapLibre GL map instance
 * @param {number} opacity - Float between 0.0 and 1.0
 */
export function setOpacity(map, opacity) {
  if (map && map.getLayer && map.getLayer(SAR_LAYER_ID)) {
    const clamped = Math.max(0.0, Math.min(1.0, opacity));
    map.setPaintProperty(SAR_LAYER_ID, 'raster-opacity', clamped);
  }
}

/**
 * Safely remove SAR source and layer upon unmount
 * @param {object} map - MapLibre GL map instance
 */
export function removeSarLayer(map) {
  if (!map) return;
  try {
    if (map.getLayer && map.getLayer(SAR_LAYER_ID)) {
      map.removeLayer(SAR_LAYER_ID);
    }
    if (map.getSource && map.getSource(SAR_SOURCE_ID)) {
      map.removeSource(SAR_SOURCE_ID);
    }
  } catch (err) {
    console.warn('[SarOverlayLayer] Layer removal warning:', err);
  }
}

/**
 * Load precomputed heartbeat time series data from /assets/data/heartbeats.json
 * @returns {Promise<object>} JSON payload containing 15 stations and telemetry
 */
export async function loadSarHeartbeats() {
  try {
    const response = await fetch(SAR_HEARTBEATS_URL);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('[SarOverlayLayer] Could not fetch heartbeats.json, using fallback:', err);
    return null;
  }
}

/**
 * Isolated React Component for MapLibre GL integration
 * Mounts silently into any MapLibre container without altering DOM layout or UI.
 */
export default function SarOverlayLayer({
  map,
  isVisible = true,
  opacity = 0.88,
  onLoaded = null
}) {
  useEffect(() => {
    if (!map) return;

    addSarRasterSource(map, {
      opacity,
      visible: isVisible
    });

    if (onLoaded) {
      onLoaded({
        show: () => showSarLayer(map),
        hide: () => hideSarLayer(map),
        setOpacity: (val) => setOpacity(map, val)
      });
    }

    return () => {
      removeSarLayer(map);
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    if (isVisible) {
      showSarLayer(map);
    } else {
      hideSarLayer(map);
    }
  }, [map, isVisible]);

  useEffect(() => {
    if (!map) return;
    setOpacity(map, opacity);
  }, [map, opacity]);

  return null; // Headless component, renders nothing in HTML DOM
}

