import { create } from 'zustand';
import api from '../services/api';

const usePileHistoryStore = create((set) => ({
  piles: [],
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,

  // Fetch paginated piles for the logged-in user
  fetchPiles: async (page = 1, pageSize = 5) => {
    set({ isLoading: true, error: null });
    try {
      // Axios interceptor already extracts response.data.data
      const data = await api.get(`/piles/list?page=${page}&pageSize=${pageSize}`);
      
      set({
        piles: data.items || [],
        totalPages: data.total_pages || 1,
        currentPage: data.page || page,
        isLoading: false,
      });
    } catch (err) {
      set({ 
        error: err || 'Failed to retrieve the chronicles.', 
        isLoading: false 
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
      return { success: false, error: err || 'Banishment failed.' };
    }
  },

  clearError: () => set({ error: null }),
}));

export default usePileHistoryStore;