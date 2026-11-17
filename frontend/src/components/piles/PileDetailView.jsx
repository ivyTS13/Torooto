import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Loader2, AlertCircle, Clock, ChevronLeft } from "lucide-react";
import { motion as Motion } from "framer-motion";
import usePileHistoryStore from "../../stores/usePileHistoryStore";
import CardInterpretationFolio from "../reading/CardInterpretationFolio";
import { toRomanNumeral } from "../../utils/romanNumerals";

const RITUAL_EASE = [0.22, 1, 0.36, 1];

const StaticCardSlot = ({ card, index }) => {
  if (!card) return null;
  const romanPosition = toRomanNumeral(index + 1);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.65,
        delay: Math.min(index, 8) * 0.08,
        ease: RITUAL_EASE,
      }}
      className="relative flex flex-col items-center group"
    >
      <div className="relative w-32 sm:w-36 lg:w-40 aspect-[3/5]">
        <div className="flex flex-col absolute inset-0 rounded-[4px] overflow-hidden border border-[#C5A059]/40 bg-[#141218] p-1.5 shadow-cast">
          <div className="relative flex-1 min-h-0 w-full overflow-hidden rounded-[2px] border border-[#8A6D3B]/45 bg-[#0B0A0E]">
            <div
              className={`h-full w-full ${
                card.reversed_card ? "rotate-180" : ""
              }`}
            >
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={card.card_name}
                  width={300}
                  height={500}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-[#1C1917] p-2 text-center">
                  <span className="font-display text-base text-[#C5A059]">
                    {romanPosition}
                  </span>
                </div>
              )}
            </div>

            {card.reversed_card && (
              <span className="absolute top-2 right-2 z-10 rounded-[2px] border border-[#8B3A32] bg-[#5E1914] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-[#E8E2D5]">
                REVERSED
              </span>
            )}
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-1.5 border-t border-[#C5A059]/25 px-1 pt-1">
            <span className="font-display text-[10px] tracking-[0.16em] text-[#C5A059] shrink-0">
              {romanPosition}
            </span>
            <span className="font-serif text-[12px] font-medium text-[#E8E2D5] truncate">
              {card.card_name}
            </span>
          </div>
        </div>
      </div>
    </Motion.div>
  );
};

export default function PileDetailView({ backPath = "/piles" }) {
  const { pileId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const piles = usePileHistoryStore((state) => state.piles);
  const currentPile = usePileHistoryStore((state) => state.currentPile);
  const fetchPileById = usePileHistoryStore((state) => state.fetchPileById);
  const isLoadingPile = usePileHistoryStore((state) => state.isLoadingPile);
  const pileError = usePileHistoryStore((state) => state.pileError);
  const clearCurrentPile = usePileHistoryStore((state) => state.clearCurrentPile);

  const pile = useMemo(() => {
    const safeId = String(pileId);
    const fromState = location.state?.pile;
    if (
      fromState &&
      (String(fromState.pile_id) === safeId || String(fromState.pileId) === safeId)
    ) {
      return fromState;
    }

    if (piles && piles.length > 0) {
      const match = piles.find(
        (p) => String(p.pile_id) === safeId || String(p.pileId) === safeId,
      );
      if (match) return match;
    }

    if (
      currentPile &&
      (String(currentPile.pile_id) === safeId || String(currentPile.pileId) === safeId)
    ) {
      return currentPile;
    }

    return null;
  }, [pileId, location.state, piles, currentPile]);

  useEffect(() => {
    if (!pile && pileId) {
      fetchPileById(pileId);
    }
  }, [pile, pileId, fetchPileById]);

  useEffect(() => {
    return () => {
      clearCurrentPile();
    };
  }, [clearCurrentPile]);

  const sortedCards = useMemo(() => {
    const cardsArray = pile?.cards || pile?.pile_contents;
    if (!cardsArray || !Array.isArray(cardsArray)) return [];
    return [...cardsArray].sort((a, b) => a.position - b.position);
  }, [pile]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoadingPile && !pile) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto text-[#E8E2D5] w-full">
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <Loader2 size={30} className="animate-spin text-[#C5A059]" strokeWidth={1.5} />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#9E9689]">
            Loading reading…
          </p>
        </div>
      </div>
    );
  }

  if (!pile || pileError) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto text-[#E8E2D5] w-full">
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="mb-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[#9E9689] hover:text-[#C5A059] transition-colors rounded-sm px-2 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
        >
          <ChevronLeft size={16} />
          <span>Back to Readings</span>
        </button>
        <div
          role="alert"
          className="folio-plate rounded-sm border-[#8B3A32] bg-[#5E1914]/25 py-16 px-6 flex flex-col items-center justify-center text-center"
        >
          <AlertCircle size={28} className="mb-3 text-[#C9A49A]" />
          <p className="font-serif text-lg text-[#E8E2D5]">
            {pileError || "Reading not found. Please return to your reading history."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto text-[#E8E2D5] w-full">
      <button
        type="button"
        onClick={() => navigate(backPath)}
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[#9E9689] hover:text-[#C5A059] transition-colors rounded-sm px-2 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
      >
        <ChevronLeft size={16} />
        <span>Back to Readings</span>
      </button>

      <header className="mb-10 pb-6 border-b border-[#C5A059]/20">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#C5A059] mb-2">
          Recorded Reading
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-[0.06em] text-[#E8E2D5] tabular-nums">
          Reading #{(pile.pile_id || pile.pileId)?.split("-")[0]}
        </h1>
        <div className="flex items-center gap-2 font-mono text-xs text-[#9E9689] mt-2 tabular-nums">
          <Clock size={14} className="text-[#8A6D3B]" />
          <span>{formatDate(pile.drawn_at)}</span>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="font-display text-base uppercase tracking-[0.16em] text-[#C5A059] mb-6">
          Spread Layout
        </h2>
        <div className="flex flex-wrap gap-5 sm:gap-8 justify-center md:justify-start">
          {sortedCards.map((card, idx) => (
            <StaticCardSlot
              key={card.pile_content_id || card.card_id || idx}
              card={card}
              index={idx}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="border-t border-[#C5A059]/20 pt-8">
          <h2 className="font-display text-base uppercase tracking-[0.16em] text-[#C5A059] mb-6">
            Card Interpretations
          </h2>
          <div className="space-y-6">
            {sortedCards.map((card, idx) => (
              <CardInterpretationFolio
                key={card.pile_content_id || card.card_id || idx}
                card={card}
                index={idx}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
