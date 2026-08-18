import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2 } from "lucide-react";
import useDrawerStore from "../stores/pileStore";
import PageLayout from "../components/User/UserLayout"; // adjust import path

const UserDeckExplorer = () => {
  const { fullDeck, fetchFullDeck, isFetchingDeck, error } = useDrawerStore();
  const [selectedCard, setSelectedCard] = useState(null);

  // Fetch full deck if empty
  useEffect(() => {
    if (fullDeck.length === 0) {
      fetchFullDeck();
    }
  }, [fullDeck.length, fetchFullDeck]);

  // Group cards by suit with proper ordering
  const cardsBySuit = useMemo(() => {
    const groups = {};
    fullDeck.forEach((card) => {
      const suit = card.card_suit || "Unknown";
      if (!groups[suit]) groups[suit] = [];
      groups[suit].push(card);
    });

    Object.keys(groups).forEach((suit) => {
      groups[suit].sort(
        (a, b) => (a.card_position ?? 0) - (b.card_position ?? 0)
      );
    });

    const suitOrder = [
      "Major Arcana",
      "Cup",
      "Wand",
      "Sword",
      "Pentacle",
      "Unknown",
    ];
    const sortedGroups = {};
    suitOrder.forEach((suit) => {
      if (groups[suit]) sortedGroups[suit] = groups[suit];
    });
    // Add any remaining suits not in the predefined order
    Object.keys(groups).forEach((suit) => {
      if (!sortedGroups[suit]) sortedGroups[suit] = groups[suit];
    });
    return sortedGroups;
  }, [fullDeck]);

  if (isFetchingDeck) {
    return (
      <PageLayout currentPath="/deck">
        <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
          <Loader2 className="animate-spin text-purple-400" size={32} />
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/50">
            Summoning the deck...
          </span>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout currentPath="/deck">
        <div className="max-w-md mx-auto bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center backdrop-blur-xl mt-24">
          <p className="text-red-300/80 mb-4 text-sm">{error}</p>
          <button
            onClick={fetchFullDeck}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[20px] text-xs uppercase tracking-widest font-bold transition-all text-white"
          >
            Try Again
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPath="/deck">
      <div className="relative px-6 md:px-12 pb-24 max-w-[1600px] mx-auto w-full z-10">
        {/* Header */}
        <div className="mb-12 pt-8 text-center md:text-left flex flex-col items-center md:items-start">
          <h1 className="font-serif italic text-4xl md:text-5xl lg:text-6xl text-white tracking-tight">
            The Tarot Deck
          </h1>
          <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold mt-4">
            78 Cards of Wisdom
          </p>
          <div className="w-12 h-[1px] bg-white/20 mt-6" />
        </div>

        {/* Suit Groups */}
        <div className="space-y-16">
          {Object.entries(cardsBySuit).map(([suit, suitCards]) => (
            <div key={suit}>
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-white text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
                  {suit}s
                </h3>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              
              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 md:gap-4">
                {suitCards.map((card) => (
                  <CardThumbnail
                    key={card.card_id}
                    card={card}
                    onClick={() => setSelectedCard(card)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card Detail Popup (Glassmorphism Aesthetic) */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#030014]/80 backdrop-blur-xl"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative max-w-5xl w-full max-h-[85vh] bg-[#0a0a16]/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle ambient glows inside modal */}
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

              {/* Close Button */}
              <div className="absolute top-6 right-6 z-50">
                <button
                  type="button"
                  onClick={() => setSelectedCard(null)}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all backdrop-blur-md border border-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 z-10">
                <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-start">
                  
                  {/* Left: Card Image Container */}
                  <div className="flex justify-center shrink-0 self-start relative">
                    {/* Glowing effect behind card */}
                    <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full scale-110" />
                    
                    <motion.div 
                      initial={{ y: 10 }}
                      animate={{ y: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      className="relative w-48 md:w-72 aspect-[3/5] rounded-[18px] bg-black/40 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden"
                    >
                      {selectedCard.image_url ? (
                        <img
                          src={selectedCard.image_url}
                          alt={selectedCard.card_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center opacity-50">
                          <Sparkles size={32} className="text-white" />
                          <span className="text-white/60 text-[10px] uppercase tracking-widest mt-4 font-bold">
                            {selectedCard.card_suit}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Right: Card Details */}
                  <div className="flex-1 space-y-8 w-full">
                    {/* Title & Badges */}
                    <div>
                      <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-4">
                        {selectedCard.card_name}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-4 py-1.5 bg-white/5 text-gray-300 rounded-[20px] text-[10px] uppercase tracking-[0.2em] font-bold border border-white/10">
                          {selectedCard.card_suit}
                        </span>
                        <span className="px-4 py-1.5 bg-white/5 text-gray-300 rounded-[20px] text-[10px] uppercase tracking-[0.2em] font-bold border border-white/10">
                          {selectedCard.card_metadata?.element_zodiac || "Mystical Element"}
                        </span>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-3">
                      <div className="flex-1 min-w-[200px] p-4 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/10">
                        <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-2 block">
                          Upright Keywords
                        </span>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {selectedCard.card_metadata?.upright_keywords || "N/A"}
                        </p>
                      </div>
                      <div className="flex-1 min-w-[200px] p-4 rounded-[1.5rem] bg-rose-500/5 border border-rose-500/10">
                        <span className="text-[10px] text-rose-400 uppercase tracking-widest font-bold mb-2 block">
                          Reversed Keywords
                        </span>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {selectedCard.card_metadata?.reversed_keywords || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-[1px] bg-white/5" />

                    {/* Meanings */}
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-emerald-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          The Light (Upright)
                        </h3>
                        <p className="text-gray-300 leading-loose text-sm md:text-base font-light">
                          {selectedCard.card_metadata?.upright_meaning || "Information lost in the ether."}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-rose-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          The Shadow (Reversed)
                        </h3>
                        <p className="text-gray-400 leading-loose text-sm md:text-base font-light italic">
                          {selectedCard.card_metadata?.reversed_meaning || "Information lost in the ether."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS for cleaner custom scrollbar inside modal */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </PageLayout>
  );
};

// Refined Thumbnail Component
const CardThumbnail = ({ card, onClick }) => {
  return (
    <motion.div
      layout
      onClick={onClick}
      className="relative cursor-pointer rounded-[14px] overflow-hidden border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all duration-500 group aspect-[3/5] shadow-lg"
      whileHover={{ y: -5, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-1">
        {card.image_url ? (
          <img
            src={card.image_url}
            alt={card.card_name}
            className="w-full h-full object-cover rounded-[10px] grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
          />
        ) : (
          <Sparkles size={20} className="text-white/20" />
        )}
      </div>
      
      {/* Sleek Gradient Overlay for Text Visibility */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0a0a16] via-[#0a0a16]/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      
      <div className="absolute bottom-3 left-0 right-0 text-center z-10 px-2">
        <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-white/90 drop-shadow-md">
          {card.card_name}
        </span>
      </div>
    </motion.div>
  );
};

export default UserDeckExplorer;