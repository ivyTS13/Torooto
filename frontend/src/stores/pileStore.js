import { create } from "zustand";
import api from "../services/api";

// --- HELPER: True Fisher-Yates Shuffle ---
// This guarantees a mathematically even distribution,
// unlike the unstable .sort(() => Math.random() - 0.5)
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Set a more realistic physical reversal rate
const REVERSAL_PROBABILITY = 0.25; // 25% chance

const useDrawerStore = create((set, get) => ({
  // Deck State
  fullDeck: [],
  availableCards: [],

  // Reading State
  numCards: 3,
  drawMode: "auto", // 'auto' | 'manual'
  allowReversed: true,
  drawnCards: [],
  flippedCards: {},

  // App Status
  isFetchingDeck: true,
  isShuffling: false,
  isLoading: false,
  error: null,
  isSaved: false,

  // 1. Initial Load
  fetchFullDeck: async () => {
    set({ isFetchingDeck: true, error: null });
    try {
      const cards = await api.get("/decks/tarot-cards");
      const finalCards = Array.isArray(cards)
        ? cards
        : cards?.data || cards?.cards || [];

      set({ fullDeck: finalCards, isFetchingDeck: false });
    } catch (err) {
      console.error("Failed to fetch deck:", err);
      set({
        error: "Failed to load the Tarot deck.",
        isFetchingDeck: false,
      });
    }
  },

  // 2. Settings Modifiers
  setSettings: (settings) => {
    const newNumCards = settings.numCards ?? get().numCards;
    set({
      ...settings,
      numCards: newNumCards,
      drawnCards: Array(Math.max(1, newNumCards)).fill(null),
      flippedCards: {},
      availableCards: [],
      isSaved: false,
    });
  },

  // 3. Initiate Draw sequence
  startDrawSequence: () => {
    const { fullDeck, numCards, drawMode, allowReversed } = get();
    if (!fullDeck.length) return;

    set({ isShuffling: true, flippedCards: {}, isSaved: false, error: null });

    setTimeout(() => {
      // Mimic human reader: Shuffle the deck thoroughly (7 passes)
      let deckCopy = [...fullDeck];
      for (let i = 0; i < 7; i++) {
        deckCopy = shuffleArray(deckCopy);
      }

      const validCount = Math.min(numCards, deckCopy.length);

      if (drawMode === "auto") {
        const selected = deckCopy.slice(0, validCount).map((card) => ({
          ...card,
          // Use the more natural 25% reversal rate
          isReversed: allowReversed
            ? Math.random() < REVERSAL_PROBABILITY
            : false,
        }));
        set({ drawnCards: selected, availableCards: [], isShuffling: false });
      } else {
        set({
          drawnCards: Array(validCount).fill(null),
          availableCards: deckCopy,
          isShuffling: false,
        });
      }
    }, 1500);
  },

  // 4. Manual Picking
  pickManualCard: (card) => {
    const { drawnCards, availableCards, allowReversed } = get();

    const emptySlotIndex = drawnCards.findIndex((c) => c === null);
    if (emptySlotIndex === -1) return;

    const updatedDrawn = [...drawnCards];
    updatedDrawn[emptySlotIndex] = {
      ...card,
      // Apply the same natural reversal rate to manual picks
      isReversed: allowReversed ? Math.random() < REVERSAL_PROBABILITY : false,
    };

    set({
      drawnCards: updatedDrawn,
      availableCards: availableCards.filter((c) => c.card_id !== card.card_id),
    });
  },

  // 5. Interaction
  toggleFlip: (cardId) => {
    const { flippedCards } = get();
    set({ flippedCards: { ...flippedCards, [cardId]: !flippedCards[cardId] } });
  },

  // 6. Save to Backend
  savePile: async () => {
    const { drawnCards } = get();
    if (drawnCards.includes(null)) return;

    set({ isLoading: true, error: null });
    try {
      const payload = {
        cards: drawnCards.map((c, i) => ({
          card_id: c.card_id,
          reversed_card: c.isReversed,
          position: i,
        })),
      };
      await api.post("/piles/save-fe-pile", payload); // Ensure route matches your .NET API
      set({ isSaved: true, isLoading: false });
    } catch (err) {
      // Simplified error handling assuming your api interceptor catches it
      set({ error: err || "Failed to save pile.", isLoading: false });
    }
  },

  resetBoard: () =>
    set({
      drawnCards: Array(get().numCards).fill(null),
      availableCards: [],
      flippedCards: {},
      isSaved: false,
    }),
}));

export default useDrawerStore;
