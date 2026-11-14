import React, { useState } from 'react';

/**
 * MinimalDualCurveGraph
 * 
 * Minimalist, high-contrast 12-month dual-curve interactive graph
 * Inspired by modern Scandinavian / architectural data dashboards:
 * - 12 vertical hairline grid guides (JAN to DEC)
 * - Dual smooth cubic bezier curves (Upper & Lower trends)
 * - Exact value callout numbers floating above and below the circular nodes
 * - Interactive hover / click scrubber showing calibrated ground truth
 */
export default function MinimalDualCurveGraph({
  data = [],
  activeIndex = null,
  onSelectIndex = () => {},
  primaryKey = 'primary',
  secondaryKey = 'secondary',
  primaryLabel = 'Primary Metric',
  secondaryLabel = 'Secondary Metric',
  primaryUnit = '',
  secondaryUnit = '',
  primaryColor = '#F59E0B', // Amber
  secondaryColor = '#38BDF8', // Sky Blue
  height = 140
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const selectedIdx = activeIndex !== null ? activeIndex : hoveredIdx;

  if (!data || data.length === 0) return null;

  // ViewBox dimensions
  const vbWidth = 720;
  const vbHeight = height;
  const padX = 36;
  const padTop = 26;
  const padBottom = 26;
  const plotWidth = vbWidth - padX * 2;
  const plotHeight = vbHeight - padTop - padBottom;

  const count = data.length;
  const stepX = count > 1 ? plotWidth / (count - 1) : plotWidth;

  // Compute Min & Max for both series to scale accurately
  const pVals = data.map((d) => d[primaryKey] ?? 0);
  const sVals = data.map((d) => d[secondaryKey] ?? 0);

  const minP = Math.min(...pVals);
  const maxP = Math.max(...pVals);
  const rangeP = maxP - minP || 1;

  const minS = Math.min(...sVals);
  const maxS = Math.max(...sVals);
  const rangeS = maxS - minS || 1;

  // Project points to SVG coordinate space
  // Primary (upper curve, mapped from top 10% to 55% of plot height)
  const primaryPoints = data.map((d, i) => {
    const norm = (d[primaryKey] - minP) / rangeP;
    const x = padX + i * stepX;
    // higher value = higher on graph (lower y in SVG)
    const y = padTop + (1 - norm) * (plotHeight * 0.48);
    return { x, y, val: d[primaryKey], raw: d };
  });

  // Secondary (lower curve, mapped from 50% to 92% of plot height)
  const secondaryPoints = data.map((d, i) => {
    const norm = (d[secondaryKey] - minS) / rangeS;
    const x = padX + i * stepX;
    const y = padTop + plotHeight * 0.46 + (1 - norm) * (plotHeight * 0.48);
    return { x, y, val: d[secondaryKey], raw: d };
  });

  // Function to build smooth cubic bezier path through points
  const buildSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) * 0.45;
      const cy1 = p0.y;
      const cx2 = p1.x - (p1.x - p0.x) * 0.45;
      const cy2 = p1.y;
      d += ` C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    return d;
  };

  const primaryPath = buildSmoothPath(primaryPoints);
  const secondaryPath = buildSmoothPath(secondaryPoints);

  const activeItem = selectedIdx !== null && data[selectedIdx] ? data[selectedIdx] : null;

  return (
    <div className="relative w-full rounded-2xl bg-black/60 border border-white/10 p-3 select-none text-stone-200">
      
      {/* Top Header & Legend */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-white/10 text-[10px] font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span className="text-stone-300 font-bold uppercase">{primaryLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
            <span className="text-stone-400 uppercase">{secondaryLabel}</span>
          </div>
        </div>

        {activeItem && (
          <div className="text-[10px] font-mono text-amber-300 flex items-center gap-2">
            <span className="font-bold text-white uppercase">{activeItem.month}:</span>
            <span style={{ color: primaryColor }}>{activeItem[primaryKey]} {primaryUnit}</span>
            <span className="text-stone-500">|</span>
            <span style={{ color: secondaryColor }}>{activeItem[secondaryKey]} {secondaryUnit}</span>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
        >
          <defs>
            {/* Primary line gradient */}
            <linearGradient id="pGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
              <stop offset="50%" stopColor={primaryColor} stopOpacity="1" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.85" />
            </linearGradient>

            {/* Secondary line gradient */}
            <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.6" />
              <stop offset="50%" stopColor={secondaryColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.6" />
            </linearGradient>

            {/* Area fill between or below */}
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 1. Vertical Hairline Guide Lines for each of the 12 Months */}
          {data.map((d, i) => {
            const x = padX + i * stepX;
            const isHovered = selectedIdx === i;
            return (
              <g key={`grid-${d.month || i}`}>
                <line
                  x1={x}
                  y1={padTop - 6}
                  x2={x}
                  y2={vbHeight - padBottom + 16}
                  stroke={isHovered ? 'rgba(251, 191, 36, 0.45)' : 'rgba(255, 255, 255, 0.08)'}
                  strokeWidth={isHovered ? '1.5' : '1'}
                  strokeDasharray={isHovered ? 'none' : '2 2'}
                />
              </g>
            );
          })}

          {/* 2. Primary Curve Line */}
          <path
            d={primaryPath}
            fill="none"
            stroke="url(#pGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3. Secondary Curve Line */}
          <path
            d={secondaryPath}
            fill="none"
            stroke="url(#sGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 4. Data Nodes & Callout Numbers on Primary Curve */}
          {primaryPoints.map((pt, i) => {
            const isSelected = selectedIdx === i;
            const item = data[i];
            const displayVal = item.primaryDisplay !== undefined ? item.primaryDisplay : pt.val;

            return (
              <g
                key={`p-node-${i}`}
                className="transition-transform duration-200"
                style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
              >
                {/* Node Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 4.5 : 3}
                  fill={isSelected ? '#ffffff' : primaryColor}
                  stroke="#000000"
                  strokeWidth="1.5"
                />

                {/* Numeric Callout Tag directly above node */}
                <text
                  x={pt.x}
                  y={pt.y - 8}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fill={isSelected ? '#FDE68A' : 'rgba(255,255,255,0.75)'}
                >
                  {displayVal}
                </text>
              </g>
            );
          })}

          {/* 5. Data Nodes & Callout Numbers on Secondary Curve */}
          {secondaryPoints.map((pt, i) => {
            const isSelected = selectedIdx === i;
            const item = data[i];
            const displayVal = item.secondaryDisplay !== undefined ? item.secondaryDisplay : pt.val;

            return (
              <g
                key={`s-node-${i}`}
                className="transition-transform duration-200"
                style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
              >
                {/* Node Hollow Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 4 : 2.5}
                  fill="#000000"
                  stroke={isSelected ? '#ffffff' : secondaryColor}
                  strokeWidth="1.5"
                />

                {/* Numeric Callout Tag directly below node */}
                <text
                  x={pt.x}
                  y={pt.y + 11}
                  textAnchor="middle"
                  fontSize="8"
                  fontFamily="monospace"
                  fill={isSelected ? '#BAE6FD' : 'rgba(255,255,255,0.5)'}
                >
                  {displayVal}
                </text>
              </g>
            );
          })}

          {/* 6. Month Abbreviation Labels at the Bottom */}
          {data.map((d, i) => {
            const x = padX + i * stepX;
            const isSelected = selectedIdx === i;
            return (
              <text
                key={`label-${d.month || i}`}
                x={x}
                y={vbHeight - 4}
                textAnchor="middle"
                fontSize="9"
                fontFamily="monospace"
                fontWeight={isSelected ? 'bold' : 'normal'}
                fill={isSelected ? '#F59E0B' : 'rgba(255,255,255,0.45)'}
                className="uppercase tracking-wider"
              >
                {d.month}
              </text>
            );
          })}

          {/* 7. Invisible Full-Height Touch Hitboxes */}
          {data.map((d, i) => {
            const x = padX + i * stepX - stepX / 2;
            const w = stepX;
            return (
              <rect
                key={`hitbox-${d.month || i}`}
                x={Math.max(0, x)}
                y={0}
                width={w}
                height={vbHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectIndex(i)}
                className="cursor-pointer"
              />
            );
          })}
        </svg>
      </div>

      {/* Narrative Footer */}
      {activeItem && activeItem.narrative && (
        <div className="pt-2 mt-1 border-t border-white/10 text-[9.5px] font-mono text-stone-300 flex items-center justify-between">
          <span className="text-amber-400 font-bold uppercase">{activeItem.phaseName || activeItem.month}:</span>
          <span className="text-stone-400 truncate max-w-md text-right">{activeItem.narrative}</span>
        </div>
      )}

    </div>
  );
}
