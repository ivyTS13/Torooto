import { create } from "zustand";
import { api } from "../services/api";

const toErrorString = (error, fallback) =>
  typeof error === "string" ? error : error?.message || fallback;

const useCardStore = create((set, get) => ({
  cards: [],
  isLoading: false,
  error: null,

  fetchCards: async (deckId) => {
    set({ isLoading: true, error: null });
    try {
      const cards = await api.get(`/decks/${deckId}/cards`);
      set({ cards: Array.isArray(cards) ? cards : [], isLoading: false });
    } catch (error) {
      set({
        error: toErrorString(error, "Failed to fetch cards"),
        isLoading: false,
      });
    }
  },

  updateCard: async (cardId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCard = await api.put(`/decks/card/${cardId}`, data);
      const { cards } = get();
      set({
        cards: cards.map((card) =>
          card.card_id === cardId ? updatedCard : card,
        ),
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        error: toErrorString(error, "Failed to update card"),
        isLoading: false,
      });
      return { success: false };
    }
  },

  updateCardImage: async (cardId, file) => {
    if (!file) return { success: false };
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const updatedCard = await api.patch(
        `/decks/card/${cardId}/image`,
        formData,
        {
          headers: { "Content-Type": undefined },
        },
      );

      const { cards } = get();
      set({
        cards: cards.map((card) =>
          card.card_id === cardId ? updatedCard : card,
        ),
        isLoading: false,
      });
      return { success: true, data: updatedCard };
    } catch (error) {
      set({
        error: toErrorString(error, "Failed to upload image"),
        isLoading: false,
      });
      return { success: false };
    }
  },

  uploadCards: async (deckId, file) => {
    if (!file) return { success: false };
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await api.post(`/decks/${deckId}/upload-cards`, formData, {
        headers: { "Content-Type": undefined },
      });

      const newCards = Array.isArray(result) ? result : [];
      const { cards } = get();
      set({
        cards: [...cards, ...newCards],
        isLoading: false,
      });
      return { success: true, count: newCards.length };
    } catch (error) {
      set({
        error: toErrorString(error, "Failed to upload cards"),
        isLoading: false,
      });
      return { success: false };
    }
  },

  softDeleteCard: async (cardId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/decks/card/${cardId}`);

      const { cards } = get();
      set({
        cards: cards.filter((card) => card.card_id !== cardId),
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        error: toErrorString(error, "Failed to delete card"),
        isLoading: false,
      });
      return { success: false };
    }
  },

  addCard: async (deckId, data) => {
    set({ isLoading: true, error: null });
    try {
      const newCard = await api.post(`/decks/${deckId}/cards`, data);
      const { cards } = get();
      set({
        cards: [...cards, newCard].sort((a, b) => {
          if (a.card_suit < b.card_suit) return 1;
          if (a.card_suit > b.card_suit) return -1;
          return a.card_position - b.card_position;
        }),
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        error: toErrorString(error, "Failed to add card"),
        isLoading: false,
      });
      return { success: false };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useCardStore;
