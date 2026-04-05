// stores/cardStore.js
import { create } from "zustand";
import { api } from "../services/api";

const useCardStore = create((set, get) => ({
  cards: [],
  isLoading: false,
  error: null,

  fetchCards: async (deckId) => {
    set({ isLoading: true, error: null });
    try {
      const cards = await api.get(`/decks/${deckId}/cards`);
      set({ cards, isLoading: false });
    } catch (error) {
      set({
        error: error.message || "Failed to fetch cards",
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
        error: error.message || "Failed to update card",
        isLoading: false,
      });
      return { success: false };
    }
  },

  // 🖼️ Update card image (upload file)
  updateCardImage: async (cardId, file) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const updatedCard = await api.patch(
        `/decks/card/${cardId}/image`,
        formData,
        {
          headers: { "Content-Type": undefined }, // ensures multipart/form-data
        },
      );

      // Update the card in local state
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
        error: error.message || "Failed to upload image",
        isLoading: false,
      });
      return { success: false };
    }
  },

  // 📤 Upload multiple cards from CSV
  uploadCards: async (deckId, file) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await api.post(`/decks/${deckId}/upload-cards`, formData, {
        headers: { "Content-Type": undefined },
      });

      // result should be the array of newly created cards (backend returns { data: new_cards })
      const newCards = result; // because interceptor extracts data
      const { cards } = get();
      set({
        cards: [...cards, ...newCards],
        isLoading: false,
      });
      return { success: true, count: newCards.length };
    } catch (error) {
      set({
        error: error.message || "Failed to upload cards",
        isLoading: false,
      });
      return { success: false };
    }
  },

  softDeleteCard: async (cardId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`decks/card/${cardId}`); // We don't need the result anymore
      
      const { cards } = get();
      // FIX: Filter out the deleted card entirely from the UI array
      set({
        cards: cards.filter((card) => card.card_id !== cardId),
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || "Failed to delete card",
        isLoading: false,
      });
      return { success: false };
    }
  },
addCard: async (deckId, data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.post(`/decks/${deckId}/cards`, data);
      const newCard = result; // Assuming interceptor returns result.data
      
      const { cards } = get();
      set({
        // Add and then re-sort locally to match the server-side logic
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
        error: error.message || "Failed to add card",
        isLoading: false,
      });
      return { success: false };
    }
  },
  clearError: () => set({ error: null }),
}));

export default useCardStore;
