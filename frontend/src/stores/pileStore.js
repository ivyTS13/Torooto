import { create } from "zustand";
import api from "../services/api";
import { preloadCardBack, preloadCardImages, preloadImage } from "../utils/imagePreload";

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const REVERSAL_PROBABILITY = 0.25;
let shuffleTimerId = null;

const clearPendingShuffleTimer = () => {
  if (shuffleTimerId !== null) {
    clearTimeout(shuffleTimerId);
    shuffleTimerId = null;
  }
};

const toErrorString = (err, fallback) =>
  typeof err === "string" ? err : err?.message || fallback;

const useDrawerStore = create((set, get) => ({
  fullDeck: [],
  availableCards: [],

  numCards: 3,
  drawMode: "auto",
  allowReversed: true,
  drawnCards: [],
  flippedCards: {},

  isFetchingDeck: true,
  isShuffling: false,
  isLoading: false,
  error: null,
  isSaved: false,

  fetchFullDeck: async () => {
    set({ isFetchingDeck: true, error: null });
    try {
      const cards = await api.get("/decks/tarot-cards");
      const finalCards = Array.isArray(cards)
        ? cards
        : cards?.data || cards?.cards || [];

      set({ fullDeck: finalCards, isFetchingDeck: false });
      preloadCardBack();
    } catch (err) {
      set({
        error: toErrorString(err, "Failed to load the Tarot deck."),
        isFetchingDeck: false,
      });
    }
  },

  setSettings: (settings) => {
    clearPendingShuffleTimer();
    const newNumCards = settings.numCards ?? get().numCards;
    set({
      ...settings,
      numCards: newNumCards,
      drawnCards: Array(Math.max(1, newNumCards)).fill(null),
      flippedCards: {},
      availableCards: [],
      isShuffling: false,
      isSaved: false,
    });
  },

  startDrawSequence: () => {
    const { fullDeck, numCards, drawMode, allowReversed } = get();
    if (!fullDeck.length) return;

    clearPendingShuffleTimer();
    set({ isShuffling: true, flippedCards: {}, isSaved: false, error: null });

    shuffleTimerId = setTimeout(() => {
      shuffleTimerId = null;
      let deckCopy = [...fullDeck];
      for (let i = 0; i < 7; i++) {
        deckCopy = shuffleArray(deckCopy);
      }

      const validCount = Math.min(numCards, deckCopy.length);

      if (drawMode === "auto") {
        const selected = deckCopy.slice(0, validCount).map((card) => ({
          ...card,
          isReversed: allowReversed
            ? Math.random() < REVERSAL_PROBABILITY
            : false,
        }));
        preloadCardImages(selected);
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

  cancelDrawSequence: () => {
    clearPendingShuffleTimer();
    set({ isShuffling: false });
  },

  pickManualCard: (card) => {
    const { drawnCards, availableCards, allowReversed } = get();

    const emptySlotIndex = drawnCards.findIndex((c) => c === null);
    if (emptySlotIndex === -1) return;

    preloadImage(card.image_url);

    const updatedDrawn = [...drawnCards];
    updatedDrawn[emptySlotIndex] = {
      ...card,
      isReversed: allowReversed ? Math.random() < REVERSAL_PROBABILITY : false,
    };

    set({
      drawnCards: updatedDrawn,
      availableCards: availableCards.filter((c) => c.card_id !== card.card_id),
    });
  },

  toggleFlip: (cardId) => {
    set((state) => ({
      flippedCards: {
        ...state.flippedCards,
        [cardId]: !state.flippedCards[cardId],
      },
    }));
  },

  savePile: async () => {
    const { drawnCards } = get();
    if (drawnCards.length === 0 || drawnCards.includes(null)) return;

    set({ isLoading: true, error: null });
    try {
      const payload = {
        cards: drawnCards.map((c, i) => ({
          card_id: c.card_id,
          reversed_card: Boolean(c.isReversed),
          position: i,
        })),
      };
      await api.post("/piles/save-fe-pile", payload);
      set({ isSaved: true, isLoading: false });
    } catch (err) {
      set({
        error: toErrorString(err, "Failed to save pile."),
        isLoading: false,
      });
    }
  },

  resetBoard: () => {
    clearPendingShuffleTimer();
    set((state) => ({
      drawnCards: Array(state.numCards).fill(null),
      availableCards: [],
      flippedCards: {},
      isShuffling: false,
      isSaved: false,
    }));
  },
}));

export default useDrawerStore;
