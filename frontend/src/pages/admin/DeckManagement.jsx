import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Loader2, AlertCircle, X, Eye } from "lucide-react";
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
    clearError,
  } = useDeckStore();

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

  useEffect(() => {
    if (!isModalOpen && !isDeleteModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, isDeleteModalOpen, isSubmitting]);

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
      ? await updateDeck(editingDeck.deck_id, {
          deck_name: formData.deck_name,
          deck_content: formData.deck_content,
        })
      : await addDeck(formData);

    setIsSubmitting(false);
    if (result.success) setIsModalOpen(false);
  };

  const triggerDeleteRequest = (deck) => {
    setDeckToDelete(deck);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deckToDelete) return;
    setIsSubmitting(true);
    const result = await deleteDeck(deckToDelete.deck_id);
    setIsSubmitting(false);
    if (result.success) setIsDeleteModalOpen(false);
  };

  const handleManageCards = (deckId) => {
    navigate(`/admin/decks/${deckId}/cards`);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto text-[#E8E2D5]">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#C5A059]/20">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#C5A059] mb-2">
            Curator Desk
          </p>
          <h1 className="font-display text-3xl md:text-4xl tracking-[0.08em] text-[#E8E2D5]">
            Deck Registry
          </h1>
          <p className="font-serif italic text-base text-[#9E9689] mt-1">
            Manage Tarot, Oracle, and Lenormand deck editions
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-[#C5A059] hover:bg-[#D2B06B] text-[#0B0A0E] font-display text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ease-ritual focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E2D5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0A0E]"
        >
          <Plus size={16} />
          <span>New Deck</span>
        </button>
      </header>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-6 rounded-sm border border-[#8B3A32] bg-[#5E1914]/35 p-4 flex items-center justify-between gap-4 text-[#E8E2D5] text-sm"
        >
          <div className="flex items-center gap-3 min-w-0">
            <AlertCircle size={18} className="text-[#C9A49A] shrink-0" />
            <span className="break-words">{error}</span>
          </div>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={clearError}
            className="text-[#9E9689] hover:text-[#E8E2D5] rounded-sm p-1 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="folio-plate rounded-sm overflow-hidden">
        {isLoading && decks.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#C5A059]" size={32} strokeWidth={1.5} />
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#9E9689]">
              Loading decks…
            </p>
          </div>
        ) : decks.length === 0 ? (
          <div className="py-20 text-center font-serif italic text-base text-[#9E9689] px-4">
            No decks catalogued yet. Create a new deck to begin.
          </div>
        ) : (
          <>
            <div className="block md:hidden divide-y divide-[#C5A059]/15">
              {decks.map((deck) => (
                <article key={deck.deck_id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-serif text-lg font-medium text-[#E8E2D5] break-words">
                        {deck.deck_name}
                      </h2>
                      <p className="font-mono text-[11px] text-[#9E9689] mt-0.5 tabular-nums">
                        #{deck.deck_id.split("-")[0]}
                      </p>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-sm border border-[#C5A059]/30 bg-[#1C1917] font-mono text-[10px] uppercase tracking-[0.16em] text-[#C5A059]">
                      {deck.deck_type}
                    </span>
                  </div>

                  {deck.deck_content && (
                    <p className="font-serif italic text-sm text-[#9E9689] line-clamp-2">
                      {deck.deck_content}
                    </p>
                  )}

                  <div className="pt-2.5 border-t border-[#C5A059]/15 flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleManageCards(deck.deck_id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#C5A059]/30 bg-[#1C1917] text-[#E8E2D5] hover:text-[#C5A059] hover:border-[#C5A059] font-mono text-[11px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                      aria-label={`Manage cards in ${deck.deck_name}`}
                    >
                      <Eye size={14} />
                      <span>Cards</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModal(deck)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#C5A059]/25 bg-[#141218] text-[#9E9689] hover:text-[#C5A059] hover:border-[#C5A059] font-mono text-[11px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                      aria-label={`Edit ${deck.deck_name}`}
                    >
                      <Pencil size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerDeleteRequest(deck)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#8B3A32]/60 bg-[#5E1914]/35 text-[#E8E2D5] hover:bg-[#5E1914] font-mono text-[11px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                      aria-label={`Delete ${deck.deck_name}`}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1C1917]/65 text-[#9E9689] font-mono text-[11px] uppercase tracking-[0.18em] border-b border-[#C5A059]/20">
                  <tr>
                    <th className="px-6 py-4 font-medium">Deck Name</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Notes</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5A059]/15">
                  {decks.map((deck) => (
                    <tr
                      key={deck.deck_id}
                      className="hover:bg-[#1C1917]/55 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-serif text-lg font-medium text-[#E8E2D5]">
                          {deck.deck_name}
                        </div>
                        <div className="font-mono text-[11px] text-[#9E9689] mt-0.5 tabular-nums">
                          #{deck.deck_id.split("-")[0]}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-sm border border-[#C5A059]/30 bg-[#1C1917] font-mono text-[10px] uppercase tracking-[0.16em] text-[#C5A059]">
                          {deck.deck_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#9E9689] text-sm max-w-xs truncate font-serif italic">
                        {deck.deck_content || "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleManageCards(deck.deck_id)}
                            className="p-2 rounded-sm border border-transparent text-[#9E9689] hover:text-[#C5A059] hover:border-[#C5A059]/30 hover:bg-[#1C1917] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                            title="Manage Cards"
                            aria-label={`Manage cards in ${deck.deck_name}`}
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenModal(deck)}
                            className="p-2 rounded-sm border border-transparent text-[#9E9689] hover:text-[#C5A059] hover:border-[#C5A059]/30 hover:bg-[#1C1917] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                            title="Edit Deck"
                            aria-label={`Edit ${deck.deck_name}`}
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerDeleteRequest(deck)}
                            className="p-2 rounded-sm border border-transparent text-[#9E9689] hover:text-[#C9A49A] hover:border-[#8B3A32] hover:bg-[#5E1914]/35 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                            title="Delete Deck"
                            aria-label={`Delete ${deck.deck_name}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0B0A0E]/85 overscroll-contain"
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="deck-form-title"
            style={{ overscrollBehavior: "contain" }}
            onClick={(e) => e.stopPropagation()}
            className="folio-plate folio-inset w-full max-w-lg max-h-[92dvh] rounded-sm overflow-hidden flex flex-col"
          >
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-[#C5A059]/20 bg-[#1C1917]/60 flex justify-between items-center shrink-0">
              <h2
                id="deck-form-title"
                className="font-display text-lg uppercase tracking-[0.12em] text-[#E8E2D5]"
              >
                {editingDeck ? "Edit Deck" : "New Deck"}
              </h2>
              <button
                type="button"
                aria-label="Close deck dialog"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-sm border border-transparent text-[#9E9689] hover:text-[#E8E2D5] hover:border-[#C5A059]/30 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto overscroll-contain">
              <div className="space-y-2">
                <label
                  htmlFor="deck-name-input"
                  className="block font-mono text-[11px] uppercase tracking-[0.18em] text-[#9E9689]"
                >
                  Deck Name
                </label>
                <input
                  id="deck-name-input"
                  required
                  value={formData.deck_name}
                  onChange={(e) =>
                    setFormData({ ...formData, deck_name: e.target.value })
                  }
                  className="w-full rounded-sm border border-[#C5A059]/25 bg-[#1C1917] px-3.5 py-2.5 text-sm text-[#E8E2D5] focus-visible:outline-none focus-visible:border-[#C5A059] focus-visible:ring-1 focus-visible:ring-[#C5A059]/60"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="deck-type-select"
                  className="block font-mono text-[11px] uppercase tracking-[0.18em] text-[#9E9689]"
                >
                  Deck Type
                </label>
                <div className="relative">
                  <select
                    id="deck-type-select"
                    disabled={!!editingDeck}
                    value={formData.deck_type}
                    onChange={(e) =>
                      setFormData({ ...formData, deck_type: e.target.value })
                    }
                    className={`w-full rounded-sm border border-[#C5A059]/25 bg-[#1C1917] px-3.5 py-2.5 text-sm text-[#E8E2D5] appearance-none transition-colors focus-visible:outline-none focus-visible:border-[#C5A059] focus-visible:ring-1 focus-visible:ring-[#C5A059]/60 ${
                      editingDeck ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <option value="Tarot">Tarot</option>
                    <option value="Oracle">Oracle</option>
                    <option value="Lenormand">Lenormand</option>
                  </select>
                  {editingDeck && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#C5A059] border border-[#C5A059]/30 bg-[#141218] px-2 py-0.5 rounded-sm">
                      Locked
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="deck-content-input"
                  className="block font-mono text-[11px] uppercase tracking-[0.18em] text-[#9E9689]"
                >
                  Description
                </label>
                <textarea
                  id="deck-content-input"
                  rows={4}
                  value={formData.deck_content}
                  onChange={(e) =>
                    setFormData({ ...formData, deck_content: e.target.value })
                  }
                  className="w-full rounded-sm border border-[#C5A059]/25 bg-[#1C1917] px-3.5 py-2.5 text-sm text-[#E8E2D5] resize-none focus-visible:outline-none focus-visible:border-[#C5A059] focus-visible:ring-1 focus-visible:ring-[#C5A059]/60"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-sm bg-[#C5A059] hover:bg-[#D2B06B] text-[#0B0A0E] font-display text-xs font-semibold uppercase tracking-[0.2em] transition-colors flex justify-center items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E2D5]"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : editingDeck ? (
                  <span>Save Changes</span>
                ) : (
                  <span>Create Deck</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-[#0B0A0E]/85 overscroll-contain"
          onClick={() => !isSubmitting && setIsDeleteModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-deck-title"
            style={{ overscrollBehavior: "contain" }}
            onClick={(e) => e.stopPropagation()}
            className="folio-plate folio-inset w-full max-w-sm rounded-sm border-[#8B3A32] p-5 sm:p-7 text-center"
          >
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-sm border border-[#8B3A32] bg-[#5E1914]/35">
              <Trash2 size={20} className="text-[#C9A49A]" />
            </div>
            <h2
              id="delete-deck-title"
              className="font-display text-xl tracking-[0.08em] uppercase text-[#E8E2D5] mb-2"
            >
              Delete Deck?
            </h2>
            <p className="font-serif text-sm text-[#9E9689] mb-7 leading-relaxed">
              This will soft-delete{" "}
              <span className="text-[#E8E2D5] font-medium">
                &ldquo;{deckToDelete?.deck_name}&rdquo;
              </span>{" "}
              and hide its cards from active readings.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-sm border border-[#8B3A32] bg-[#5E1914] hover:bg-[#74211B] font-display text-xs uppercase tracking-[0.18em] text-[#E8E2D5] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
              >
                {isSubmitting ? "Deleting…" : "Delete Deck"}
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-sm border border-[#C5A059]/25 bg-[#1C1917] text-[#9E9689] hover:text-[#E8E2D5] font-display text-xs uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
