import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

// Carousel slide variants
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.3, ease: "easeIn" },
  }),
};

export default function PileReadingModal({ drawnCards = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Safely filter valid cards
  const validCards = Array.isArray(drawnCards)
    ? drawnCards.filter((card) => card && (card.card_name || card.name))
    : [];

  // Reset to first card when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setDirection(0);
    }
  }, [isOpen]);

  // Lock body scroll & listen for Escape/Arrow keys when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, validCards.length]);

  const paginate = (newDirection) => {
    if (validCards.length <= 1) return;
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = validCards.length - 1;
      if (nextIndex >= validCards.length) nextIndex = 0;
      return nextIndex;
    });
  };

  // Format keywords whether they arrive as an array or string
  const formatKeywords = (keywords) => {
    if (!keywords) return "N/A";
    if (Array.isArray(keywords)) return keywords.join(", ");
    return String(keywords);
  };

  if (validCards.length === 0) return null;

  const activeCard = validCards[currentIndex];
  const cardName = activeCard?.card_name || activeCard?.name;
  const metadata = activeCard?.card_metadata || {};

  const modal = isOpen ? (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-[#030014]/85 backdrop-blur-2xl"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 200 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          dragDirectionLock
          onDragEnd={(e, info) => {
            if (info.offset.y > 100 || info.velocity.y > 500) {
              setIsOpen(false);
            }
          }}
          className="relative w-full max-w-6xl max-h-[92vh] bg-[#0a0a18]/92 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col cursor-auto md:cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* very small drag handle */}
          <div className="w-full pt-2 pb-1 flex flex-col items-center justify-center bg-white/[0.02] border-b border-white/5 shrink-0 select-none md:hidden cursor-grab active:cursor-grabbing">
            <div className="w-11 h-1.5 rounded-full bg-white/20 transition-colors" />
            <div className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-widest text-purple-300/50 mt-1">
              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ChevronDown size={12} />
              </motion.div>
              <span>Swipe down to close</span>
            </div>
          </div>

          {/* compact header */}
          <div className="relative px-4 py-3 md:px-5 md:py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-3 min-w-0">
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.35)] shrink-0"
              >
                <PentacleIcon className="w-6 h-6 md:w-7 md:h-7" />
              </motion.div>

              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-serif italic text-white/90 tracking-wide leading-none truncate">
                  Collective Pile Interpretation
                </h2>
                <p className="mt-1 text-[9px] md:text-[10px] text-purple-300/60 uppercase tracking-[0.28em] font-mono">
                  {validCards.length} Cards Selected
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="hidden md:flex p-2 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all backdrop-blur-sm border border-white/10 hover:border-white/30 active:scale-95 shrink-0"
              aria-label="Close modal"
            >
              <X size={17} />
            </button>
          </div>

          {/* content */}
          <motion.div className="relative flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 space-y-5 md:space-y-6">
            {validCards.map((card, idx) => {
              const currentCardName = card.card_name || card.name;
              const currentMeta = card.card_metadata || {};

              return (
                <motion.div
                  key={card.card_id || card.id || idx}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="bg-white/[0.04] border border-white/10 rounded-[1.5rem] p-4 md:p-6 flex flex-col md:flex-row gap-5 md:gap-7 items-start relative overflow-hidden backdrop-blur-sm hover:border-white/20 transition-colors"
                >
                  <div className="absolute top-4 right-5 text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400/60 bg-purple-950/40 border border-purple-500/20 px-3 py-1 rounded-full">
                    Card #{idx + 1}
                  </div>

                  {/* image frame */}
                  <div className="w-full md:w-56 lg:w-64 h-[320px] md:h-[420px] lg:h-[500px] shrink-0 rounded-2xl bg-black/50 border border-white/10 overflow-hidden shadow-xl self-center md:self-start">
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt={currentCardName}
                        className="w-full h-full object-contain bg-[#0b1022]"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                        <Sparkles size={20} className="text-purple-400 mb-2" />
                        <span className="text-[10px] font-bold text-white/70 uppercase">
                          {currentCardName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* details */}
                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-serif italic text-white/90 mb-2 drop-shadow-sm">
                        {currentCardName}
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {card.card_suit && (
                          <span className="px-3 py-1 bg-white/5 text-gray-300 rounded-full text-[9px] uppercase tracking-widest font-bold border border-white/10">
                            {card.card_suit}
                          </span>
                        )}
                        <span className="px-3 py-1 bg-white/5 text-gray-300 rounded-full text-[9px] uppercase tracking-widest font-bold border border-white/10">
                          {currentMeta.element_zodiac || "Cosmic Element"}
                        </span>
                      </div>
                    </div>

                    {/* keywords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs">
                        <span className="text-emerald-400 font-bold block text-[9px] uppercase tracking-wider mb-1">
                          Upright Keywords
                        </span>
                        <span className="text-gray-300/90 leading-relaxed">
                          {formatKeywords(currentMeta.upright_keywords)}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs">
                        <span className="text-rose-400 font-bold block text-[9px] uppercase tracking-wider mb-1">
                          Reversed Keywords
                        </span>
                        <span className="text-gray-300/90 leading-relaxed">
                          {formatKeywords(currentMeta.reversed_keywords)}
                        </span>
                      </div>
                    </div>

                    {/* meanings */}
                    <div className="space-y-3 pt-2 border-t border-white/5">
                      <div>
                        <h4 className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Light / Upright Meaning
                        </h4>
                        <p className="text-gray-300 text-xs md:text-sm font-light leading-relaxed">
                          {currentMeta.upright_meaning ||
                            "No meaning recorded."}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-rose-400 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Shadow / Reversed Meaning
                        </h4>
                        <p className="text-gray-400 text-xs md:text-sm font-light italic leading-relaxed">
                          {currentMeta.reversed_meaning ||
                            "No meaning recorded."}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-purple-950/20 to-transparent pointer-events-none" />
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
        className="fixed bottom-8 right-8 z-40"
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#0d0922]/80 backdrop-blur-xl border border-purple-500/30 text-purple-200 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] hover:border-purple-400/60 transition-all duration-500"
        >
          <div className="absolute inset-0 rounded-full bg-purple-600/20 blur-md group-hover:blur-xl transition-all" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,0.9)] relative z-10"
          >
            <PentacleIcon className="w-7 h-7" />
          </motion.div>
          <span className="relative z-10 text-xs font-bold uppercase tracking-[0.3em] bg-gradient-to-r from-amber-200 via-purple-200 to-indigo-200 bg-clip-text text-transparent">
            Meaning ({validCards.length})
          </span>
        </button>
      </motion.div>

      {typeof document !== "undefined"
        ? createPortal(modal, document.body)
        : modal}
    </>
  );
}
