import React from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import FilmGrainOverlay from "../components/common/FilmGrainOverlay";

const ServerError = () => {
  return (
    <main className="tarot-canvas min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12 text-[#E8E2D5]">
      <FilmGrainOverlay />
      <Motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="folio-plate folio-inset relative z-10 flex max-w-md w-full flex-col items-center rounded-sm p-8 sm:p-12 text-center"
      >
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-sm border border-[#8B3A32] bg-[#5E1914]/35">
          <AlertTriangle size={28} strokeWidth={1.35} className="text-[#C9A49A]" />
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#C9A49A] tabular-nums mb-2">
          Error 500
        </p>

        <h1 className="font-display text-3xl sm:text-4xl tracking-[0.12em] uppercase text-[#E8E2D5] mb-4">
          Server Error
        </h1>

        <p className="font-serif text-base text-[#9E9689] leading-relaxed max-w-[44ch] mb-8">
          The service encountered an unexpected interruption while fulfilling your request. Try reloading the page or return to the reading table.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-sm bg-[#5E1914] hover:bg-[#74211B] border border-[#8B3A32] px-6 py-2.5 font-display text-xs uppercase tracking-[0.16em] text-[#E8E2D5] transition-colors duration-300 ease-ritual focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
          >
            Reload Page
          </button>
          <Link
            to="/"
            className="rounded-sm border border-[#C5A059]/35 bg-[#1C1917] hover:border-[#C5A059]/70 hover:text-[#C5A059] px-6 py-2.5 font-display text-xs uppercase tracking-[0.16em] text-[#E8E2D5] transition-colors duration-300 ease-ritual focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
          >
            Return Home
          </Link>
        </div>
      </Motion.div>
    </main>
  );
};

export default ServerError;
