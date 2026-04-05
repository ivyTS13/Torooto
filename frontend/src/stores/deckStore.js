// stores/deckStore.js
import { create } from 'zustand';
import { api } from '../services/api';

const useDeckStore = create((set, get) => ({
  decks: [],
  isLoading: false,
  error: null,

  // Fetch all non‑deleted decks
  fetchDecks: async () => {
    set({ isLoading: true, error: null });
    try {
      const decks = await api.get('/decks/list'); // GET /list
      set({ decks, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message || 'Failed to fetch decks', isLoading: false });
      return { success: false };
    }
  },

  // Create a new deck
  addDeck: async (deckData) => {
    set({ isLoading: true, error: null });
    try {
      const newDeck = await api.post('/decks/add', deckData); // POST /add
      set((state) => ({
        decks: [newDeck, ...state.decks], // add to beginning (newest first)
        isLoading: false,
      }));
      return { success: true, data: newDeck };
    } catch (error) {
      set({ error: error.message || 'Failed to add deck', isLoading: false });
      return { success: false };
    }
  },

  // Update an existing deck
  updateDeck: async (deckId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedDeck = await api.put(`/decks/${deckId}`, updateData); // PUT /{deck_id}
      set((state) => ({
        decks: state.decks.map((deck) =>
          deck.deck_id === deckId ? updatedDeck : deck
        ),
        isLoading: false,
      }));
      return { success: true, data: updatedDeck };
    } catch (error) {
      set({ error: error.message || 'Failed to update deck', isLoading: false });
      return { success: false };
    }
  },

  // Soft delete a deck (and its cards)
  deleteDeck: async (deckId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.delete(`/decks/${deckId}`); // DELETE /{deck_id}
      // result is the deck_id (backend returns { data: deck_id })
      set((state) => ({
        decks: state.decks.filter((deck) => deck.deck_id !== deckId),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message || 'Failed to delete deck', isLoading: false });
      return { success: false };
    }
  },

  // Restore a soft‑deleted deck and its cards
  restoreDeck: async (deckId) => {
    set({ isLoading: true, error: null });
    try {
      const restoredDeck = await api.post(`/deck/${deckId}/restore`); // POST /deck/{deck_id}/restore
      // Add the deck back to the list (it may not be currently in state)
      set((state) => ({
        decks: [restoredDeck, ...state.decks],
        isLoading: false,
      }));
      return { success: true, data: restoredDeck };
    } catch (error) {
      set({ error: error.message || 'Failed to restore deck', isLoading: false });
      return { success: false };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useDeckStore;