import { create } from "zustand";
import api from "../services/api";

const useDrawerStore = create((set, get) => ({
  // Deck State
  fullDeck: [], // start empty, will be filled by fetchFullDeck
  availableCards: [], // Cards left in the deck during manual draw

  // Reading State
  numCards: 3,
  drawMode: "auto", // 'auto' | 'manual'
  allowReversed: true,
  drawnCards: [], // Array of fixed length (numCards), containing null (empty slot) or card objects
  flippedCards: {},

  // App Status
  isFetchingDeck: true, // initially true because we fetch on mount
  isShuffling: false,
  isLoading: false,
  error: null,
  isSaved: false,

  // 1. Initial Load
  fetchFullDeck: async () => {
    set({ isFetchingDeck: true, error: null });
    try {
      // The interceptor already returns response.data.data (or response.data)
      // So this is likely an array of cards
      const cards = await api.get("/decks/tarot-cards");

      // Safety check: if cards is not an array, try to extract it
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
    // When settings change, reset the board
    set({
      ...settings,
      numCards: newNumCards,
      drawnCards: Array(Math.max(1, newNumCards)).fill(null), // Ensures no negative or 0-length arrays
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

    // Simulate shuffle animation duration
    setTimeout(() => {
      let deckCopy = [...fullDeck].sort(() => Math.random() - 0.5); // Shuffle
      const validCount = Math.min(numCards, deckCopy.length); // Prevents drawing beyond deck size

      if (drawMode === "auto") {
        // Auto: Pick first N cards and place in slots
        const selected = deckCopy.slice(0, validCount).map((card) => ({
          ...card,
          isReversed: allowReversed ? Math.random() > 0.5 : false,
        }));
        set({ drawnCards: selected, availableCards: [], isShuffling: false });
      } else {
        // Manual: Set up empty slots and available deck pool
        set({
          drawnCards: Array(validCount).fill(null),
          availableCards: deckCopy,
          isShuffling: false,
        });
      }
    }, 1500);
  },

  // 4. Manual Picking (User clicks a card from the Semicircle)
  pickManualCard: (card) => {
    const { drawnCards, availableCards, allowReversed } = get();

    // Find first empty slot
    const emptySlotIndex = drawnCards.findIndex((c) => c === null);
    if (emptySlotIndex === -1) return; // All slots full

    const updatedDrawn = [...drawnCards];
    updatedDrawn[emptySlotIndex] = {
      ...card,
      isReversed: allowReversed ? Math.random() > 0.5 : false,
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
    if (drawnCards.includes(null)) return; // Don't save incomplete piles

    set({ isLoading: true });
    try {
      const payload = {
        cards: drawnCards.map((c, i) => ({
          card_id: c.card_id,
          reversed_card: c.isReversed,
          position: i,
        })),
      };
      await api.post("/piles/save-fe-pile", payload);
      set({ isSaved: true, isLoading: false });
    } catch (err) {
      // Improved error extraction
      const message = err.response?.data?.message || err.message || "Failed to save pile.";
      set({ error: message, isLoading: false });
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