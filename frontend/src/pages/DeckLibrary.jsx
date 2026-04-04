import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Book as DeckIcon, Calendar, Info } from 'lucide-react';

const DeckLibrary = () => {
  const navigate = useNavigate();
  const handleDeckClick = (deck) => {
  navigate(`/decks/${deck.deck_id}`, { 
    state: { deckInfo: deck } 
  });
};
  // Example data from your response
  const decks = [
    {
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "deck_name": "Rider-Waite Smith Tarot",
      "deck_type": "Tarot",
      "deck_content": "The classic 78-card deck consisting of 22 Major Arcana and 56 Minor Arcana...",
      "created_at": "2026-04-03"
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <DeckIcon className="text-blue-400" /> Card Decks
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <div 
            key={deck.deck_id}
          onClick={() => handleDeckClick(deck)}
            className="group cursor-pointer bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all border-b-4 border-b-blue-500/50"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase">
                {deck.deck_type}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {deck.deck_name}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-3 mb-4 italic">
              "{deck.deck_content}"
            </p>
            <div className="flex items-center text-xs text-gray-500 gap-2">
              <Calendar size={14} />
              <span>Created: {new Date(deck.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeckLibrary;