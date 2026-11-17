import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { X, BookOpen } from "lucide-react";
import CardInterpretationFolio from "./reading/CardInterpretationFolio";

const RITUAL_EASE = [0.22, 1, 0.36, 1];

export default function PileReadingModal({ drawnCards = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const validCards = useMemo(() => {
    return Array.isArray(drawnCards)
      ? drawnCards.filter((card) => card && (card.card_name || card.name))
      : [];
  }, [drawnCards]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (validCards.length === 0) return null;

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: RITUAL_EASE }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-6 bg-[#0B0A0E]/85 overscroll-contain"
          onClick={() => setIsOpen(false)}
        >
          <Motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="interpretation-folio-title"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.45, ease: RITUAL_EASE }}
            style={{ overscrollBehavior: "contain" }}
            className="folio-plate folio-inset relative w-full h-full md:h-auto md:max-h-[90dvh] max-w-6xl flex flex-col cursor-auto rounded-none md:rounded-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="relative z-10 px-5 py-4 md:px-8 md:py-5 flex items-center justify-between border-b border-[#C5A059]/25 bg-[#1C1917]/65">
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#C5A059]/35 bg-[#141218] text-[#C5A059] shrink-0">
                  <BookOpen size={18} strokeWidth={1.5} />
                </span>
                <div className="min-w-0">
                  <h2
                    id="interpretation-folio-title"
                    className="font-display text-lg md:text-2xl tracking-[0.1em] uppercase text-[#E8E2D5] truncate"
                  >
                    Spread Interpretations
                  </h2>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#9E9689] mt-0.5 tabular-nums">
                    {validCards.length} Card{validCards.length !== 1 ? "s" : ""} Drawn
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-sm border border-[#C5A059]/25 bg-[#141218] text-[#9E9689] hover:text-[#E8E2D5] hover:border-[#C5A059]/60 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                aria-label="Close interpretation dialog"
              >
                <X size={18} />
              </button>
            </header>

            <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain px-4 py-6 md:px-8 md:py-8 space-y-6">
              {validCards.map((card, idx) => (
                <CardInterpretationFolio
                  key={card.card_id || card.id || idx}
                  card={card}
                  index={idx}
                />
              ))}
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.45, ease: RITUAL_EASE }}
        className="fixed bottom-6 right-5 md:bottom-8 md:right-8 z-40"
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="folio-plate folio-inset group inline-flex items-center gap-3 rounded-sm px-5 py-3 text-[#E8E2D5] hover:border-[#C5A059]/65 transition-colors duration-300 ease-ritual focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
        >
          <BookOpen size={16} className="text-[#C5A059]" strokeWidth={1.6} />
          <span className="font-display text-xs uppercase tracking-[0.18em]">
            Interpretations
          </span>
          <span className="border-l border-[#C5A059]/30 pl-2.5 font-mono text-xs text-[#C5A059] tabular-nums">
            {validCards.length}
          </span>
        </button>
      </Motion.div>

      {typeof document !== "undefined" ? createPortal(modal, document.body) : null}
    </>
  );
}
