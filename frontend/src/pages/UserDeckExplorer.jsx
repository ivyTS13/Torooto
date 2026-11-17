import React, { useState, useMemo, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import useDrawerStore from "../stores/pileStore";
import PageLayout from "../components/User/UserLayout";
import { toRomanNumeral } from "../utils/romanNumerals";

const RITUAL_EASE = [0.22, 1, 0.36, 1];

const SUIT_LABELS = {
  "Major Arcana": "Major Arcana",
  Cup: "Suit of Cups",
  Cups: "Suit of Cups",
  Wand: "Suit of Wands",
  Wands: "Suit of Wands",
  Sword: "Suit of Swords",
  Swords: "Suit of Swords",
  Pentacle: "Suit of Pentacles",
  Pentacles: "Suit of Pentacles",
  Unknown: "Unclassified",
};

const formatSuitHeading = (suit) => SUIT_LABELS[suit] || suit;

const UserDeckExplorer = () => {
  const fullDeck = useDrawerStore((state) => state.fullDeck);
  const fetchFullDeck = useDrawerStore((state) => state.fetchFullDeck);
  const isFetchingDeck = useDrawerStore((state) => state.isFetchingDeck);
  const error = useDrawerStore((state) => state.error);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    if (fullDeck.length === 0) {
      fetchFullDeck();
    }
  }, [fullDeck.length, fetchFullDeck]);

  useEffect(() => {
    if (!selectedCard) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedCard(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCard]);

  const cardsBySuit = useMemo(() => {
    const groups = {};
    fullDeck.forEach((card) => {
      const suit = card.card_suit || "Unknown";
      if (!groups[suit]) groups[suit] = [];
      groups[suit].push(card);
    });

    Object.keys(groups).forEach((suit) => {
      groups[suit].sort(
        (a, b) => (a.card_position ?? 0) - (b.card_position ?? 0),
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
  }, [fullDeck]);

  if (isFetchingDeck) {
    return (
      <PageLayout currentPath="/tarot">
        <div className="flex items-center justify-center min-h-[60dvh] flex-col gap-4">
          <Loader2 className="animate-spin text-[#C5A059]" size={30} strokeWidth={1.5} />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#9E9689]">
            Loading deck archive…
          </span>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout currentPath="/tarot">
        <div
          role="alert"
          className="folio-plate max-w-md mx-auto rounded-sm border-[#8B3A32] bg-[#5E1914]/25 p-7 text-center"
        >
          <p className="font-serif text-base text-[#E8E2D5] mb-5">{error}</p>
          <button
            type="button"
            onClick={fetchFullDeck}
            className="px-6 py-2.5 rounded-sm border border-[#C5A059]/40 bg-[#1C1917] hover:border-[#C5A059] font-mono text-xs uppercase tracking-[0.18em] text-[#E8E2D5] hover:text-[#C5A059] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
          >
            Retry
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPath="/tarot">
      <div className="relative px-2 sm:px-4 md:px-6 pb-20 max-w-7xl mx-auto w-full z-10">
        <header className="mb-12 pt-4 pb-6 border-b border-[#C5A059]/20 text-center md:text-left">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#C5A059] mb-2">
            Card Compendium
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-[0.06em] text-[#E8E2D5]">
              The Tarot Archive
            </h1>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#9E9689] tabular-nums">
              {fullDeck.length} Plates Catalogued
            </p>
          </div>
        </header>

        <div className="space-y-14">
          {Object.entries(cardsBySuit).map(([suit, suitCards], suitIndex) => (
            <section key={suit}>
              <div className="flex items-center gap-4 mb-6 pb-2 border-b border-[#C5A059]/20">
                <span className="font-display text-sm tracking-[0.18em] text-[#C5A059]">
                  {toRomanNumeral(suitIndex + 1)}.
                </span>
                <h2 className="font-display text-sm md:text-base uppercase tracking-[0.18em] text-[#E8E2D5]">
                  {formatSuitHeading(suit)}
                </h2>
                <span className="ml-auto font-mono text-[11px] text-[#9E9689] tabular-nums">
                  {suitCards.length} Cards
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
                {suitCards.map((card) => (
                  <CardThumbnail
                    key={card.card_id}
                    card={card}
                    onClick={() => setSelectedCard(card)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedCard && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: RITUAL_EASE }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#0B0A0E]/85 overscroll-contain"
            onClick={() => setSelectedCard(null)}
          >
            <Motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="explorer-card-title"
              initial={{ scale: 0.97, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 10 }}
              transition={{ duration: 0.4, ease: RITUAL_EASE }}
              style={{ overscrollBehavior: "contain" }}
              className="folio-plate folio-inset relative max-w-5xl w-full max-h-[92dvh] sm:max-h-[88dvh] rounded-sm overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#C5A059]/20 bg-[#1C1917]/60">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C5A059] tabular-nums">
                  Plate {toRomanNumeral(selectedCard.card_position ?? 0)} ·{" "}
                  {selectedCard.card_suit}
                </span>
                <button
                  type="button"
                  aria-label="Close card details"
                  onClick={() => setSelectedCard(null)}
                  className="p-2 rounded-sm border border-[#C5A059]/25 bg-[#141218] text-[#9E9689] hover:text-[#E8E2D5] hover:border-[#C5A059]/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 md:p-10">
                <div className="flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-12 items-center md:items-start">
                  <div className="w-40 sm:w-52 md:w-72 aspect-[3/5] shrink-0 rounded-sm border border-[#8A6D3B]/45 bg-[#0B0A0E] p-2 shadow-cast">
                    {selectedCard.image_url ? (
                      <img
                        src={selectedCard.image_url}
                        alt={selectedCard.card_name}
                        width={360}
                        height={600}
                        decoding="async"
                        className="w-full h-full object-cover rounded-[2px]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-[#1C1917] p-4 text-center">
                        <span className="font-display text-2xl text-[#C5A059]">
                          {toRomanNumeral(selectedCard.card_position ?? 0)}
                        </span>
                        <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#9E9689]">
                          {selectedCard.card_suit}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-6 w-full">
                    <div>
                      <h2
                        id="explorer-card-title"
                        className="font-display text-2xl sm:text-3xl md:text-4xl tracking-[0.06em] text-[#E8E2D5] mb-3"
                      >
                        {selectedCard.card_name}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-sm border border-[#C5A059]/25 bg-[#1C1917] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#E8E2D5]">
                          {selectedCard.card_suit}
                        </span>
                        <span className="rounded-sm border border-[#8A6D3B]/30 bg-[#1C1917] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#9E9689]">
                          {selectedCard.card_metadata?.element_zodiac ||
                            "Classic Correspondence"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-sm border border-[#C5A059]/30 bg-[#1C1917] p-4">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C5A059] block mb-1.5">
                          Upright Keywords
                        </span>
                        <p className="text-sm text-[#E8E2D5]/90 leading-relaxed max-w-[65ch]">
                          {selectedCard.card_metadata?.upright_keywords || "None recorded"}
                        </p>
                      </div>
                      <div className="rounded-sm border border-[#5E1914]/65 bg-[#5E1914]/20 p-4">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C9A49A] block mb-1.5">
                          Shadow / Reversed Keywords
                        </span>
                        <p className="text-sm text-[#E8E2D5]/90 leading-relaxed max-w-[65ch]">
                          {selectedCard.card_metadata?.reversed_keywords || "None recorded"}
                        </p>
                      </div>
                    </div>

                    <div className="brass-divider" />

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-display text-xs uppercase tracking-[0.18em] text-[#C5A059] mb-2">
                          Upright Meaning
                        </h3>
                        <p className="font-serif text-base md:text-lg text-[#E8E2D5]/90 leading-relaxed max-w-[65ch]">
                          {selectedCard.card_metadata?.upright_meaning ||
                            "No upright description recorded."}
                        </p>
                      </div>

                      <div className="border-t border-[#5E1914]/45 pt-5">
                        <h3 className="font-display text-xs uppercase tracking-[0.18em] text-[#C9A49A] mb-2">
                          Reversed / Shadow Meaning
                        </h3>
                        <p className="font-serif italic text-base md:text-lg text-[#9E9689] leading-relaxed max-w-[65ch]">
                          {selectedCard.card_metadata?.reversed_meaning ||
                            "No reversed description recorded."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

const CardThumbnail = ({ card, onClick }) => {
  return (
    <Motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: RITUAL_EASE }}
      className="folio-plate group flex flex-col rounded-sm p-1.5 text-left transition-colors duration-300 hover:border-[#C5A059]/65 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
    >
      <span className="block relative w-full aspect-[3/5] overflow-hidden rounded-[2px] border border-[#8A6D3B]/35 bg-[#0B0A0E]">
        {card.image_url ? (
          <img
            src={card.image_url}
            alt={card.card_name}
            width={300}
            height={500}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-sm text-[#C5A059]/70">
            {toRomanNumeral(card.card_position ?? 0)}
          </span>
        )}
      </span>
      <span className="mt-1.5 flex items-center justify-between gap-1 border-t border-[#C5A059]/20 px-1 pt-1 w-full">
        <span className="font-mono text-[9px] text-[#C5A059] shrink-0 tabular-nums">
          {toRomanNumeral(card.card_position ?? 0)}
        </span>
        <span className="font-serif text-xs text-[#E8E2D5] truncate">
          {card.card_name}
        </span>
      </span>
    </Motion.button>
  );
};

export default UserDeckExplorer;
