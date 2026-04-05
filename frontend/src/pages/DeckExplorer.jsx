import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2 } from "lucide-react";
import useCardStore from "../stores/cardStore";

const DeckExplorer = () => {
  const location = useLocation();
  const deck = location.state?.deckInfo;
  const [selectedCard, setSelectedCard] = useState(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    card: null,
    x: 0,
    y: 0,
  });
  const { cards, isLoading, error, fetchCards } = useCardStore();

  useEffect(() => {
    if (deck?.deck_id) {
      fetchCards(deck.deck_id);
    }
  }, [deck, fetchCards]);

  const cardsBySuit = useMemo(() => {
    const groups = {};
    cards.forEach((card) => {
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
    Object.keys(groups).forEach((suit) => {
      if (!sortedGroups[suit]) sortedGroups[suit] = groups[suit];
    });
    return sortedGroups;
  }, [cards]);

  const handleCardHover = (card, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      card,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleCardLeave = () => {
    setTooltip({ visible: false, card: null, x: 0, y: 0 });
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="ml-2 text-white">Loading cards...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300">
          <p>Error loading cards: {error}</p>
          <button
            onClick={() => fetchCards(deck?.deck_id)}
            className="mt-2 px-4 py-2 bg-red-500/30 rounded-lg hover:bg-red-500/40 transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!deck) return <div className="p-8 text-white">Loading Deck...</div>;

  return (
    <div className="relative h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-950 via-purple-950/20 to-indigo-950/30 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="flex flex-col lg:flex-row gap-8 h-full p-6 lg:p-8 relative z-10 overflow-hidden">
        {/* LEFT SIDE */}
        <div
          className={`
            transition-all duration-500
            ${selectedCard ? "lg:w-36 w-full" : "w-full"}
            h-full overflow-y-auto custom-scrollbar
            ${selectedCard ? "overflow-x-hidden" : ""}
          `}
        >
          {!selectedCard ? (
            <div className="pr-2">
              <div className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight bg-gradient-to-r from-purple-200 to-indigo-300 bg-clip-text text-transparent">
                  {deck.deck_name}
                </h1>
                <p className="text-purple-300 text-sm uppercase tracking-[0.3em] mt-2">
                  {deck.deck_type}
                </p>
                <div className="w-20 h-[2px] bg-gradient-to-r from-purple-500 to-transparent mt-4" />
              </div>
              <div className="space-y-8">
                {Object.entries(cardsBySuit).map(([suit, suitCards]) => (
                  <div key={suit}>
                    <h3 className="text-purple-300 text-sm font-semibold uppercase tracking-wider mb-3 pl-1 border-l-3 border-purple-500">
                      {suit}s
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                      {suitCards.map((card) => (
                        <CardThumbnail
                          key={card.card_id}
                          card={card}
                          onClick={() => setSelectedCard(card)}
                          onMouseEnter={(e) => handleCardHover(card, e)}
                          onMouseLeave={handleCardLeave}
                          isSelected={false}
                          selectedMode={false}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-row lg:flex-col gap-5 items-center pr-1">
              {cards.map((card) => (
                <CardThumbnail
                  key={card.card_id}
                  card={card}
                  onClick={() => setSelectedCard(card)}
                  onMouseEnter={(e) => handleCardHover(card, e)}
                  onMouseLeave={handleCardLeave}
                  isSelected={selectedCard?.card_id === card.card_id}
                  selectedMode={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE DETAIL PANEL */}
        <AnimatePresence mode="wait">
          {selectedCard && (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className="flex-1 bg-black/40 backdrop-blur-2xl border border-purple-500/20 rounded-2xl overflow-y-auto relative shadow-2xl custom-scrollbar"
            >
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-purple-900/30 hover:bg-red-500/30 hover:text-red-300 transition-all backdrop-blur-sm border border-white/10"
              >
                <X size={18} />
              </button>
              <div className="p-6 lg:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex justify-center md:w-2/5">
                    <motion.div
                      layoutId={`card-${selectedCard.card_id}`}
                      className="w-full max-w-[280px] aspect-[3/5] rounded-xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-2 border-purple-400/40 shadow-2xl flex items-center justify-center overflow-hidden"
                    >
                      {selectedCard.image_url ? (
                        <img
                          src={selectedCard.image_url}
                          alt={selectedCard.card_name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <>
                          <Sparkles size={48} className="text-purple-300/40" />
                          <span className="text-purple-300/60 text-sm font-mono mt-2">
                            ✦ {selectedCard.card_suit} ✦
                          </span>
                        </>
                      )}
                    </motion.div>
                  </div>
                  <div
                    className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar"
                    style={{ maxHeight: "calc(100vh - 200px)" }}
                  >
                    <div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                        {selectedCard.card_name}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-xs font-medium border border-purple-500/30">
                          {selectedCard.card_suit}
                        </span>
                        <span className="px-3 py-1 bg-indigo-600/30 text-indigo-200 rounded-full text-xs font-medium border border-indigo-500/30">
                          {selectedCard.card_metadata?.element_zodiac ||
                            "Mystical"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="text-xs text-green-300 bg-green-900/30 px-3 py-1 rounded-full">
                        🔮 Upright:{" "}
                        {selectedCard.card_metadata?.upright_keywords}
                      </span>
                      <span className="text-xs text-rose-300 bg-rose-900/30 px-3 py-1 rounded-full">
                        🌙 Reversed:{" "}
                        {selectedCard.card_metadata?.reversed_keywords}
                      </span>
                    </div>
                    <div className="space-y-5 pb-4">
                      <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                        <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span className="w-1 h-4 bg-emerald-400 rounded-full" />
                          Upright Meaning
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-sm">
                          {selectedCard.card_metadata?.upright_meaning}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                        <h3 className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span className="w-1 h-4 bg-rose-400 rounded-full" />
                          Reversed Meaning
                        </h3>
                        <p className="text-gray-400 leading-relaxed text-sm italic">
                          {selectedCard.card_metadata?.reversed_meaning}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tooltip Portal */}
      {tooltip.visible &&
        tooltip.card &&
        !selectedCard &&
        createPortal(
          <div
            className="fixed z-[9999] px-3 py-2 bg-gray-900/95 backdrop-blur-md rounded-lg border border-purple-500/30 shadow-xl pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -100%)",
              marginTop: "-8px",
            }}
          >
            <div className="space-y-1 text-xs whitespace-nowrap">
              <p className="text-emerald-300 font-semibold">
                🔮 Upright:{" "}
                <span className="text-gray-200 font-normal">
                  {tooltip.card.card_metadata?.upright_keywords || "—"}
                </span>
              </p>
              <p className="text-rose-300 font-semibold">
                🌙 Reversed:{" "}
                <span className="text-gray-300 font-normal">
                  {tooltip.card.card_metadata?.reversed_keywords || "—"}
                </span>
              </p>
            </div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900/95 rotate-45 border-r border-b border-purple-500/30" />
          </div>,
          document.body
        )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(128, 90, 213, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
        .border-l-3 {
          border-left-width: 3px;
        }
      `}</style>
    </div>
  );
};

const CardThumbnail = ({
  card,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isSelected,
  selectedMode,
}) => {
  return (
    <motion.div
      layout
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        relative cursor-pointer rounded-xl transition-all duration-300 flex-shrink-0
        backdrop-blur-sm border-2 overflow-hidden
        ${
          isSelected
            ? "border-purple-400 scale-105 shadow-[0_0_20px_rgba(168,85,247,0.4)] bg-purple-900/30 z-10"
            : "border-purple-800/40 hover:border-purple-500/70 bg-black/30 hover:bg-purple-900/20"
        }
        ${selectedMode ? "w-20 lg:w-28 aspect-[3/5]" : "aspect-[3/5] w-full"}
        group
      `}
      style={{ transformOrigin: "center center" }}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
        {card.image_url ? (
          <img
            src={card.image_url}
            alt={card.card_name}
            className="w-full h-full object-contain"
          />
        ) : (
          <Sparkles
            size={selectedMode ? 24 : 32}
            className="text-purple-300/40"
          />
        )}
      </div>
      {/* Gradient overlay – softer */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      <div className="absolute bottom-2 left-0 right-0 text-center z-10">
        <span className="text-[10px] lg:text-xs font-medium text-purple-200/90 tracking-wide drop-shadow-md">
          {card.card_name}
        </span>
      </div>
    </motion.div>
  );
};

export default DeckExplorer;