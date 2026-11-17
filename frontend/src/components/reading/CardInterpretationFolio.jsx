import React from "react";
import { motion as Motion } from "framer-motion";
import { toRomanNumeral } from "../../utils/romanNumerals";
import RegistrationMarks from "../common/RegistrationMarks";

const RITUAL_EASE = [0.22, 1, 0.36, 1];

const formatKeywords = (keywords) => {
  if (!keywords) return "None recorded";
  if (Array.isArray(keywords)) return keywords.join(", ");
  return String(keywords);
};

export default function CardInterpretationFolio({ card, index = 0 }) {
  if (!card) return null;

  const cardName = card.card_name || card.name || "Untitled Card";
  const meta = card.card_metadata || {};
  const isReversed = Boolean(card.isReversed ?? card.reversed_card);
  const romanPosition = toRomanNumeral(index + 1);

  return (
    <Motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: Math.min(index, 8) * 0.1,
        ease: RITUAL_EASE,
      }}
      className="folio-plate folio-inset group relative rounded-sm p-5 sm:p-8 flex flex-col lg:flex-row gap-6 md:gap-9 items-start"
    >
      <RegistrationMarks size="md" tone={isReversed ? "oxblood" : "gold"} />
      {/* Left Plate Image Container */}
      <div className="relative w-44 sm:w-56 lg:w-64 xl:w-72 aspect-[3/5] shrink-0 self-center lg:self-start rounded-sm border border-[#8A6D3B]/45 bg-[#0B0A0E] p-2 shadow-cast">
        <div
          className={`h-full w-full overflow-hidden rounded-[2px] ${
            isReversed ? "rotate-180" : ""
          }`}
        >
          {card.image_url ? (
            <img
              src={card.image_url}
              alt={cardName}
              width={320}
              height={533}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[#1C1917] p-4 text-center">
              <span className="font-display text-xl text-[#C5A059]">
                {romanPosition}
              </span>
              <span className="mt-2 font-serif text-sm text-[#9E9689]">
                {cardName}
              </span>
            </div>
          )}
        </div>

        {isReversed && (
          <span className="absolute top-3.5 right-3.5 z-10 rounded-[2px] border border-[#8B3A32] bg-[#5E1914] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#E8E2D5]">
            REVERSED
          </span>
        )}
      </div>

      {/* Right Reading Details */}
      <div className="flex-1 min-w-0 w-full space-y-6">
        <header className="border-b border-[#C5A059]/20 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#C5A059] tabular-nums">
              Position {romanPosition}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#9E9689] tabular-nums">
              Slot #{index + 1}
            </span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl tracking-[0.06em] text-[#E8E2D5] text-balance">
            {cardName}
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {card.card_suit && (
              <span className="rounded-sm border border-[#C5A059]/25 bg-[#1C1917] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#E8E2D5]">
                {card.card_suit}
              </span>
            )}
            <span className="rounded-sm border border-[#8A6D3B]/30 bg-[#1C1917] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#9E9689]">
              {meta.element_zodiac || "Classic Correspondence"}
            </span>
            {isReversed && (
              <span className="rounded-sm border border-[#8B3A32] bg-[#5E1914]/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#E8E2D5]">
                Reversed Orientation
              </span>
            )}
          </div>
        </header>

        {/* Upright & Shadow Keyword Wells */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`rounded-sm border p-4 ${
              !isReversed
                ? "border-[#C5A059]/45 bg-[#1C1917]"
                : "border-[#C5A059]/20 bg-[#1C1917]/60"
            }`}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C5A059] block mb-1.5">
              Upright Keywords
            </span>
            <p className="font-sans text-sm text-[#E8E2D5]/90 leading-relaxed max-w-[65ch]">
              {formatKeywords(meta.upright_keywords)}
            </p>
          </div>

          <div
            className={`rounded-sm border p-4 ${
              isReversed
                ? "border-[#8B3A32] bg-[#5E1914]/30"
                : "border-[#5E1914]/50 bg-[#5E1914]/15"
            }`}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9A49A] block mb-1.5">
              Shadow / Reversed Keywords
            </span>
            <p className="font-sans text-sm text-[#E8E2D5]/90 leading-relaxed max-w-[65ch]">
              {formatKeywords(meta.reversed_keywords)}
            </p>
          </div>
        </div>

        {/* Full Interpretations */}
        <div className="space-y-5 pt-2">
          <div>
            <h4 className="font-display text-xs uppercase tracking-[0.18em] text-[#C5A059] mb-2">
              Upright Meaning
            </h4>
            <p className="font-serif text-base sm:text-[17px] text-[#E8E2D5]/90 leading-relaxed max-w-[65ch]">
              {meta.upright_meaning || "No upright interpretation recorded."}
            </p>
          </div>

          <div className="border-t border-[#5E1914]/45 pt-4">
            <h4 className="font-display text-xs uppercase tracking-[0.18em] text-[#C9A49A] mb-2">
              Reversed / Shadow Meaning
            </h4>
            <p className="font-serif italic text-base sm:text-[17px] text-[#9E9689] leading-relaxed max-w-[65ch]">
              {meta.reversed_meaning || "No reversed interpretation recorded."}
            </p>
          </div>
        </div>
      </div>
    </Motion.article>
  );
}
