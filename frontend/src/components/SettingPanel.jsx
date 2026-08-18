import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, RotateCcw, X, Sparkles, Plus, Minus } from "lucide-react";
import useDrawerStore from "../stores/pileStore";

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    numCards,
    drawMode,
    allowReversed,
    setSettings,
    startDrawSequence,
    savePile,
    resetBoard,
    drawnCards,
    isSaved,
    isShuffling,
    isLoading,
    error, // <-- IMPORT ERROR HERE
  } = useDrawerStore();

  const isBoardFull = drawnCards.length > 0 && !drawnCards.includes(null);

  const handleDecrement = () =>
    setSettings({ numCards: Math.max(1, numCards - 1) });
  const handleIncrement = () =>
    setSettings({ numCards: Math.min(10, numCards + 1) });

  return (
    <div className="fixed top-24 left-6 z-40">
      <motion.div
        layout
        initial={false}
        animate={{
          borderRadius: isOpen ? 32 : 9999,
          width: isOpen ? 300 : 56,
          height: isOpen ? "auto" : 56,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="relative overflow-hidden cursor-pointer"
        onClick={() => !isOpen && setIsOpen(true)}
        style={{
          background: isOpen
            ? "rgba(15, 15, 20, 0.75)"
            : "radial-gradient(circle at 35% 35%, #fffbeb 0%, #fde047 30%, #eab308 70%, #ca8a04 100%)",
          backdropFilter: isOpen ? "blur(24px)" : "none",
          boxShadow: isOpen
            ? "0 0 40px rgba(234,179,8,0.1), inset 0 0 20px rgba(255,255,255,0.1)"
            : "0 0 30px rgba(234,179,8,0.6), 0 0 10px rgba(253,224,71,0.8), inset -4px -4px 10px rgba(161,98,7,0.4), inset 4px 4px 10px rgba(255,255,255,0.8)",
          border: isOpen ? "1px solid rgba(250,204,21,0.3)" : "none",
        }}
      >
        {isOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="absolute top-0 left-0 w-14 h-14 flex items-center justify-center transition-colors z-20 text-zinc-400 hover:text-white"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="pt-16 pb-6 px-6 flex flex-col gap-6 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                {/* --- CARD COUNTER --- */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-zinc-300 drop-shadow-md">
                    Cards
                  </label>
                  <div className="flex items-center bg-black/40 border border-white/10 rounded-full p-1 shadow-inner">
                    <button
                      onClick={handleDecrement}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-white">
                      {numCards}
                    </span>
                    <button
                      onClick={handleIncrement}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* --- MODE TOGGLE --- */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-zinc-300 drop-shadow-md">
                    Mode
                  </label>
                  <div className="flex bg-black/40 border border-white/10 rounded-full p-1 shadow-inner relative">
                    <button
                      onClick={() => setSettings({ drawMode: "auto" })}
                      className={`relative z-10 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        drawMode === "auto"
                          ? "text-black"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => setSettings({ drawMode: "manual" })}
                      className={`relative z-10 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        drawMode === "manual"
                          ? "text-black"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Manual
                    </button>
                    <motion.div
                      layout
                      className="absolute top-1 bottom-1 w-[60px] bg-amber-300 rounded-full shadow-[0_0_12px_rgba(252,211,77,0.7)] z-0"
                      initial={false}
                      animate={{
                        left: drawMode === "auto" ? "4px" : "62px",
                        width: drawMode === "auto" ? "54px" : "68px",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  </div>
                </div>

                {/* --- REVERSAL TOGGLE --- */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-zinc-300 drop-shadow-md">
                    Reversals
                  </label>
                  <button
                    onClick={() =>
                      setSettings({ allowReversed: !allowReversed })
                    }
                    className={`w-12 h-6 rounded-full relative transition-colors duration-500 border ${
                      allowReversed
                        ? "bg-amber-400/20 border-amber-400/40"
                        : "bg-black/40 border-white/10"
                    }`}
                  >
                    <motion.div
                      layout
                      className={`w-4 h-4 rounded-full absolute top-[3px] shadow-[0_0_8px_rgba(252,211,77,0.8)] ${
                        allowReversed ? "bg-amber-300" : "bg-zinc-500"
                      }`}
                      animate={{ left: allowReversed ? "26px" : "4px" }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/30 to-transparent shadow-[0_0_10px_rgba(252,211,77,0.3)]" />

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    startDrawSequence();
                    setIsOpen(false);
                  }}
                  disabled={isShuffling}
                  className="group relative flex items-center justify-center gap-2 bg-gradient-to-b from-amber-200 to-amber-400 text-black py-2.5 rounded-xl text-sm font-semibold hover:from-amber-100 hover:to-amber-300 transition-all overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                >
                  <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Sparkles
                    size={16}
                    strokeWidth={2}
                    className="group-hover:rotate-12 transition-transform"
                  />
                  Initiate Draw
                </button>

                {isBoardFull && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={savePile}
                        disabled={isSaved || isLoading}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed
                          ${
                            isSaved
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" // Green when saved
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-100" // Blue when ready to save
                          }
                        `}
                      >
                        <Save size={14} /> 
                        {isLoading ? "Saving..." : isSaved ? "Saved!" : "Save Pile"}
                      </button>
                      <button
                        onClick={resetBoard}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-black/40 border border-white/10 py-2.5 rounded-xl text-zinc-300 text-xs font-medium hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                      >
                        <RotateCcw size={14} /> Clear
                      </button>
                    </div>

                    {/* NEW: Explicitly show backend errors so you know why saving failed */}
                    {error && (
                      <div className="mt-1 bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-center text-xs text-red-400">
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}