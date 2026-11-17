import React, { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Save, RotateCcw, X, SlidersHorizontal, Plus, Minus } from "lucide-react";
import useDrawerStore from "../stores/pileStore";

const RITUAL_EASE = [0.22, 1, 0.36, 1];

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const numCards = useDrawerStore((state) => state.numCards);
  const drawMode = useDrawerStore((state) => state.drawMode);
  const allowReversed = useDrawerStore((state) => state.allowReversed);
  const setSettings = useDrawerStore((state) => state.setSettings);
  const startDrawSequence = useDrawerStore((state) => state.startDrawSequence);
  const savePile = useDrawerStore((state) => state.savePile);
  const resetBoard = useDrawerStore((state) => state.resetBoard);
  const drawnCards = useDrawerStore((state) => state.drawnCards);
  const isSaved = useDrawerStore((state) => state.isSaved);
  const isShuffling = useDrawerStore((state) => state.isShuffling);
  const isLoading = useDrawerStore((state) => state.isLoading);
  const error = useDrawerStore((state) => state.error);

  const isBoardFull = drawnCards.length > 0 && !drawnCards.includes(null);

  const handleDecrement = () => setSettings({ numCards: Math.max(1, numCards - 1) });
  const handleIncrement = () => setSettings({ numCards: Math.min(10, numCards + 1) });

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-[#0B0A0E]/55"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="relative z-40">
        <button
          type="button"
          aria-label="Open spread settings"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="folio-plate folio-inset inline-flex items-center gap-2.5 rounded-sm px-3.5 py-2 sm:px-4 sm:py-2.5 text-[#E8E2D5] transition-colors duration-300 ease-ritual hover:border-[#C5A059]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
        >
          <SlidersHorizontal size={15} className="text-[#C5A059]" />
          <span className="font-display text-xs uppercase tracking-[0.16em]">
            Spread
          </span>
          <span className="border-l border-[#C5A059]/30 pl-2 font-mono text-[11px] text-[#C5A059] tabular-nums">
            {numCards}
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <Motion.div
              role="region"
              aria-label="Spread configuration"
              initial={{ opacity: 0, scale: 0.96, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -6 }}
              transition={{ duration: 0.35, ease: RITUAL_EASE }}
              style={{ transformOrigin: "top left" }}
              className="folio-plate folio-inset absolute top-full left-0 mt-2.5 w-[min(320px,calc(100vw-2rem))] rounded-sm overflow-hidden p-5 sm:p-6 flex flex-col gap-5 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3.5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C5A059]">
                    Table Settings
                  </p>
                  <h2 className="font-display text-base uppercase tracking-[0.12em] text-[#E8E2D5] mt-0.5">
                    Spread Controls
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close spread settings"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-sm border border-transparent text-[#9E9689] hover:text-[#E8E2D5] hover:border-[#C5A059]/30 hover:bg-[#1C1917] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9E9689]">
                    Cards
                  </span>
                  <div className="flex items-center bg-[#1C1917] border border-[#C5A059]/30 rounded-sm p-0.5">
                    <button
                      type="button"
                      aria-label="Decrease card count"
                      onClick={handleDecrement}
                      className="w-7 h-7 flex items-center justify-center rounded-sm text-[#C5A059] hover:bg-[#141218] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-9 text-center font-mono text-sm font-medium text-[#E8E2D5] tabular-nums">
                      {numCards}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase card count"
                      onClick={handleIncrement}
                      className="w-7 h-7 flex items-center justify-center rounded-sm text-[#C5A059] hover:bg-[#141218] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9E9689]">
                    Selection
                  </span>
                  <div
                    role="group"
                    aria-label="Draw mode"
                    className="relative flex bg-[#1C1917] border border-[#C5A059]/30 rounded-sm p-0.5"
                  >
                    <Motion.div
                      aria-hidden="true"
                      className="absolute top-0.5 bottom-0.5 left-0.5 w-[72px] bg-[#C5A059] rounded-[2px] z-0"
                      initial={false}
                      animate={{ x: drawMode === "auto" ? 0 : 72 }}
                      transition={{ duration: 0.35, ease: RITUAL_EASE }}
                    />
                    <button
                      type="button"
                      aria-pressed={drawMode === "auto"}
                      onClick={() => setSettings({ drawMode: "auto" })}
                      className={`relative z-10 w-[72px] py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors rounded-[2px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E8E2D5] ${
                        drawMode === "auto"
                          ? "text-[#0B0A0E] font-medium"
                          : "text-[#9E9689] hover:text-[#E8E2D5]"
                      }`}
                    >
                      Auto
                    </button>
                    <button
                      type="button"
                      aria-pressed={drawMode === "manual"}
                      onClick={() => setSettings({ drawMode: "manual" })}
                      className={`relative z-10 w-[72px] py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors rounded-[2px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E8E2D5] ${
                        drawMode === "manual"
                          ? "text-[#0B0A0E] font-medium"
                          : "text-[#9E9689] hover:text-[#E8E2D5]"
                      }`}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9E9689]">
                    Reversals
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={allowReversed}
                    aria-label="Toggle reversed cards"
                    onClick={() => setSettings({ allowReversed: !allowReversed })}
                    className={`w-12 h-6 rounded-sm relative transition-colors duration-300 border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059] ${
                      allowReversed
                        ? "bg-[#C5A059]/25 border-[#C5A059]/65"
                        : "bg-[#1C1917] border-[#C5A059]/25"
                    }`}
                  >
                    <Motion.span
                      aria-hidden="true"
                      className={`block w-4 h-4 rounded-[2px] absolute top-[3px] left-1 ${
                        allowReversed ? "bg-[#C5A059]" : "bg-[#8A6D3B]/60"
                      }`}
                      initial={false}
                      animate={{ x: allowReversed ? 22 : 0 }}
                      transition={{ duration: 0.35, ease: RITUAL_EASE }}
                    />
                  </button>
                </div>
              </div>

              <div className="brass-divider" />

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    startDrawSequence();
                    setIsOpen(false);
                  }}
                  disabled={isShuffling}
                  className="w-full py-2.5 px-4 rounded-sm bg-[#C5A059] hover:bg-[#D2B06B] text-[#0B0A0E] font-display text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ease-ritual active:scale-[0.99] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E2D5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141218]"
                >
                  {isShuffling ? "Shuffling…" : "Draw Cards"}
                </button>

                {isBoardFull && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={savePile}
                        disabled={isSaved || isLoading}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-sm font-mono text-[11px] uppercase tracking-[0.14em] transition-colors border disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059] ${
                          isSaved
                            ? "bg-[#1C1917] text-[#C5A059] border-[#C5A059]/50"
                            : "bg-[#1C1917] text-[#E8E2D5] border-[#C5A059]/35 hover:border-[#C5A059]/65 hover:text-[#C5A059]"
                        }`}
                      >
                        <Save size={13} />
                        <span>
                          {isLoading ? "Saving…" : isSaved ? "Saved" : "Save"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={resetBoard}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-sm border border-[#C5A059]/25 bg-[#1C1917] py-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#9E9689] hover:border-[#8B3A32] hover:bg-[#5E1914]/35 hover:text-[#E8E2D5] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                      >
                        <RotateCcw size={13} />
                        <span>Clear</span>
                      </button>
                    </div>

                    {error && (
                      <div
                        role="alert"
                        aria-live="polite"
                        className="mt-1 rounded-sm border border-[#8B3A32] bg-[#5E1914]/35 p-2 text-center text-xs text-[#E8E2D5]"
                      >
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
