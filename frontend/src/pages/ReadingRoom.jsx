import React, { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "../components/User/UserLayout";
import SettingsPanel from "../components/SettingPanel";
import CardSlot from "../components/CardSlot";
import SemicircleDeck from "../components/SemicircleDeck";
import PileReadingModal from "../components/PileReadingModal";
import useDrawerStore from "../stores/pileStore";

export default function ReadingRoom() {
  // ✅ OPTIMIZATION: Select only what this component needs to prevent unnecessary re-renders
  const fullDeck = useDrawerStore((state) => state.fullDeck);
  const fetchFullDeck = useDrawerStore((state) => state.fetchFullDeck);
  const drawnCards = useDrawerStore((state) => state.drawnCards);
  const isShuffling = useDrawerStore((state) => state.isShuffling);
  const error = useDrawerStore((state) => state.error);
  const isFetchingDeck = useDrawerStore((state) => state.isFetchingDeck);

  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    if (fullDeck.length === 0) fetchFullDeck();
  }, [fullDeck.length, fetchFullDeck]);

  const hasDrawnCards = drawnCards.length > 0;
  const isDonePicking =
    hasDrawnCards && drawnCards.every((card) => card !== null && card !== undefined);

  if (isFetchingDeck) {
    return (
      <div className="h-screen bg-[#030014] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500/50" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
          Gathering the deck...
        </span>
      </div>
    );
  }

  return (
    <PageLayout currentPath="/">
      <SettingsPanel />

      {error && (
        <div className="absolute top-20 md:top-8 left-0 right-0 flex justify-center z-40 px-4">
          <div className="rounded-full border border-red-500/30 bg-red-500/10 px-6 py-2 backdrop-blur-xl text-red-200 text-xs md:text-sm text-center">
            {error}
          </div>
        </div>
      )}

      {isShuffling && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#030014]/60 backdrop-blur-xl transition-all duration-500">
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
            <p className="uppercase tracking-[0.4em] text-xs text-purple-200/60 font-medium">
              Synchronizing Energies
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center pb-32 md:pb-48 pt-24 md:pt-12">
        {!hasDrawnCards ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center text-center px-6 max-w-lg z-10"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full scale-150" />
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white/40 relative z-10" />
            </div>
            <h1 className="text-3xl md:text-5xl font-serif italic text-white mb-4 md:mb-6 tracking-tight drop-shadow-lg">
              Consult the Oracle
            </h1>
            <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed mb-8">
              Focus your energy and set your intentions. Select a spread from the cosmos above, or draw directly from the deck below.
            </p>
            <div className="h-[1px] w-12 bg-white/20" />
          </motion.div>
        ) : (
          <div className="flex flex-col items-center w-full max-w-7xl px-4 z-10 gap-8">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-14 w-full">
              {drawnCards.map((card, index) => (
                <div key={index} onClick={() => card && setSelectedCard(card)}>
                  <CardSlot index={index} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isDonePicking && <PileReadingModal drawnCards={drawnCards} />}

      <AnimatePresence>
        {!isDonePicking && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <SemicircleDeck />
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}