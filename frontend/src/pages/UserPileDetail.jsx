import React, { useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  Clock,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import UserLayout from "../components/User/UserLayout";
import usePileHistoryStore from "../stores/usePileHistoryStore";

/* ------------------------------------------------------------------ */
/* Static Card Slot – mimics CardSlot visual but takes card as prop   */
/* ------------------------------------------------------------------ */
const StaticCardSlot = ({ card, index }) => {
  if (!card) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative flex flex-col items-center group"
    >
      <div className="relative w-28 lg:w-36 aspect-[3/5]">
        {/* Card front – static (no flip) */}
        <div className="absolute inset-0 rounded-[20px] overflow-hidden bg-[#15162b] border border-amber-300/30 shadow-[0_10px_30px_rgba(20,20,60,.75)]">
          <div
            className={`absolute inset-0 flex items-center justify-center p-1 ${
              card.reversed_card ? "rotate-180" : ""
            }`}
          >
            {card.image_url ? (
              <img
                src={card.image_url}
                alt={card.card_name}
                loading="lazy"
                className="w-full h-full object-cover rounded-[16px]"
              />
            ) : (
              <Sparkles className="w-6 h-6 text-amber-200/50" />
            )}
          </div>

          {/* Gradient overlay on hover */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-b-[20px]" />

          {/* Card name on hover */}
          <div className="absolute bottom-4 left-0 right-0 text-center z-10 px-2 pointer-events-none opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-white/90 drop-shadow-md">
              {card.card_name} {card.reversed_card && "(REV)"}
            </span>
          </div>
        </div>
      </div>

      {/* Position indicator */}
      <span className="mt-2 text-[10px] font-mono text-purple-300/50 uppercase tracking-widest">
        #{index + 1}
      </span>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Card Detail Block – adapted from PileReadingModal                   */
/* ------------------------------------------------------------------ */
const CardDetail = ({ card, index }) => {
  const meta = card.card_metadata || {};
  const formatKeywords = (keywords) => {
    if (!keywords) return "N/A";
    if (Array.isArray(keywords)) return keywords.join(", ");
    return String(keywords);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="group relative bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 rounded-[2rem] p-5 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-10 items-start overflow-hidden backdrop-blur-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] hover:bg-white/[0.04]"
    >
      {/* Glowing orb */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Card index badge */}
      <div className="absolute top-5 right-6 text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-300/60 bg-indigo-950/50 border border-indigo-500/20 px-3 py-1.5 rounded-full shadow-inner z-10">
        Card #{index + 1}
      </div>

      {/* Card image */}
      <div className="w-full lg:w-72 xl:w-80 h-[360px] md:h-[480px] shrink-0 rounded-2xl bg-[#030308] border border-white/10 overflow-hidden shadow-2xl relative self-center lg:self-start group-hover:border-indigo-500/40 transition-colors duration-500">
        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] pointer-events-none z-10" />
        {card.image_url ? (
          <img
            src={card.image_url}
            alt={card.card_name}
            className="w-full h-full object-contain p-2"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <Sparkles size={28} className="text-indigo-400/50 mb-3" />
            <span className="text-xs font-bold text-indigo-200/50 uppercase tracking-widest">
              {card.card_name}
            </span>
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="flex-1 space-y-6 w-full relative z-10">
        <div>
          <h3 className="text-3xl md:text-4xl font-serif italic text-white/95 mb-4 drop-shadow-md">
            {card.card_name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {card.card_suit && (
              <span className="px-3.5 py-1.5 bg-black/40 text-indigo-200 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium border border-indigo-500/20">
                {card.card_suit}
              </span>
            )}
            <span className="px-3.5 py-1.5 bg-black/40 text-purple-200 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium border border-purple-500/20">
              {meta.element_zodiac || "Cosmic Element"}
            </span>
            {card.reversed_card && (
              <span className="px-3.5 py-1.5 bg-rose-950/40 text-rose-300 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium border border-rose-500/20">
                Reversed
              </span>
            )}
          </div>
        </div>

        {/* Keywords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/15">
            <span className="text-emerald-400 font-bold block text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <Sparkles size={12} /> Upright
            </span>
            <span className="text-gray-300/90 text-sm leading-relaxed">
              {formatKeywords(meta.upright_keywords)}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/15">
            <span className="text-rose-400 font-bold block text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              Shadow <Sparkles size={12} />
            </span>
            <span className="text-gray-300/90 text-sm leading-relaxed">
              {formatKeywords(meta.reversed_keywords)}
            </span>
          </div>
        </div>

        {/* Meanings */}
        <div className="space-y-5 pt-4 border-t border-white/5">
          <div>
            <h4 className="text-emerald-300/80 text-[11px] font-mono uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
              Radiance
            </h4>
            <p className="text-gray-300 text-sm md:text-base font-light leading-relaxed">
              {meta.upright_meaning || "No meaning recorded."}
            </p>
          </div>
          <div>
            <h4 className="text-rose-300/80 text-[11px] font-mono uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-rose-400 shadow-[0_0_5px_rgba(251,113,133,0.8)]" />
              Eclipse
            </h4>
            <p className="text-gray-400 text-sm md:text-base font-light italic leading-relaxed">
              {meta.reversed_meaning || "No meaning recorded."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Main Detail Page                                                    */
/* ------------------------------------------------------------------ */
export default function UserPileDetail() {
  const { pileId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Access existing piles from the store (already loaded in list)
  const { piles } = usePileHistoryStore();

  // 1. Try to get the pile from navigation state (passed from list)
  // 2. If not (e.g., page reload), search in the existing store's piles
  const pile = useMemo(() => {
    const fromState = location.state?.pile;
    if (fromState && fromState.pile_id === pileId) return fromState;

    if (piles && piles.length > 0) {
      return piles.find((p) => p.pile_id === pileId) || null;
    }
    return null;
  }, [pileId, location.state, piles]);

  const sortedCards = useMemo(() => {
    if (!pile?.pile_contents) return [];
    return [...pile.pile_contents].sort((a, b) => a.position - b.position);
  }, [pile]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!pile) {
    return (
      <UserLayout>
        <div className="p-4 md:p-8 max-w-6xl mx-auto text-white">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Back to Readings
          </button>
          <div className="py-20 flex flex-col items-center justify-center text-rose-300">
            <AlertCircle size={32} className="mb-4" />
            <p>Reading not found. Please go back to your list.</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto text-white">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ChevronLeft size={18} />
          Back to Readings
        </button>

        {/* Pile header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-200 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Reading #{pile.pile_id.split("-")[0]}
          </h1>
          <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
            <Clock size={14} className="text-purple-400" />
            {formatDate(pile.drawn_at)}
          </div>
        </div>

        {/* Cards row – using static CardSlot visual */}
        <div className="mb-12">
          <h2 className="text-xl font-serif italic text-purple-100 mb-6">
            The Cards
          </h2>
          <div className="flex flex-wrap gap-6 md:gap-10 justify-center md:justify-start">
            {sortedCards.map((card, idx) => (
              <StaticCardSlot
                key={card.pile_content_id}
                card={card}
                index={idx}
              />
            ))}
          </div>
        </div>

        {/* Detailed interpretations */}
        <div className="space-y-8">
          <h2 className="text-xl font-serif italic text-purple-100">
            Card Interpretations
          </h2>
          {sortedCards.map((card, idx) => (
            <CardDetail key={card.pile_content_id} card={card} index={idx} />
          ))}
        </div>
      </div>
    </UserLayout>
  );
}