import { create } from "zustand";
import { api } from "../services/api";

const toErrorString = (error, fallback) =>
  typeof error === "string" ? error : error?.message || fallback;

const useDeckStore = create((set) => ({
  decks: [],
  isLoading: false,
  error: null,

  fetchDecks: async () => {
    set({ isLoading: true, error: null });
    try {
      const decks = await api.get("/decks/list");
      set({ decks: Array.isArray(decks) ? decks : [], isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: toErrorString(error, "Failed to fetch decks"),
        isLoading: false,
      });
      return { success: false };
    }
  },

  addDeck: async (deckData) => {
    set({ isLoading: true, error: null });
    try {
      const newDeck = await api.post("/decks/add", deckData);
      set((state) => ({
        decks: [newDeck, ...state.decks],
        isLoading: false,
      }));
      return { success: true, data: newDeck };
    } catch (error) {
      set({
        error: toErrorString(error, "Failed to add deck"),
        isLoading: false,
      });
      return { success: false };
    }
  },

  updateDeck: async (deckId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedDeck = await api.put(`/decks/${deckId}`, updateData);
      set((state) => ({
        decks: state.decks.map((deck) =>
          deck.deck_id === deckId ? updatedDeck : deck,
        ),
        isLoading: false,
      }));
      return { success: true, data: updatedDeck };
    } catch (error) {
      set({
        error: toErrorString(error, "Failed to update deck"),
        isLoading: false,
      });
      return { success: false };
    }
  },

  deleteDeck: async (deckId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/decks/${deckId}`);
      set((state) => ({
        decks: state.decks.filter((deck) => deck.deck_id !== deckId),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({
        error: toErrorString(error, "Failed to delete deck"),
        isLoading: false,
      });
      return { success: false };
    }
  },

  restoreDeck: async (deckId) => {
    set({ isLoading: true, error: null });
    try {
      const restoredDeck = await api.post(`/decks/${deckId}/restore`);
      set((state) => ({
        decks: [restoredDeck, ...state.decks],
        isLoading: false,
      }));
      return { success: true, data: restoredDeck };
    } catch (error) {
      set({
        error: toErrorString(error, "Failed to restore deck"),
        isLoading: false,
      });
      return { success: false };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useDeckStore;
