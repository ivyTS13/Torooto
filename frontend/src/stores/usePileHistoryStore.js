import { create } from "zustand";
import api from "../services/api";

const usePileHistoryStore = create((set) => ({
  piles: [],
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,
  // New: single pile details
  currentPile: null,
  isLoadingPile: false,
  pileError: null,
  // Fetch paginated piles for the logged-in user
  fetchPiles: async (page = 1, pageSize = 5) => {
    set({ isLoading: true, error: null });
    try {
      // Axios interceptor already extracts response.data.data
      const data = await api.get(
        `/piles/list?page=${page}&pageSize=${pageSize}`,
      );

      set({
        piles: data.items || [],
        totalPages: data.total_pages || 1,
        currentPage: data.page || page,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err || "Failed to retrieve the chronicles.",
        isLoading: false,
      });
    }
  },

  // Soft-delete a pile
  deletePile: async (pileId) => {
    try {
      await api.delete(`/piles/${pileId}`);
      set((state) => ({
        piles: state.piles.filter((p) => p.pileId !== pileId),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err || "Banishment failed." };
    }
  },
  // New action: fetch one pile by ID
  fetchPileById: async (pileId) => {
    set({ isLoadingPile: true, pileError: null });
    try {
      // The interceptor already unwraps response.data.data
      const data = await api.get(`/piles/${pileId}`);
      set({ currentPile: data, isLoadingPile: false });
    } catch (err) {
      set({
        pileError: err || "Failed to load the reading.",
        isLoadingPile: false,
      });
    }
  },

  // Optional: clear current pile when leaving the page
  clearCurrentPile: () => set({ currentPile: null, pileError: null }),

  clearError: () => set({ error: null, pileError: null }),
}));

export default usePileHistoryStore;
