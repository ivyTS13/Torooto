import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

// SVG Pentacle Icon
export const PentacleIcon = ({ className = "w-6 h-6" }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
  >
    <circle cx="50" cy="50" r="42" className="opacity-80" />
    <path
      d="M 50 8 L 74.68 83.98 L 10.06 37.02 L 89.94 37.02 L 25.32 83.98 Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Framer Motion Variants for Staggered List
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

export default function PileReadingModal({ drawnCards = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // SSR Safe Portal rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize valid cards to prevent unnecessary recalculations
  const validCards = useMemo(() => {
    return Array.isArray(drawnCards)
      ? drawnCards.filter((card) => card && (card.card_name || card.name))
      : [];
  }, [drawnCards]);

  // Lock body scroll & listen for Escape key
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

  const formatKeywords = (keywords) => {
    if (!keywords) return "N/A";
    if (Array.isArray(keywords)) return keywords.join(", ");
    return String(keywords);
  };

  if (!mounted || validCards.length === 0) return null;

  const modal = isOpen ? (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-6 bg-black/60"
        onClick={() => setIsOpen(false)}
      >
        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // smooth ease-out
          className="relative w-full h-full md:h-auto md:max-h-[90vh] max-w-6xl flex flex-col cursor-auto md:rounded-[2.5rem] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cosmic Glass Background Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-[#0a0a1a]/90 to-purple-950/80 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent -z-10" />
          <div className="absolute inset-0 border border-white/10 md:rounded-[2.5rem] pointer-events-none -z-10 shadow-[inset_0_0_40px_rgba(139,92,246,0.1)]" />

          {/* Header */}
          <div className="relative z-10 px-5 py-4 md:px-8 md:py-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-4 min-w-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="text-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.4)] shrink-0"
              >
                <PentacleIcon className="w-8 h-8" />
              </motion.div>
              <div className="min-w-0">
                <h2 className="text-xl md:text-2xl font-serif italic bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent tracking-wide truncate">
                  Collective Interpretation
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  <p className="text-[10px] md:text-xs text-indigo-300/70 uppercase tracking-[0.3em] font-mono">
                    {validCards.length} Cards Resonating
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-indigo-200 hover:text-white transition-all backdrop-blur-md border border-white/10 hover:border-white/20 active:scale-95 shrink-0"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative z-10 flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 space-y-6 md:space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          >
            {validCards.map((card, idx) => {
              const currentCardName = card.card_name || card.name;
              const currentMeta = card.card_metadata || {};

              return (
                <motion.div
                  variants={cardVariants}
                  key={card.card_id || card.id || idx}
                  className="group relative bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 rounded-[2rem] p-5 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-10 items-start overflow-hidden backdrop-blur-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] hover:bg-white/[0.04]"
                >
                  {/* Glowing Orb Background Effect */}
                  <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Card Index Badge */}
                  <div className="absolute top-5 right-6 text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-300/60 bg-indigo-950/50 border border-indigo-500/20 px-3 py-1.5 rounded-full shadow-inner z-10">
                    Card #{idx + 1}
                  </div>

                  {/* Image Frame */}
                  <div className="w-full lg:w-72 xl:w-80 h-[360px] md:h-[480px] shrink-0 rounded-2xl bg-[#030308] border border-white/10 overflow-hidden shadow-2xl relative self-center lg:self-start group-hover:border-indigo-500/40 transition-colors duration-500">
                    <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] pointer-events-none z-10" />
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt={currentCardName}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <Sparkles size={28} className="text-indigo-400/50 mb-3" />
                        <span className="text-xs font-bold text-indigo-200/50 uppercase tracking-widest">
                          {currentCardName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-6 w-full relative z-10">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-serif italic text-white/95 mb-4 drop-shadow-md">
                        {currentCardName}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {card.card_suit && (
                          <span className="px-3.5 py-1.5 bg-black/40 text-indigo-200 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium border border-indigo-500/20">
                            {card.card_suit}
                          </span>
                        )}
                        <span className="px-3.5 py-1.5 bg-black/40 text-purple-200 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium border border-purple-500/20">
                          {currentMeta.element_zodiac || "Cosmic Element"}
                        </span>
                      </div>
                    </div>

                    {/* Keywords Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/15 shadow-[inset_0_0_20px_rgba(16,185,129,0.02)]">
                        <span className="text-emerald-400 font-bold block text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                          <Sparkles size={12} /> Upright
                        </span>
                        <span className="text-gray-300/90 text-sm leading-relaxed">
                          {formatKeywords(currentMeta.upright_keywords)}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/15 shadow-[inset_0_0_20px_rgba(244,63,94,0.02)]">
                        <span className="text-rose-400 font-bold block text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                          Shadow <Sparkles size={12} />
                        </span>
                        <span className="text-gray-300/90 text-sm leading-relaxed">
                          {formatKeywords(currentMeta.reversed_keywords)}
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
                          {currentMeta.upright_meaning || "No meaning recorded."}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-rose-300/80 text-[11px] font-mono uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-rose-400 shadow-[0_0_5px_rgba(251,113,133,0.8)]" />
                          Eclipse
                        </h4>
                        <p className="text-gray-400 text-sm md:text-base font-light italic leading-relaxed">
                          {currentMeta.reversed_meaning || "No meaning recorded."}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  ) : null;

  return (
    <>
      {/* Floating Pentacle Trigger Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40"
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-3 px-6 py-4 rounded-full bg-[#0a051a]/90 backdrop-blur-2xl border border-indigo-500/40 text-indigo-100 shadow-[0_0_30px_rgba(99,102,241,0.25)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:border-indigo-300/60 transition-all duration-500 overflow-hidden"
        >
          {/* Animated button background */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="text-amber-200 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] relative z-10"
          >
            <PentacleIcon className="w-6 h-6 md:w-7 md:h-7" />
          </motion.div>
          <span className="relative z-10 text-[11px] md:text-xs font-bold uppercase tracking-[0.25em] bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent">
            Readings ({validCards.length})
          </span>
        </button>
      </motion.div>

      {/* Portal Render */}
      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}