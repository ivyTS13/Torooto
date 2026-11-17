import React from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import FilmGrainOverlay from "../components/common/FilmGrainOverlay";

const NotFound = () => {
  return (
    <main className="tarot-canvas min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12 text-[#E8E2D5]">
      <FilmGrainOverlay />
      <Motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="folio-plate folio-inset relative z-10 flex max-w-md w-full flex-col items-center rounded-sm p-8 sm:p-12 text-center"
      >
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-sm border border-[#C5A059]/35 bg-[#1C1917]">
          <Compass size={28} strokeWidth={1.35} className="text-[#C5A059]" />
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#9E9689] tabular-nums mb-2">
          Plate 404
        </p>

        <h1 className="font-display text-3xl sm:text-4xl tracking-[0.12em] uppercase text-[#E8E2D5] mb-4">
          Page Not Found
        </h1>

        <p className="font-serif text-base text-[#9E9689] leading-relaxed max-w-[44ch] mb-8">
          The page or archival record you requested could not be located at this address.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-sm bg-[#C5A059] hover:bg-[#D2B06B] px-7 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.18em] text-[#0B0A0E] transition-colors duration-300 ease-ritual focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E2D5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141218]"
        >
          Return to Reading Room
        </Link>
      </Motion.div>
    </main>
  );
};

export default NotFound;
