import React, { useId } from "react";

/**
 * Single fixed viewport SVG noise grain overlay for tactile parchment/velvet materiality.
 * Kept fixed with pointer-events-none so scrolling containers never trigger repaints.
 */
export default function FilmGrainOverlay() {
  const filterId = useId();

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 pointer-events-none opacity-[0.035]"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </div>
  );
}
