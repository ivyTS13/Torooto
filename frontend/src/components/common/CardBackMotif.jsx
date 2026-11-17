import React from "react";

/**
 * Vintage woodcut-inspired vector motif for Tarot card backs.
 * Renders cleanly with hairline Antique Gold strokes over Charred Velvet stock.
 */
export default function CardBackMotif({ romanNumeral = "I", compact = false }) {
  return (
    <span className="relative block h-full w-full overflow-hidden bg-[#141218] select-none pointer-events-none">
      {/* Outer perimeter hairline */}
      <span className="block absolute inset-[5px] border border-[#C5A059]/30 rounded-[2px]" />
      {/* Inner recessed double-line plate frame */}
      <span className="block absolute inset-[9px] border border-[#8A6D3B]/35 rounded-[1px]" />

      {/* Center geometric celestial engraving */}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 200"
        className="absolute inset-0 h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cardinal guide rules */}
        <line x1="60" y1="22" x2="60" y2="178" stroke="#8A6D3B" strokeOpacity="0.3" strokeWidth="0.8" />
        <line x1="22" y1="100" x2="98" y2="100" stroke="#8A6D3B" strokeOpacity="0.3" strokeWidth="0.8" />

        {/* Central diamond */}
        <polygon
          points="60,46 88,100 60,154 32,100"
          stroke="#C5A059"
          strokeOpacity="0.45"
          strokeWidth="1"
          fill="#1C1917"
          fillOpacity="0.45"
        />

        {/* Astrolabe rings */}
        <circle cx="60" cy="100" r="24" stroke="#C5A059" strokeOpacity="0.55" strokeWidth="1" />
        <circle cx="60" cy="100" r="15" stroke="#8A6D3B" strokeOpacity="0.5" strokeWidth="0.8" />

        {/* Central oxblood & gold seal */}
        <circle cx="60" cy="100" r="4.5" fill="#5E1914" stroke="#C5A059" strokeWidth="0.9" />
        <circle cx="60" cy="100" r="1.4" fill="#E8E2D5" />

        {/* Corner registration marks */}
        <circle cx="24" cy="24" r="1.5" fill="#8A6D3B" fillOpacity="0.65" />
        <circle cx="96" cy="24" r="1.5" fill="#8A6D3B" fillOpacity="0.65" />
        <circle cx="24" cy="176" r="1.5" fill="#8A6D3B" fillOpacity="0.65" />
        <circle cx="96" cy="176" r="1.5" fill="#8A6D3B" fillOpacity="0.65" />
      </svg>

      {!compact && (
        <>
          <span className="block absolute top-3.5 left-0 right-0 text-center">
            <span className="font-display text-[9px] tracking-[0.28em] text-[#C5A059]/80 uppercase">
              {romanNumeral}
            </span>
          </span>
          <span className="block absolute bottom-3.5 left-0 right-0 text-center">
            <span className="font-display text-[8px] tracking-[0.26em] text-[#8A6D3B]/90 uppercase">
              Torooto
            </span>
          </span>
        </>
      )}
    </span>
  );
}
