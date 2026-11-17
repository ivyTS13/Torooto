import { create } from "zustand";
import api from "../services/api";

const toErrorString = (err, fallback) =>
  typeof err === "string" ? err : err?.message || fallback;

const usePileHistoryStore = create((set) => ({
  piles: [],
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,
  currentPile: null,
  isLoadingPile: false,
  pileError: null,

  fetchPiles: async (page = 1, pageSize = 5) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get(
        `/piles/list?page=${page}&pageSize=${pageSize}`,
      );

      set({
        piles: data?.items || [],
        totalPages: data?.total_pages || 1,
        currentPage: data?.page || page,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: toErrorString(err, "Failed to retrieve the chronicles."),
        isLoading: false,
      });
    }
  },

  deletePile: async (pileId) => {
    try {
      await api.delete(`/piles/${pileId}`);
      set((state) => ({
        piles: state.piles.filter((p) => (p.pile_id ?? p.pileId) !== pileId),
      }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: toErrorString(err, "Banishment failed."),
      };
    }
  },

  fetchPileById: async (pileId) => {
    set({ isLoadingPile: true, pileError: null });
    try {
      const data = await api.get(`/piles/${pileId}`);
      set({ currentPile: data, isLoadingPile: false });
    } catch (err) {
      set({
        pileError: toErrorString(err, "Failed to load the reading."),
        isLoadingPile: false,
      });
    }
  },

  clearCurrentPile: () => set({ currentPile: null, pileError: null }),
  clearError: () => set({ error: null, pileError: null }),
}));

export default usePileHistoryStore;
