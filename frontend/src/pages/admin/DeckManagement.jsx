import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Loader2, AlertCircle, X, Flame, Eye } from "lucide-react";
import useDeckStore from "../../stores/deckStore";

export default function DeckManagement() {
  const navigate = useNavigate();
  const { 
    decks, 
    isLoading, 
    error, 
    fetchDecks, 
    addDeck, 
    updateDeck, 
    deleteDeck, 
    clearError 
  } = useDeckStore();

  // Local UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [deckToDelete, setDeckToDelete] = useState(null);

  const [formData, setFormData] = useState({
    deck_name: "",
    deck_type: "Tarot",
    deck_content: "",
  });

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleOpenModal = (deck = null) => {
    clearError();
    if (deck) {
      setEditingDeck(deck);
      setFormData({
        deck_name: deck.deck_name,
        deck_type: deck.deck_type,
        deck_content: deck.deck_content,
      });
    } else {
      setEditingDeck(null);
      setFormData({ deck_name: "", deck_type: "Tarot", deck_content: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = editingDeck 
      ? await updateDeck(editingDeck.deck_id, formData) 
      : await addDeck(formData);
    
    setIsSubmitting(false);
    if (result.success) setIsModalOpen(false);
  };

  // Custom Delete Flow
  const triggerDeleteRequest = (deck) => {
    setDeckToDelete(deck);
    setIsDeleteModalOpen(true);
  };

  const confirmBanishment = async () => {
    if (!deckToDelete) return;
    setIsSubmitting(true);
    const result = await deleteDeck(deckToDelete.deck_id);
    setIsSubmitting(false);
    if (result.success) setIsDeleteModalOpen(false);
  };

  // Navigate to card management for a deck
  const handleManageCards = (deckId) => {
    navigate(`/admin/decks/${deckId}/cards`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-200 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Deck Grimoire
          </h1>
          <p className="text-gray-500 text-sm mt-2 tracking-wide uppercase font-medium">Archive of Ancient Knowledge</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="group relative flex items-center gap-2 px-6 py-3 bg-purple-600/10 border border-purple-500/30 hover:border-purple-400/60 text-purple-200 rounded-2xl transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-purple-600/10 group-hover:bg-purple-600/20 transition-colors" />
          <Plus size={18} className="relative z-10" /> 
          <span className="relative z-10 font-bold tracking-tight">New Deck</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-black/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        {isLoading && decks.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-purple-500/50" size={40} />
            <p className="text-purple-300/30 font-mono text-xs uppercase tracking-[0.3em]">Summoning Data...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
              <tr>
                <th className="px-8 py-6">Deck Identity</th>
                <th className="px-8 py-6">Nature</th>
                <th className="px-8 py-6 hidden md:table-cell">Lore</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {decks.map((deck) => (
                <tr key={deck.deck_id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="text-purple-50 font-semibold tracking-tight">{deck.deck_name}</div>
                    <div className="text-[10px] text-gray-600 font-mono mt-1">{deck.deck_id.split('-')[0]}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-purple-950/30 text-purple-400 border border-purple-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {deck.deck_type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-gray-500 text-sm hidden md:table-cell max-w-xs truncate italic font-serif">
                    "{deck.deck_content}"
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleManageCards(deck.deck_id)}
                        className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                        title="Manage Cards"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(deck)} 
                        className="p-2 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all"
                        title="Edit Deck"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => triggerDeleteRequest(deck)} 
                        className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Delete Deck"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE/UPDATE MODAL (unchanged) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-md">
          <div className="bg-[#0a0a0c] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-3xl overflow-hidden shadow-purple-900/10">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white tracking-tight">{editingDeck ? "Edit Grimoire Entry" : "Inscribe New Deck"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-1">Deck Name</label>
                <input
                  required
                  value={formData.deck_name}
                  onChange={(e) => setFormData({ ...formData, deck_name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:border-purple-500/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-1">Nature (Category)</label>
                <div className="relative">
                  <select
                    disabled={!!editingDeck}
                    value={formData.deck_type}
                    onChange={(e) => setFormData({ ...formData, deck_type: e.target.value })}
                    className={`w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none appearance-none cursor-pointer transition-all ${
                      editingDeck ? "opacity-40 cursor-not-allowed grayscale" : "focus:border-purple-500/50"
                    }`}
                  >
                    <option value="Tarot">Tarot</option>
                    <option value="Oracle">Oracle</option>
                    <option value="Lenormand">Lenormand</option>
                  </select>
                  {editingDeck && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] uppercase text-purple-500 font-bold bg-purple-500/10 px-2 py-1 rounded">Locked</div>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-1">Lore & Essence</label>
                <textarea
                  rows={4}
                  value={formData.deck_content}
                  onChange={(e) => setFormData({ ...formData, deck_content: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:border-purple-500/50 outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-purple-900/20 transition-all flex justify-center items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingDeck ? "Commit Changes" : "Inscribe Deck")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (unchanged) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#0d0202] border border-rose-900/30 w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl shadow-rose-950/20">
            <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Flame size={32} className="text-rose-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-rose-100 mb-2 font-serif">Banish Deck?</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Are you sure you wish to banish <span className="text-rose-300 font-bold">"{deckToDelete?.deck_name}"</span> to the void? This action cannot be easily undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmBanishment}
                disabled={isSubmitting}
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-rose-900/40"
              >
                {isSubmitting ? "Banishing..." : "Confirm Banishment"}
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full py-4 bg-transparent text-gray-500 hover:text-gray-300 font-medium transition-all"
              >
                Keep in Grimoire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}