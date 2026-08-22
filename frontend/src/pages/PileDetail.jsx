import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Loader2,
  RefreshCcw,
  Eye,
  AlertCircle,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import usePileHistoryStore from "../stores/usePileHistoryStore";

export default function PileDetail() {
  const { pileId } = useParams();
  const navigate = useNavigate();
  const { piles } = usePileHistoryStore();

  const [pileData, setPileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});

  // Helper to normalize data: ensure it has a `cards` array
  const normalizeData = (data) => {
    if (!data) return null;

    // If data already has `cards`, use it directly
    if (Array.isArray(data.cards)) {
      return { ...data, cards: data.cards };
    }

    // If data has `pile_contents` (from the store), convert to `cards`
    if (Array.isArray(data.pile_contents)) {
      return { ...data, cards: data.pile_contents };
    }

    // Fallback: no cards found
    return { ...data, cards: [] };
  };

  useEffect(() => {
    let isMounted = true;

    const initializePile = (data) => {
      const normalized = normalizeData(data);
      if (!normalized) return;

      if (isMounted) {
        setPileData(normalized);
        const allFlipped = {};
        normalized.cards.forEach((card) => {
          allFlipped[card.card_id] = true;
        });
        setFlippedCards(allFlipped);
        setIsLoading(false);
      }
    };

    const fetchFromApi = async () => {
      try {
        setIsLoading(true);
        const data = await api.get(`/piles/${pileId}`);
        if (isMounted) initializePile(data);
      } catch (err) {
        if (isMounted) {
          setError(err || "Failed to load reading.");
          setIsLoading(false);
        }
      }
    };

    // First, try to find the pile in the store
    const existingPile = piles.find((p) => p.pile_id === pileId);
    if (existingPile) {
      initializePile(existingPile);
    } else {
      fetchFromApi();
    }

    return () => {
      isMounted = false;
    };
  }, [pileId, piles]);

  const toggleFlip = useCallback((cardId) => {
    setFlippedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  }, []);

  const revealAll = () => {
    const allFlipped = {};
    pileData?.cards.forEach((card) => {
      allFlipped[card.card_id] = true;
    });
    setFlippedCards(allFlipped);
  };

  const hideAll = () => setFlippedCards({});

  // Derived summary
  const summaryCards = pileData?.cards.map((card, index) => ({
    id: card.card_id,
    name: card.card_name,
    position: index + 1,
    suit: card.card_suit,
    reversed: card.reversed_card,
    keywords: card.reversed_card
      ? card.card_metadata?.reversed_keywords || "No reversed keywords available"
      : card.card_metadata?.upright_keywords || "No upright keywords available",
    meaning: card.reversed_card
      ? card.card_metadata?.reversed_meaning || "No reversed meaning available"
      : card.card_metadata?.upright_meaning || "No upright meaning available",
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="animate-spin text-purple-400" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-rose-300">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-lg">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-950 via-purple-950/20 to-indigo-950/30 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Reading Controls */}
      <div className="relative z-20 flex flex-col md:flex-row items-center justify-between px-8 py-4 bg-black/20 backdrop-blur-sm border-b border-white/5">
        <button
          onClick={() => navigate("/admin/piles")}  // ← Adjust to your list route (e.g. "/piles" if not admin)
          className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Chronicles
        </button>
        <div className="flex gap-4 mt-4 md:mt-0">
          <button
            onClick={revealAll}
            className="flex items-center gap-2 px-4 py-2 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-purple-200 rounded-lg text-xs"
          >
            <Eye size={14} /> Reveal All
          </button>
          <button
            onClick={hideAll}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900/40 hover:bg-gray-800/60 border border-gray-500/30 text-gray-300 rounded-lg text-xs"
          >
            <RefreshCcw size={14} /> Hide All
          </button>
        </div>
      </div>

      {/* Card Canvas */}
      <div className="relative z-10 flex-1 w-full max-w-[90vw] mx-auto flex flex-wrap justify-center items-center gap-6 lg:gap-12 py-12">
        <AnimatePresence mode="popLayout">
          {pileData.cards.map((card, index) => (
            <motion.div
              key={card.card_id}
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
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

      {/* Key Summary Section */}
      {summaryCards && summaryCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 w-full max-w-6xl mx-auto px-4 pb-12"
        >
          <div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 lg:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="text-purple-400 w-6 h-6" />
              <h2 className="text-2xl font-serif italic text-white tracking-tight">
                Key Insights of This Reading
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {summaryCards.map((card) => (
                <motion.div
                  key={card.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-purple-300 text-xs uppercase tracking-widest font-bold">
                        Position {card.position}
                      </p>
                      <h3 className="text-white font-semibold text-lg mt-1">{card.name}</h3>
                    </div>
                    {card.reversed && (
                      <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs px-2 py-1 rounded-full font-bold uppercase">
                        Reversed
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-xs mb-3 flex items-center gap-2">
                    <span>{card.suit}</span>
                    <span>·</span>
                    <span>{card.reversed ? "Reversed" : "Upright"} energy</span>
                  </div>
                  <div className="mt-auto">
                    <p className="text-purple-200/80 text-sm font-medium leading-relaxed">
                      <span className="text-purple-400 mr-1">Keywords:</span>
                      {card.keywords}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
// Reusable FlippableCard – identical to the one in PileDrawer
const FlippableCard = ({ card, isFlipped, onFlip }) => {
  return (
    <div
      className="group w-44 lg:w-56 cursor-pointer"
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
          {/* Back */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl border-2 border-purple-500/40 bg-gradient-to-b from-gray-900 to-purple-950 flex flex-col items-center justify-center overflow-hidden shadow-2xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute inset-3 border border-purple-500/10 rounded-xl" />
            <Sparkles className="text-purple-400/30 w-12 h-12 lg:w-16 lg:h-16" />
          </div>

          {/* Front */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl border-2 shadow-2xl bg-gray-950 overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div
              className={`w-full h-full flex flex-col items-center justify-center relative ${
                card.reversed_card ? "rotate-180" : ""
              }`}
            >
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={card.card_name}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <Sparkles size={48} className="text-purple-500/40 mx-auto" />
                  <p className="text-[10px] font-mono mt-3 text-purple-300/50 uppercase tracking-widest">
                    {card.card_suit}
                  </p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
              <div
                className={`absolute bottom-4 left-0 right-0 text-center px-3 z-10 ${
                  card.reversed_card ? "rotate-180 top-4 bottom-auto" : ""
                }`}
              >
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