import { create } from 'zustand';
import api from '../services/api'; 

const useDrawerStore = create((set, get) => ({
  drawnPile: null,
  flippedCards: {}, // Key: card_id, Value: boolean
  isLoading: false,
  error: null,

  /**
   * Draws cards from the backend
   * @param {number} numCards - e.g., 1 or 3
   * @param {boolean} isReversed - Whether to allow reversed positions
   */
  drawCards: async (numCards, isReversed) => {
    set({ isLoading: true, error: null, drawnPile: null, flippedCards: {} });

    try {
      // Because of your interceptor, 'data' here is already response.data.data
      const data = await api.post('/piles/add', {
        number_of_cards: numCards,
        is_reversed: isReversed,
      });

      set({ 
        drawnPile: data, 
        isLoading: false 
      });
    } catch (err) {
      // Your interceptor returns the error message string on rejection
      set({ 
        error: err || "The spirits are silent. Try again later.", 
        isLoading: false 
      });
    }
  },

  // Toggle a single card (for individual clicking)
  toggleFlip: (cardId) => {
    const { flippedCards } = get();
    set({
      flippedCards: {
        ...flippedCards,
        [cardId]: !flippedCards[cardId],
      },
    });
  },

  // Flip everything face-up
  revealAll: () => {
    const { drawnPile } = get();
    if (!drawnPile) return;
    
    const allFlipped = {};
    drawnPile.cards.forEach((card) => {
      allFlipped[card.card_id] = true;
    });
    set({ flippedCards: allFlipped });
  },

  // Flip everything face-down
  hideAll: () => {
    set({ flippedCards: {} });
  },

  // Clear the session
  resetStore: () => {
    set({ drawnPile: null, flippedCards: {}, error: null, isLoading: false });
  },
}));

export default useDrawerStore;