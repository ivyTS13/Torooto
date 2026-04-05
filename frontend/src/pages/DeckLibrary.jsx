import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Book, Calendar, Sparkles, Loader2 } from 'lucide-react';
import useDeckStore from '../stores/deckStore';

const DeckLibrary = () => {
  const navigate = useNavigate();
  const { decks, isLoading, error, fetchDecks } = useDeckStore();

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleDeckClick = (deck) => {
    navigate(`/decks/${deck.deck_id}`, {
      state: { deckInfo: deck }
    });
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-indigo-950/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-purple-300/50 text-xs uppercase tracking-[0.3em]">Summoning Archives...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-indigo-950/30 flex items-center justify-center p-8">
        <div className="bg-rose-950/40 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-rose-400" size={32} />
          </div>
          <h3 className="text-rose-200 text-xl font-bold mb-2">Mystic Error</h3>
          <p className="text-rose-300/70 text-sm mb-6">{error}</p>
          <button
            onClick={() => fetchDecks()}
            className="px-6 py-2 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 rounded-xl text-rose-100 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (decks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-indigo-950/30 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Book size={40} className="text-purple-400/50" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-indigo-300 bg-clip-text text-transparent mb-2">
            No Decks Yet
          </h2>
         
        </div>
      </div>
    );
  }

  // Main Grid View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-indigo-950/30 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-16">
        {/* Header */}
        <div className="mb-12 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-200 via-indigo-300 to-purple-400 bg-clip-text text-transparent inline-flex items-center gap-4">
              <Book className="w-10 h-10 text-purple-400 hidden lg:inline-block" />
              Arcane Library
            </h1>
            <p className="text-gray-400 text-sm mt-3 max-w-xl mx-auto lg:mx-0">
              Choose a deck, unveil the cards, and let the spirits guide your reading.
            </p>
          </motion.div>
        </div>

        {/* Deck Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {decks.map((deck, index) => (
              <motion.div
                key={deck.deck_id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                onClick={() => handleDeckClick(deck)}
                className="group cursor-pointer"
              >
                <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-900/20">
                  {/* Decorative top gradient line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">
                        {deck.deck_type || 'Mystic Deck'}
                      </span>
                      {/* Optional: deck icon */}
                      <Sparkles size={16} className="text-purple-400/40 group-hover:text-purple-300 transition" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-1">
                      {deck.deck_name}
                    </h3>
                    
                    <p className="text-gray-400 text-sm line-clamp-3 mb-5 italic leading-relaxed">
                      "{deck.deck_content || 'No description provided.'}"
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{new Date(deck.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                          Enter →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Footer whisper */}
        <div className="text-center mt-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600">
            The cards await your touch
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeckLibrary;