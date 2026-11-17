import React, { useMemo, useState } from "react";

const SYNODIC_MONTH = 29.53058867;
const NEW_MOON_EPOCH_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

function computeLunarTelemetry(date = new Date()) {
  const daysSince = (date.getTime() - NEW_MOON_EPOCH_MS) / 86400000;
  const age = ((daysSince % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const phase = age / SYNODIC_MONTH;
  const illumination = Math.round(((1 - Math.cos(2 * Math.PI * phase)) / 2) * 100);

  let label = "New Moon";
  if (phase >= 0.03 && phase < 0.22) label = "Waxing Crescent";
  else if (phase >= 0.22 && phase < 0.28) label = "First Quarter";
  else if (phase >= 0.28 && phase < 0.47) label = "Waxing Gibbous";
  else if (phase >= 0.47 && phase < 0.53) label = "Full Moon";
  else if (phase >= 0.53 && phase < 0.72) label = "Waning Gibbous";
  else if (phase >= 0.72 && phase < 0.78) label = "Last Quarter";
  else if (phase >= 0.78 && phase < 0.97) label = "Waning Crescent";

  // SVG lit surface path for circle centered at (20, 20) with r = 10.5
  const r = 10.5;
  const topY = 20 - r;
  const bottomY = 20 + r;
  const cos = Math.cos(2 * Math.PI * phase);
  const rx = Math.max(0.15, Math.abs(cos) * r);

  let litPath = "";
  if (illumination >= 99) {
    litPath = `M 20 ${topY} A ${r} ${r} 0 1 1 20 ${bottomY} A ${r} ${r} 0 1 1 20 ${topY} Z`;
  } else if (illumination > 1) {
    if (phase < 0.5) {
      // Waxing: right limb outer arc (sweep = 1 from top to bottom)
      const innerSweep = cos > 0 ? 0 : 1;
      litPath = `M 20 ${topY} A ${r} ${r} 0 0 1 20 ${bottomY} A ${rx.toFixed(2)} ${r} 0 0 ${innerSweep} 20 ${topY} Z`;
    } else {
      // Waning: left limb outer arc (sweep = 0 from top to bottom)
      const innerSweep = cos < 0 ? 0 : 1;
      litPath = `M 20 ${topY} A ${r} ${r} 0 0 0 20 ${bottomY} A ${rx.toFixed(2)} ${r} 0 0 ${innerSweep} 20 ${topY} Z`;
    }
  }

  return {
    phase,
    ageDay: Math.max(1, Math.round(age)),
    illumination,
    label,
    litPath,
  };
}

/**
 * Interactive 17th-century engraved brass & lunar-phase dial calibrated to today's date.
 * Rotates smoothly via CSS transform on draw progression or direct click.
 */
export default function LunarPhaseDial({ pulseStep = 0, date }) {
  const [manualTurn, setManualTurn] = useState(0);
  const lunar = useMemo(() => computeLunarTelemetry(date ?? new Date()), [date]);
  const dialAngle = (pulseStep + manualTurn) * 45;

  return (
    <button
      type="button"
      onClick={() => setManualTurn((n) => n + 1)}
      aria-label={`Lunar telemetry: ${lunar.label}, ${lunar.illumination}% illuminated, day ${lunar.ageDay} of cycle. Activate to rotate astrolabe ring.`}
      className="group inline-flex items-center gap-2.5 rounded-sm border border-[#C5A059]/25 bg-[#141218]/90 px-2.5 py-1.5 text-left transition-colors duration-300 hover:border-[#C5A059]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
      title={`${lunar.label} · ${lunar.illumination}% illumination`}
    >
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
        <svg
          aria-hidden="true"
          viewBox="0 0 40 40"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rotating engraved astrolabe degree ring */}
          <g
            style={{
              transform: `rotate(${dialAngle}deg)`,
              transformOrigin: "20px 20px",
              transition: "transform 850ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <circle
              cx="20"
              cy="20"
              r="18"
              stroke="#C5A059"
              strokeOpacity="0.45"
              strokeWidth="0.9"
              strokeDasharray="1.5 3"
            />
            <line x1="20" y1="1.5" x2="20" y2="5.5" stroke="#C5A059" strokeWidth="1.1" />
            <line x1="20" y1="34.5" x2="20" y2="38.5" stroke="#8A6D3B" strokeWidth="0.9" />
            <line x1="1.5" y1="20" x2="5.5" y2="20" stroke="#8A6D3B" strokeWidth="0.9" />
            <line x1="34.5" y1="20" x2="38.5" y2="20" stroke="#8A6D3B" strokeWidth="0.9" />
          </g>

          {/* Moon shadow disc */}
          <circle
            cx="20"
            cy="20"
            r="10.5"
            fill="#1C1917"
            stroke="#8A6D3B"
            strokeOpacity="0.65"
            strokeWidth="0.8"
          />

          {/* Lit lunar surface */}
          {lunar.litPath && (
            <path d={lunar.litPath} fill="#E8E2D5" fillOpacity="0.92" />
          )}

          {/* Subtle tarnished brass highlight ring */}
          <circle
            cx="20"
            cy="20"
            r="10.5"
            stroke="#C5A059"
            strokeOpacity="0.35"
            strokeWidth="0.7"
          />
        </svg>
      </span>

      <span className="hidden sm:flex flex-col leading-tight">
        <span className="font-serif text-xs font-medium text-[#E8E2D5] group-hover:text-[#C5A059] transition-colors">
          {lunar.label}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#9E9689] tabular-nums">
          {lunar.illumination}% · Day {lunar.ageDay}
        </span>
      </span>

      <span className="sm:hidden font-mono text-[10px] uppercase tracking-[0.14em] text-[#C5A059] tabular-nums">
        {lunar.illumination}%
      </span>
    </button>
  );
}
