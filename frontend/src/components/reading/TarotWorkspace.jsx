import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import SettingsPanel from "../SettingPanel";
import CardSlot from "../CardSlot";
import SemicircleDeck from "../SemicircleDeck";
import PileReadingModal from "../PileReadingModal";
import LunarPhaseDial from "../common/LunarPhaseDial";
import RegistrationMarks from "../common/RegistrationMarks";
import useDrawerStore from "../../stores/pileStore";

const RITUAL_EASE = [0.22, 1, 0.36, 1];

/**
 * Isolated ambient reading cloth veil reacting gently to upright vs. reversed arcana reveals.
 * Keeps `flippedCards` subscription outside TarotWorkspace card grid trees.
 */
function SpreadMoodAtmosphere({ drawnCards, embedded }) {
  const flippedCards = useDrawerStore((state) => state.flippedCards);

  const revealedCards = drawnCards.filter(
    (card) => card && flippedCards[card.card_id],
  );
  const revealedCount = revealedCards.length;
  const reversedCount = revealedCards.filter((card) => card.isReversed).length;
  const isShadowDominant =
    revealedCount > 0 && reversedCount >= Math.ceil(revealedCount / 2);

  const positionClass = embedded ? "absolute inset-0" : "fixed inset-0";

  return (
    <div
      aria-hidden="true"
      className={`${positionClass} pointer-events-none z-0 overflow-hidden`}
    >
      {/* Upright Candlelit Antique Gold spotlight */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-ritual ${
          revealedCount > 0 && !isShadowDominant ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 42%, rgba(197, 160, 89, 0.085), transparent 72%)",
        }}
      />

      {/* Reversed-dominant Dried Oxblood cloth undertone */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-ritual ${
          isShadowDominant ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 42%, rgba(94, 25, 20, 0.24), rgba(197, 160, 89, 0.04) 48%, transparent 75%)",
        }}
      />
    </div>
  );
}

export default function TarotWorkspace({ embedded = false }) {
  const fullDeck = useDrawerStore((state) => state.fullDeck);
  const fetchFullDeck = useDrawerStore((state) => state.fetchFullDeck);
  const drawnCards = useDrawerStore((state) => state.drawnCards);
  const availableCards = useDrawerStore((state) => state.availableCards);
  const isShuffling = useDrawerStore((state) => state.isShuffling);
  const error = useDrawerStore((state) => state.error);
  const isFetchingDeck = useDrawerStore((state) => state.isFetchingDeck);
  const cancelDrawSequence = useDrawerStore((state) => state.cancelDrawSequence);

  useEffect(() => {
    if (fullDeck.length === 0) fetchFullDeck();
    return () => cancelDrawSequence();
  }, [fullDeck.length, fetchFullDeck, cancelDrawSequence]);

  const hasDrawnCards = drawnCards.length > 0;
  const drawnCount = drawnCards.filter(Boolean).length;
  const isDonePicking =
    hasDrawnCards && drawnCards.every((card) => card !== null && card !== undefined);
  const isManualDeckVisible = !isDonePicking && availableCards.length > 0;

  if (isFetchingDeck) {
    return (
      <div
        className={`${
          embedded ? "h-full min-h-[50dvh]" : "min-h-[65dvh]"
        } flex flex-col items-center justify-center gap-4 text-[#E8E2D5]`}
      >
        <Loader2 className="w-7 h-7 animate-spin text-[#C5A059]" strokeWidth={1.5} />
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#9E9689]">
          Loading deck…
        </span>
      </div>
    );
  }

  return (
    <div
      className={
        embedded
          ? "relative flex flex-col h-full min-h-[65dvh] overflow-hidden rounded-sm border border-[#C5A059]/20 bg-[#0B0A0E] text-[#E8E2D5]"
          : "relative w-full flex flex-col flex-1"
      }
    >
      <SpreadMoodAtmosphere drawnCards={drawnCards} embedded={embedded} />

      {/* Top Workspace Control Bar (non-overlapping across all viewports) */}
      <div
        className={`relative w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 z-40 ${
          embedded ? "px-4 pt-4" : "px-0 sm:px-2 pt-1 pb-4"
        }`}
      >
        <SettingsPanel />
        <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
          <LunarPhaseDial pulseStep={drawnCount} />
          {hasDrawnCards && (
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#9E9689] tabular-nums">
              {drawnCount} / {drawnCards.length} Drawn
            </p>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="relative w-full max-w-lg mx-auto px-4 mb-4 z-30"
        >
          <div className="rounded-sm border border-[#8B3A32] bg-[#5E1914]/40 px-4 py-2 text-[#E8E2D5] text-xs md:text-sm text-center">
            {error}
          </div>
        </div>
      )}

      {isShuffling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0A0E]/82 transition-opacity duration-500">
          <Motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: RITUAL_EASE }}
            className="folio-plate folio-inset relative flex flex-col items-center gap-5 rounded-sm px-9 sm:px-12 py-8 sm:py-9"
          >
            <RegistrationMarks size="md" />

            {/* Concentric Brass Astrolabe Shuffle Emblem */}
            <div className="relative flex h-16 w-16 items-center justify-center">
              <Motion.svg
                aria-hidden="true"
                viewBox="0 0 64 64"
                className="h-full w-full"
                fill="none"
                initial={{ rotate: 0 }}
                animate={{ rotate: 180 }}
                transition={{ duration: 1.4, ease: RITUAL_EASE }}
              >
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#C5A059"
                  strokeOpacity="0.6"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <polygon
                  points="32,10 54,32 32,54 10,32"
                  stroke="#8A6D3B"
                  strokeOpacity="0.7"
                  strokeWidth="0.9"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="14"
                  stroke="#C5A059"
                  strokeOpacity="0.85"
                  strokeWidth="1"
                />
                <circle cx="32" cy="32" r="3" fill="#C5A059" />
              </Motion.svg>
            </div>

            <p className="font-display text-xs uppercase tracking-[0.28em] text-[#E8E2D5]">
              Shuffling the Deck…
            </p>
          </Motion.div>
        </div>
      )}

      <div
        className={`relative z-10 flex-1 flex flex-col items-center ${
          embedded ? "overflow-y-auto px-3 sm:px-6 pt-4" : "px-0 sm:px-4 pt-4 md:pt-8"
        } ${
          isManualDeckVisible
            ? "justify-start pb-56 sm:pb-72"
            : isDonePicking
              ? "justify-center pb-24 sm:pb-28"
              : "justify-center pb-12"
        }`}
      >
        {!hasDrawnCards ? (
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: RITUAL_EASE }}
            className="relative flex flex-col items-center text-center px-6 sm:px-10 py-8 max-w-lg z-10"
          >
            <RegistrationMarks size="md" />
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-sm border border-[#C5A059]/35 bg-[#141218] shadow-[0_12px_28px_-10px_rgba(11,10,14,0.85)]">
              <span className="font-display text-sm tracking-[0.2em] text-[#C5A059]">
                0
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl tracking-[0.08em] uppercase text-[#E8E2D5] mb-4 text-balance">
              Draw Your Spread
            </h1>
            <p className="font-serif text-base md:text-lg text-[#9E9689] leading-relaxed max-w-[46ch] mb-7">
              Open Spread controls above to set your card count, automatic or manual draw mode, and reversed card orientation.
            </p>
            <div className="brass-divider w-36" />
          </Motion.div>
        ) : (
          <div className="relative flex flex-col items-center w-full max-w-7xl z-10 gap-6">
            {/* Engraved Brass Connection Thread linking multi-card desktop spreads */}
            {drawnCards.length >= 2 && (
              <svg
                aria-hidden="true"
                viewBox="0 0 800 32"
                preserveAspectRatio="none"
                className="hidden md:block pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[72%] max-w-4xl h-8 z-0"
                fill="none"
              >
                <Motion.line
                  x1="20"
                  y1="16"
                  x2="780"
                  y2="16"
                  stroke="#C5A059"
                  strokeOpacity="0.24"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.85, ease: RITUAL_EASE }}
                />
                <circle cx="400" cy="16" r="3" fill="#141218" stroke="#C5A059" strokeOpacity="0.45" strokeWidth="1" />
              </svg>
            )}

            <div className="relative z-10 flex flex-wrap justify-center gap-3.5 sm:gap-7 lg:gap-12 w-full">
              {drawnCards.map((card, index) => (
                <CardSlot key={card?.card_id ?? index} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>

      {isDonePicking && <PileReadingModal drawnCards={drawnCards} />}

      <AnimatePresence>
        {!isDonePicking && (
          <Motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ duration: 0.5, ease: RITUAL_EASE }}
          >
            <SemicircleDeck />
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
