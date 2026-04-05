import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCcw, Eye, AlertCircle, ArrowLeft } from "lucide-react";
import useDrawerStore from "../stores/pileStore";

export default function PileDrawer() {
  const [numCards, setNumCards] = useState(3);
  const [allowReversed, setAllowReversed] = useState(true);

  const { 
    drawnPile, 
    flippedCards, 
    isLoading, 
    error, 
    drawCards, 
    toggleFlip, 
    revealAll, 
    hideAll,
    resetStore 
  } = useDrawerStore();

  const handleDraw = () => {
    drawCards(numCards, allowReversed);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-950 via-purple-950/20 to-indigo-950/30 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Setup UI */}
      <AnimatePresence>
        {!drawnPile && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100, height: 0, marginBottom: 0 }}
            className="relative z-20 max-w-4xl mx-auto w-full p-6 lg:p-12 text-center"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-black/40 backdrop-blur-xl border border-purple-500/20 p-8 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-4">
                <label className="text-purple-200 font-medium text-sm">Number of Cards:</label>
                <input
                  type="number" min="1" max="10"
                  value={numCards}
                  onChange={(e) => setNumCards(Number(e.target.value))}
                  className="w-16 bg-purple-950/50 border border-purple-500/30 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 text-center"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-purple-200 font-medium text-sm">Allow Reversed?</label>
                <button
                  onClick={() => setAllowReversed(!allowReversed)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${allowReversed ? "bg-purple-600" : "bg-gray-700"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${allowReversed ? "left-7" : "left-1"}`} />
                </button>
              </div>
              <button
                onClick={handleDraw}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/40 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isLoading ? "Consulting..." : "Reveal My Path"}
              </button>
            </div>
            {error && <p className="mt-4 text-rose-400 text-sm">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading Controls */}
      <AnimatePresence>
        {drawnPile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-20 flex flex-col md:flex-row items-center justify-between px-8 py-4 bg-black/20 backdrop-blur-sm border-b border-white/5"
          >
            <button onClick={resetStore} className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft size={16} /> New Reading
            </button>
            <div className="flex gap-4 mt-4 md:mt-0">
              <button onClick={revealAll} className="flex items-center gap-2 px-4 py-2 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-purple-200 rounded-lg text-xs">
                <Eye size={14} /> Reveal All
              </button>
              <button onClick={hideAll} className="flex items-center gap-2 px-4 py-2 bg-gray-900/40 hover:bg-gray-800/60 border border-gray-500/30 text-gray-300 rounded-lg text-xs">
                <RefreshCcw size={14} /> Hide All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Canvas */}
      <div className={`relative z-10 flex-1 w-full max-w-[90vw] mx-auto flex flex-wrap justify-center items-center gap-6 lg:gap-12 transition-all duration-700 ${drawnPile ? 'py-12' : 'py-0'}`}>
        <AnimatePresence mode="popLayout">
          {drawnPile?.cards.map((card, index) => (
            <motion.div
              key={card.card_id}
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ delay: index * 0.1, type: "spring", damping: 15 }}
            >
              <FlippableCard
                card={card}
                isFlipped={!!flippedCards[card.card_id]}
                onFlip={() => toggleFlip(card.card_id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Flippable Card with 3:5 aspect ratio
// ----------------------------------------------------
const FlippableCard = ({ card, isFlipped, onFlip }) => {
  return (
    <div
      className="group w-44 lg:w-56 cursor-pointer"   // fixed width, height auto from aspect ratio
      style={{ perspective: "1200px" }}
      onClick={onFlip}
    >
      <div
        className="relative w-full aspect-[3/5]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="absolute inset-0 w-full h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* BACK (unflipped) */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl border-2 border-purple-500/40 bg-gradient-to-b from-gray-900 to-purple-950 flex flex-col items-center justify-center overflow-hidden shadow-2xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute inset-3 border border-purple-500/10 rounded-xl" />
            <Sparkles className="text-purple-400/30 w-12 h-12 lg:w-16 lg:h-16" />
          </div>

          {/* FRONT (flipped) */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl border-2 shadow-2xl bg-gray-950 overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className={`w-full h-full flex flex-col items-center justify-center relative ${card.reversed_card ? "rotate-180" : ""}`}>
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={card.card_name}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <Sparkles size={48} className="text-purple-500/40 mx-auto" />
                  <p className="text-[10px] font-mono mt-3 text-purple-300/50 uppercase tracking-widest">{card.card_suit}</p>
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
              <div className={`absolute bottom-4 left-0 right-0 text-center px-3 z-10 ${card.reversed_card ? "rotate-180 top-4 bottom-auto" : ""}`}>
                <h3 className="text-white font-bold text-sm lg:text-base drop-shadow-lg tracking-tight">
                  {card.card_name}
                </h3>
                {card.reversed_card && (
                  <div className="mt-2 inline-block px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 rounded-full">
                    <p className="text-rose-200 text-[9px] uppercase font-bold">Reversed</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};