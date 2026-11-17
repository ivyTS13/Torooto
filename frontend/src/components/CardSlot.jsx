import React, { useEffect, useCallback } from "react";
import {
  motion as Motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import useDrawerStore from "../stores/pileStore";
import { preloadImage } from "../utils/imagePreload";
import { toRomanNumeral } from "../utils/romanNumerals";
import CardBackMotif from "./common/CardBackMotif";
import RegistrationMarks from "./common/RegistrationMarks";

const RITUAL_EASE = [0.22, 1, 0.36, 1];
const TILT_SPRING = { stiffness: 180, damping: 24, mass: 0.5 };

const CardSlot = React.memo(function CardSlot({ index }) {
  const card = useDrawerStore((state) => state.drawnCards[index]);
  const isFlipped = useDrawerStore((state) =>
    card ? Boolean(state.flippedCards[card.card_id]) : false,
  );
  const toggleFlip = useDrawerStore((state) => state.toggleFlip);
  const romanPosition = toRomanNumeral(index + 1);
  const prefersReducedMotion = useReducedMotion();

  // Pointer-tracked foil tilt and specular glint driven outside React state
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const rawTiltX = useTransform(pointerY, [0, 100], [5, -5]);
  const rawTiltY = useTransform(pointerX, [0, 100], [-6, 6]);
  const tiltX = useSpring(rawTiltX, TILT_SPRING);
  const tiltY = useSpring(rawTiltY, TILT_SPRING);
  const glintGradient = useMotionTemplate`radial-gradient(240px circle at ${pointerX}% ${pointerY}%, rgba(232, 226, 213, 0.14), rgba(197, 160, 89, 0.12) 38%, transparent 72%)`;

  useEffect(() => {
    if (card?.image_url) {
      preloadImage(card.image_url);
    }
  }, [card?.image_url]);

  const handlePointerMove = useCallback(
    (e) => {
      if (prefersReducedMotion || e.pointerType !== "mouse") return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      pointerX.set(Math.min(100, Math.max(0, px)));
      pointerY.set(Math.min(100, Math.max(0, py)));
    },
    [prefersReducedMotion, pointerX, pointerY],
  );

  const handlePointerLeave = useCallback(() => {
    pointerX.set(50);
    pointerY.set(50);
  }, [pointerX, pointerY]);

  const handleFlip = useCallback(() => {
    if (!card) return;
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(10);
    }
    toggleFlip(card.card_id);
  }, [card, toggleFlip]);

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative w-32 sm:w-36 lg:w-44 aspect-[3/5]"
        style={{ perspective: "1200px" }}
      >
        {!card && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: RITUAL_EASE }}
            className="folio-plate folio-inset group absolute inset-0 rounded-[4px] overflow-hidden"
          >
            <RegistrationMarks />
            <div className="relative h-full flex flex-col items-center justify-center px-3 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[#C5A059]/30 bg-[#1C1917]">
                <span className="font-display text-sm text-[#C5A059]">
                  {romanPosition}
                </span>
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E9689] tabular-nums">
                Slot {index + 1}
              </p>
            </div>
          </Motion.div>
        )}

        {card && (
          <Motion.div
            className="h-full w-full"
            style={
              prefersReducedMotion
                ? { transformStyle: "preserve-3d" }
                : {
                    rotateX: tiltX,
                    rotateY: tiltY,
                    transformStyle: "preserve-3d",
                  }
            }
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <Motion.button
              type="button"
              layoutId={`card-${card.card_id}`}
              aria-pressed={isFlipped}
              aria-label={
                card.isReversed
                  ? `${card.card_name} (Reversed), ${isFlipped ? "revealed" : "face down"}`
                  : `${card.card_name}, ${isFlipped ? "revealed" : "face down"}`
              }
              className="absolute inset-0 w-full h-full appearance-none bg-transparent border-0 p-0 text-left cursor-pointer will-change-transform group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059] rounded-[4px]"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.72, ease: RITUAL_EASE }}
              whileHover={prefersReducedMotion ? undefined : { y: -6 }}
              onClick={handleFlip}
            >
              {/* Card Back Face */}
              <span
                className="block absolute inset-0 rounded-[4px] overflow-hidden border border-[#C5A059]/40 bg-[#141218] shadow-[0_18px_40px_-12px_rgba(11,10,14,0.85)] group-hover:border-[#C5A059]/75 transition-colors duration-500 ease-ritual"
                style={{ backfaceVisibility: "hidden" }}
              >
                <CardBackMotif romanNumeral={romanPosition} />
                <RegistrationMarks />
                {!prefersReducedMotion && (
                  <Motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: glintGradient }}
                  />
                )}
              </span>

              {/* Card Front Face */}
              <span
                className={`flex flex-col absolute inset-0 rounded-[4px] overflow-hidden border bg-[#141218] p-1.5 shadow-[0_18px_40px_-12px_rgba(11,10,14,0.88)] transition-colors duration-500 ${
                  card.isReversed
                    ? "border-[#8B3A32]/70 group-hover:border-[#C5A059]/65"
                    : "border-[#C5A059]/45 group-hover:border-[#C5A059]/80"
                }`}
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                }}
              >
                <RegistrationMarks tone={card.isReversed ? "oxblood" : "gold"} />

                {/* Specular gold-leaf glint across revealed artwork */}
                {!prefersReducedMotion && (
                  <Motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: glintGradient }}
                  />
                )}

                {/* Artwork Well (only this well rotates on Reversed cards) */}
                <span className="relative flex-1 min-h-0 w-full overflow-hidden rounded-[2px] border border-[#8A6D3B]/45 bg-[#0B0A0E]">
                  <span
                    className={`block h-full w-full ${
                      card.isReversed ? "rotate-180" : ""
                    }`}
                  >
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt={card.card_name}
                        width={360}
                        height={600}
                        decoding="sync"
                        fetchPriority="high"
                        className="w-full h-full object-cover transition-opacity duration-500"
                      />
                    ) : (
                      <span className="flex h-full w-full flex-col items-center justify-center bg-[#1C1917] px-2 text-center">
                        <span className="font-display text-lg text-[#C5A059]">
                          {romanPosition}
                        </span>
                        <span className="mt-1 font-serif text-xs text-[#9E9689]">
                          {card.card_name}
                        </span>
                      </span>
                    )}
                  </span>

                  {/* Upright Dried Oxblood REVERSED badge */}
                  {card.isReversed && (
                    <span className="absolute top-2 right-2 z-10 rounded-[2px] border border-[#8B3A32] bg-[#5E1914] px-1.5 py-0.5 font-mono text-[8px] font-medium uppercase tracking-[0.16em] text-[#E8E2D5] shadow-sm">
                      REVERSED
                    </span>
                  )}
                </span>

                {/* Upright Engraved Nameplate */}
                <span className="mt-1.5 flex items-center justify-between gap-1.5 border-t border-[#C5A059]/25 px-1 pt-1">
                  <span className="font-display text-[10px] tracking-[0.16em] text-[#C5A059] shrink-0">
                    {romanPosition}
                  </span>
                  <span className="font-serif text-[12px] font-medium tracking-wide text-[#E8E2D5] truncate">
                    {card.card_name}
                  </span>
                </span>
              </span>
            </Motion.button>
          </Motion.div>
        )}
      </div>
    </div>
  );
});

export default CardSlot;
