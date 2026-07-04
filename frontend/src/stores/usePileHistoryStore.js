import { create } from 'zustand';
import api from '../services/api';

const usePileHistoryStore = create((set, get) => ({
  piles: [],
  isLoading: false,
  error: null,

  // Fetch all piles for the logged‑in user
  fetchPiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get('/piles/list');
      set({ piles: data, isLoading: false });
    } catch (err) {
      set({ error: err || 'Failed to retrieve the chronicles.', isLoading: false });
    }
  },

  // Soft‑delete a pile (your backend likely supports DELETE)
  deletePile: async (pileId) => {
    try {
      await api.delete(`/piles/${pileId}`);
      // Remove the deleted pile from the local state
      set((state) => ({
        piles: state.piles.filter((p) => p.pile_id !== pileId),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err || 'Banishment failed.' };
    }
  },

  clearError: () => set({ error: null }),
}));

export default usePileHistoryStore;