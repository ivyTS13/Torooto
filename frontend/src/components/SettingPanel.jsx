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
    error,
  } = useDrawerStore();

  const isBoardFull = drawnCards.length > 0 && !drawnCards.includes(null);

  const handleDecrement = () => setSettings({ numCards: Math.max(1, numCards - 1) });
  const handleIncrement = () => setSettings({ numCards: Math.min(10, numCards + 1) });

  // CSS for the realistic 2D Moon Texture
  const moonTexture = `
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.7) 0%, transparent 20%), 
    radial-gradient(circle at 65% 40%, rgba(180, 100, 20, 0.25) 5%, transparent 25%), 
    radial-gradient(circle at 40% 70%, rgba(180, 100, 20, 0.3) 10%, transparent 30%), 
    radial-gradient(circle at 80% 75%, rgba(180, 100, 20, 0.2) 8%, transparent 20%), 
    radial-gradient(circle at 20% 50%, rgba(180, 100, 20, 0.15) 12%, transparent 25%), 
    linear-gradient(135deg, #fef08a 0%, #eab308 50%, #854d0e 100%)
  `;

  // CSS for the Cosmic Glass Panel
  const cosmicGlass = `linear-gradient(145deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)`;

  return (
    <>
      {/* BACKGROUND OVERLAY: Click anywhere outside the panel to close it */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="absolute top-24 left-6 z-40">
        <motion.div
          layout
          initial={false}
          animate={{
            borderRadius: isOpen ? 24 : 9999,
            width: isOpen ? 300 : 56,
            height: isOpen ? "auto" : 56,
          }}
          transition={{ type: "spring", damping: 25, stiffness: 250 }}
          className="relative overflow-hidden cursor-pointer"
          onClick={() => !isOpen && setIsOpen(true)}
          style={{
            background: isOpen ? cosmicGlass : moonTexture,
            backdropFilter: isOpen ? "blur(24px)" : "none",
            boxShadow: isOpen
              ? "0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(139,92,246,0.15), 0 0 0 1px rgba(139,92,246,0.3)" // Glass shadow & border
              : "0 0 25px rgba(253,224,71,0.5), inset -8px -8px 16px rgba(113,63,18,0.7), inset 4px 4px 10px rgba(255,255,255,0.8)", // 3D Moon lighting
          }}
        >
          {/* Subtle star inside the moon when closed */}
          {!isOpen && (
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <Sparkles size={20} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
          )}

          {isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="absolute top-0 left-0 w-14 h-14 flex items-center justify-center transition-colors z-20 text-indigo-300 hover:text-white"
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
                    <label className="text-sm font-medium text-indigo-100 drop-shadow-[0_0_8px_rgba(165,180,252,0.3)]">
                      Cards
                    </label>
                    <div className="flex items-center bg-black/50 border border-indigo-500/20 rounded-full p-1 shadow-inner">
                      <button
                        onClick={handleDecrement}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-100 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-white">
                        {numCards}
                      </span>
                      <button
                        onClick={handleIncrement}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-100 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* --- MODE TOGGLE --- */}
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-indigo-100 drop-shadow-[0_0_8px_rgba(165,180,252,0.3)]">
                      Mode
                    </label>
                    <div className="flex bg-black/50 border border-indigo-500/20 rounded-full p-1 shadow-inner relative">
                      <button
                        onClick={() => setSettings({ drawMode: "auto" })}
                        className={`relative z-10 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                          drawMode === "auto" ? "text-indigo-950" : "text-indigo-400 hover:text-indigo-200"
                        }`}
                      >
                        Auto
                      </button>
                      <button
                        onClick={() => setSettings({ drawMode: "manual" })}
                        className={`relative z-10 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                          drawMode === "manual" ? "text-indigo-950" : "text-indigo-400 hover:text-indigo-200"
                        }`}
                      >
                        Manual
                      </button>
                      <motion.div
                        layout
                        className="absolute top-1 bottom-1 w-[60px] bg-indigo-300 rounded-full shadow-[0_0_12px_rgba(165,180,252,0.6)] z-0"
                        initial={false}
                        animate={{
                          left: drawMode === "auto" ? "4px" : "62px",
                          width: drawMode === "auto" ? "54px" : "68px",
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    </div>
                  </div>

                  {/* --- REVERSAL TOGGLE --- */}
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-indigo-100 drop-shadow-[0_0_8px_rgba(165,180,252,0.3)]">
                      Reversals
                    </label>
                    <button
                      onClick={() => setSettings({ allowReversed: !allowReversed })}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-500 border ${
                        allowReversed
                          ? "bg-indigo-500/30 border-indigo-400/50"
                          : "bg-black/50 border-white/10"
                      }`}
                    >
                      <motion.div
                        layout
                        className={`w-4 h-4 rounded-full absolute top-[3px] shadow-[0_0_10px_rgba(165,180,252,0.8)] ${
                          allowReversed ? "bg-indigo-300" : "bg-zinc-600 shadow-none"
                        }`}
                        animate={{ left: allowReversed ? "26px" : "4px" }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                </div>

                {/* Cosmic Divider Line */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]" />

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      startDrawSequence();
                      setIsOpen(false);
                    }}
                    disabled={isShuffling}
                    className="group relative flex items-center justify-center gap-2 bg-gradient-to-b from-indigo-400 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-indigo-300 hover:to-indigo-500 transition-all overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-300/30"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Sparkles size={16} strokeWidth={2} className="group-hover:rotate-12 transition-transform text-indigo-100" />
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
                                ? "bg-emerald-900/40 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                : "bg-indigo-900/40 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-800/60 hover:text-white"
                            }
                          `}
                        >
                          <Save size={14} />
                          {isLoading ? "Saving..." : isSaved ? "Saved!" : "Save Pile"}
                        </button>
                        <button
                          onClick={resetBoard}
                          disabled={isLoading}
                          className="flex-1 flex items-center justify-center gap-2 bg-black/40 border border-white/10 py-2.5 rounded-xl text-zinc-400 text-xs font-medium hover:bg-red-900/30 hover:text-red-300 hover:border-red-500/30 transition-all disabled:opacity-50"
                        >
                          <RotateCcw size={14} /> Clear
                        </button>
                      </div>

                      {error && (
                        <div className="mt-1 bg-red-950/50 border border-red-500/30 rounded-lg p-2 text-center text-xs text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
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
    </>
  );
}