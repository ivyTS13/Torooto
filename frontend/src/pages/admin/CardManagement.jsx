import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Eye,
  Upload,
  Download,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  LayoutGrid,
  Compass,
} from "lucide-react";
import useCardStore from "../../stores/cardStore";
import useDeckStore from "../../stores/deckStore";
import { toRomanNumeral } from "../../utils/romanNumerals";

const RITUAL_EASE = [0.22, 1, 0.36, 1];

export default function CardManagement() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const toastTimerRef = useRef(null);
  const {
    cards,
    isLoading,
    error,
    fetchCards,
    addCard,
    updateCard,
    updateCardImage,
    uploadCards,
    softDeleteCard,
    clearError,
  } = useCardStore();
  const { decks, fetchDecks } = useDeckStore();

  const [activeModal, setActiveModal] = useState(null); // 'add' | 'edit' | 'detail' | 'delete'
  const [selectedCard, setSelectedCard] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    card_name: "",
    card_suit: "",
    card_position: "",
    upright_meaning: "",
    reversed_meaning: "",
    upright_keywords: "",
    reversed_keywords: "",
    element_zodiac: "",
  });

  const currentDeck = decks.find((d) => d.deck_id === deckId);

  useEffect(() => {
    if (deckId) fetchCards(deckId);
    if (decks.length === 0) fetchDecks();
  }, [deckId, fetchCards, fetchDecks, decks.length]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!activeModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) {
        setActiveModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal, isSubmitting]);

  const showSuccess = (msg) => {
    if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current);
    setSuccessMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setSuccessMessage("");
      toastTimerRef.current = null;
    }, 3000);
  };

  const handleOpenForm = (mode, card = null) => {
    clearError();
    setSelectedCard(card);
    if (card) {
      setFormData({
        card_name: card.card_name,
        card_suit: card.card_suit,
        card_position: card.card_position,
        upright_meaning: card.card_metadata?.upright_meaning || "",
        reversed_meaning: card.card_metadata?.reversed_meaning || "",
        upright_keywords: card.card_metadata?.upright_keywords || "",
        reversed_keywords: card.card_metadata?.reversed_keywords || "",
        element_zodiac: card.card_metadata?.element_zodiac || "",
      });
    } else {
      setFormData({
        card_name: "",
        card_suit: "",
        card_position: "",
        upright_meaning: "",
        reversed_meaning: "",
        upright_keywords: "",
        reversed_keywords: "",
        element_zodiac: "",
      });
    }
    setActiveModal(mode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      card_name: formData.card_name,
      card_suit: formData.card_suit,
      card_position: parseInt(formData.card_position, 10),
      card_metadata: {
        upright_meaning: formData.upright_meaning,
        reversed_meaning: formData.reversed_meaning,
        upright_keywords: formData.upright_keywords,
        reversed_keywords: formData.reversed_keywords,
        element_zodiac: formData.element_zodiac,
      },
    };
    const result = selectedCard
      ? await updateCard(selectedCard.card_id, payload)
      : await addCard(deckId, payload);
    setIsSubmitting(false);
    if (result.success) {
      setActiveModal(null);
      showSuccess(selectedCard ? "Card updated" : "Card added");
    }
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    const result = await softDeleteCard(selectedCard.card_id);
    setIsSubmitting(false);
    if (result.success) {
      setActiveModal(null);
      showSuccess("Card moved to archive");
    }
  };

  const downloadExampleCsv = () => {
    const headers = ["Card Number & Name", "suit", "image_url", "position"];
    const exampleRows = [
      ["0 The Fool", "Major Arcana", "https://example.com/fool.jpg", "0"],
      ["1 The Magician", "Major Arcana", "https://example.com/magician.jpg", "1"],
    ];
    const csvContent = [headers, ...exampleRows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "example_cards.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImageUpload = async (cardId, file) => {
    if (!file) return;
    setIsSubmitting(true);
    const result = await updateCardImage(cardId, file);
    setIsSubmitting(false);
    if (result.success) {
      showSuccess("Card artwork updated");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 text-[#E8E2D5]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-[#C5A059]/20 gap-6">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => navigate("/admin/decks")}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[#9E9689] hover:text-[#C5A059] transition-colors rounded-sm px-1.5 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
          >
            <ChevronLeft size={15} />
            <span>Back to Decks</span>
          </button>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-[0.06em] text-[#E8E2D5]">
            {currentDeck?.deck_name || "Card Registry"}
          </h1>
          <p className="font-serif italic text-base text-[#9E9689]">
            Catalog artwork, correspondence metadata, and interpretations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleOpenForm("add")}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-sm bg-[#C5A059] hover:bg-[#D2B06B] text-[#0B0A0E] font-display text-xs font-semibold uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E2D5]"
          >
            <Plus size={16} />
            <span>Add Card</span>
          </button>

          <label className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-sm border border-[#C5A059]/35 bg-[#141218] hover:border-[#C5A059]/70 cursor-pointer transition-colors focus-within:ring-1 focus-within:ring-[#C5A059]">
            <Upload size={16} className="text-[#C5A059]" />
            <span className="font-display text-xs uppercase tracking-[0.16em] text-[#E8E2D5]">
              Import CSV
            </span>
            <input
              type="file"
              accept=".csv"
              aria-label="Import cards CSV file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadCards(deckId, file);
                e.target.value = "";
              }}
              className="sr-only"
            />
          </label>

          <button
            type="button"
            onClick={downloadExampleCsv}
            aria-label="Download sample CSV template"
            title="Download sample CSV"
            className="p-2.5 rounded-sm border border-[#C5A059]/25 bg-[#141218] text-[#9E9689] hover:text-[#C5A059] hover:border-[#C5A059]/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
          >
            <Download size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
        <AnimatePresence>
          {cards.map((card) => (
            <Motion.article
              layout
              key={card.card_id}
              className="folio-plate group relative rounded-sm overflow-hidden hover:border-[#C5A059]/60 transition-colors duration-300 flex flex-col p-1.5"
            >
              <div className="relative aspect-[3/5] w-full overflow-hidden rounded-[2px] border border-[#8A6D3B]/35 bg-[#0B0A0E]">
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.card_name}
                    width={300}
                    height={500}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center bg-[#1C1917]">
                    <span className="font-display text-lg text-[#C5A059]">
                      {toRomanNumeral(card.card_position ?? 0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-1.5 border-t border-[#C5A059]/20 px-1 pt-1.5">
                <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-[#C5A059] truncate">
                  {card.card_suit}
                </span>
                <h3 className="font-serif text-sm font-medium text-[#E8E2D5] truncate">
                  {card.card_name}
                </h3>
              </div>

              <div className="mt-2 pt-1.5 border-t border-[#C5A059]/15 flex items-center justify-between gap-1 px-0.5">
                <label
                  title="Upload card artwork"
                  className="flex-1 flex items-center justify-center p-1.5 rounded-sm border border-[#C5A059]/25 bg-[#1C1917] text-[#E8E2D5] hover:text-[#C5A059] hover:border-[#C5A059] cursor-pointer transition-colors focus-within:ring-1 focus-within:ring-[#C5A059]"
                >
                  <ImageIcon size={14} />
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    aria-label={`Upload image for ${card.card_name}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(card.card_id, file);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  aria-label={`View ${card.card_name}`}
                  onClick={() => {
                    setSelectedCard(card);
                    setActiveModal("detail");
                  }}
                  className="flex-1 flex items-center justify-center p-1.5 rounded-sm border border-[#C5A059]/25 bg-[#1C1917] text-[#E8E2D5] hover:text-[#C5A059] hover:border-[#C5A059] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Edit ${card.card_name}`}
                  onClick={() => handleOpenForm("edit", card)}
                  className="flex-1 flex items-center justify-center p-1.5 rounded-sm border border-[#C5A059]/25 bg-[#1C1917] text-[#E8E2D5] hover:text-[#C5A059] hover:border-[#C5A059] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${card.card_name}`}
                  onClick={() => {
                    setSelectedCard(card);
                    setActiveModal("delete");
                  }}
                  className="flex-1 flex items-center justify-center p-1.5 rounded-sm border border-[#8B3A32]/70 bg-[#5E1914]/45 text-[#E8E2D5] hover:bg-[#5E1914] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Motion.article>
          ))}
        </AnimatePresence>
      </div>

      {isLoading && cards.length === 0 && (
        <div className="py-24 flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#C5A059]" size={32} strokeWidth={1.5} />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#9E9689]">
            Loading cards…
          </p>
        </div>
      )}

      {/* Toast Notifications */}
      <div
        aria-live="polite"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-[100] space-y-3 sm:max-w-md sm:w-full"
      >
        <AnimatePresence>
          {error && (
            <Motion.div
              role="alert"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="folio-plate rounded-sm border-[#8B3A32] bg-[#5E1914]/90 p-4 flex items-start gap-3"
            >
              <AlertCircle size={18} className="text-[#C9A49A] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-display text-xs uppercase tracking-[0.14em] text-[#E8E2D5]">
                  Action Failed
                </p>
                <p className="text-xs text-[#E8E2D5]/90 mt-1">{error}</p>
              </div>
              <button
                type="button"
                aria-label="Dismiss error"
                onClick={clearError}
                className="text-[#9E9689] hover:text-[#E8E2D5] p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
              >
                <X size={16} />
              </button>
            </Motion.div>
          )}
          {successMessage && (
            <Motion.div
              role="status"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="folio-plate rounded-sm border-[#C5A059]/60 bg-[#141218] p-4 flex items-center gap-3"
            >
              <CheckCircle2 size={18} className="text-[#C5A059] shrink-0" />
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#E8E2D5]">
                {successMessage}
              </span>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Dialog System */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 lg:p-8 overscroll-contain">
            <Motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setActiveModal(null)}
              className="absolute inset-0 bg-[#0B0A0E]/85"
            />

            <Motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="card-modal-title"
              initial={{ scale: 0.97, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 10 }}
              transition={{ duration: 0.35, ease: RITUAL_EASE }}
              style={{ overscrollBehavior: "contain" }}
              className="folio-plate folio-inset relative w-full max-w-5xl rounded-sm overflow-hidden max-h-[92dvh] sm:max-h-[90dvh] flex flex-col"
            >
              <div className="flex justify-between items-center gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-[#C5A059]/20 bg-[#1C1917]/65 sticky top-0 z-10">
                <h2
                  id="card-modal-title"
                  className="font-display text-lg sm:text-2xl tracking-[0.08em] uppercase text-[#E8E2D5] truncate min-w-0"
                >
                  {activeModal === "add" && "New Card"}
                  {activeModal === "edit" && `Edit · ${selectedCard?.card_name}`}
                  {activeModal === "detail" && selectedCard?.card_name}
                  {activeModal === "delete" && "Delete Card"}
                </h2>
                <button
                  type="button"
                  aria-label="Close card dialog"
                  onClick={() => setActiveModal(null)}
                  className="p-2 shrink-0 rounded-sm border border-[#C5A059]/25 bg-[#141218] text-[#9E9689] hover:text-[#E8E2D5] hover:border-[#C5A059]/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-10">
                {activeModal === "delete" ? (
                  <div className="py-6 text-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-sm border border-[#8B3A32] bg-[#5E1914]/35 flex items-center justify-center mx-auto mb-5">
                      <Trash2 size={20} className="text-[#C9A49A]" />
                    </div>
                    <h3 className="font-display text-xl uppercase tracking-[0.08em] mb-2 text-[#E8E2D5]">
                      Remove Card?
                    </h3>
                    <p className="font-serif text-sm text-[#9E9689] mb-7 leading-relaxed">
                      This will soft-delete{" "}
                      <span className="text-[#E8E2D5] font-medium">
                        &ldquo;{selectedCard?.card_name}&rdquo;
                      </span>{" "}
                      from this deck.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={confirmDelete}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 rounded-sm border border-[#8B3A32] bg-[#5E1914] hover:bg-[#74211B] font-display text-xs uppercase tracking-[0.16em] text-[#E8E2D5] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                      >
                        {isSubmitting ? "Removing…" : "Delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="flex-1 py-2.5 rounded-sm border border-[#C5A059]/25 bg-[#1C1917] text-[#9E9689] hover:text-[#E8E2D5] font-display text-xs uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : activeModal === "detail" ? (
                  <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10">
                    <div className="w-44 sm:w-56 lg:w-72 aspect-[3/5] shrink-0 self-center lg:self-start rounded-sm overflow-hidden border border-[#8A6D3B]/45 bg-[#0B0A0E] p-2 shadow-cast">
                      {selectedCard?.image_url ? (
                        <img
                          src={selectedCard.image_url}
                          width={360}
                          height={600}
                          decoding="async"
                          className="w-full h-full object-cover rounded-[2px]"
                          alt={selectedCard.card_name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1C1917]">
                          <span className="font-display text-2xl text-[#C5A059]">
                            {toRomanNumeral(selectedCard?.card_position ?? 0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailTag
                          label="Suit"
                          value={selectedCard?.card_suit}
                          icon={LayoutGrid}
                        />
                        <DetailTag
                          label="Position"
                          value={`${toRomanNumeral(selectedCard?.card_position ?? 0)} (#${selectedCard?.card_position})`}
                          icon={Compass}
                        />
                      </div>
                      <MeaningBlock
                        title="Upright Meaning"
                        text={selectedCard?.card_metadata?.upright_meaning}
                        keywords={selectedCard?.card_metadata?.upright_keywords}
                        type="upright"
                      />
                      <MeaningBlock
                        title="Reversed Meaning"
                        text={selectedCard?.card_metadata?.reversed_meaning}
                        keywords={selectedCard?.card_metadata?.reversed_keywords}
                        type="reversed"
                      />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <InputField
                        id="card-name-input"
                        label="Card Name"
                        value={formData.card_name}
                        onChange={(v) =>
                          setFormData({ ...formData, card_name: v })
                        }
                        placeholder="The High Priestess"
                      />
                      <InputField
                        id="card-suit-input"
                        label="Suit"
                        value={formData.card_suit}
                        onChange={(v) =>
                          setFormData({ ...formData, card_suit: v })
                        }
                        placeholder="Major Arcana"
                      />
                      <InputField
                        id="card-position-input"
                        label="Position Index"
                        type="number"
                        value={formData.card_position}
                        onChange={(v) =>
                          setFormData({ ...formData, card_position: v })
                        }
                        placeholder="2"
                      />
                    </div>

                    <div className="space-y-4 border-t border-[#C5A059]/20 pt-6">
                      <h3 className="font-display text-xs uppercase tracking-[0.2em] text-[#C5A059]">
                        Upright Interpretation
                      </h3>
                      <InputField
                        id="card-upright-keywords"
                        label="Upright Keywords (comma separated)"
                        value={formData.upright_keywords}
                        onChange={(v) =>
                          setFormData({ ...formData, upright_keywords: v })
                        }
                      />
                      <TextAreaField
                        id="card-upright-meaning"
                        label="Upright Meaning"
                        value={formData.upright_meaning}
                        onChange={(v) =>
                          setFormData({ ...formData, upright_meaning: v })
                        }
                      />
                    </div>

                    <div className="space-y-4 border-t border-[#5E1914]/45 pt-6">
                      <h3 className="font-display text-xs uppercase tracking-[0.2em] text-[#C9A49A]">
                        Reversed / Shadow Interpretation
                      </h3>
                      <InputField
                        id="card-reversed-keywords"
                        label="Reversed Keywords"
                        value={formData.reversed_keywords}
                        onChange={(v) =>
                          setFormData({ ...formData, reversed_keywords: v })
                        }
                      />
                      <TextAreaField
                        id="card-reversed-meaning"
                        label="Reversed Meaning"
                        value={formData.reversed_meaning}
                        onChange={(v) =>
                          setFormData({ ...formData, reversed_meaning: v })
                        }
                      />
                    </div>

                    <InputField
                      id="card-element-input"
                      label="Zodiac / Element"
                      value={formData.element_zodiac}
                      onChange={(v) =>
                        setFormData({ ...formData, element_zodiac: v })
                      }
                      placeholder="Water / Moon"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-sm bg-[#C5A059] hover:bg-[#D2B06B] text-[#0B0A0E] font-display text-xs font-semibold uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E2D5]"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin mx-auto" size={18} />
                      ) : selectedCard ? (
                        "Update Card"
                      ) : (
                        "Add Card"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const InputField = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="block font-mono text-[11px] uppercase tracking-[0.16em] text-[#9E9689]"
    >
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required
      className="w-full rounded-sm border border-[#C5A059]/25 bg-[#1C1917] px-3.5 py-2.5 text-sm text-[#E8E2D5] placeholder:text-[#9E9689]/45 focus-visible:outline-none focus-visible:border-[#C5A059] focus-visible:ring-1 focus-visible:ring-[#C5A059]/60"
    />
  </div>
);

const TextAreaField = ({ id, label, value, onChange }) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="block font-mono text-[11px] uppercase tracking-[0.16em] text-[#9E9689]"
    >
      {label}
    </label>
    <textarea
      id={id}
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-sm border border-[#C5A059]/25 bg-[#1C1917] px-3.5 py-2.5 text-sm text-[#E8E2D5] resize-none focus-visible:outline-none focus-visible:border-[#C5A059] focus-visible:ring-1 focus-visible:ring-[#C5A059]/60"
    />
  </div>
);

const DetailTag = ({ label, value, icon }) => {
  const IconComponent = icon;
  return (
    <div className="rounded-sm border border-[#C5A059]/25 bg-[#1C1917] p-4 flex items-center gap-3.5">
      <div className="p-2 rounded-sm border border-[#C5A059]/30 bg-[#141218] text-[#C5A059]">
        <IconComponent size={16} />
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9E9689]">
          {label}
        </p>
        <p className="font-serif text-lg text-[#E8E2D5] tabular-nums">{value}</p>
      </div>
    </div>
  );
};

const MeaningBlock = ({ title, text, keywords, type }) => (
  <div
    className={`p-5 rounded-sm border ${
      type === "upright"
        ? "bg-[#1C1917] border-[#C5A059]/30"
        : "bg-[#5E1914]/20 border-[#8B3A32]"
    }`}
  >
    <h4
      className={`font-display text-xs uppercase tracking-[0.18em] mb-3 ${
        type === "upright" ? "text-[#C5A059]" : "text-[#C9A49A]"
      }`}
    >
      {title}
    </h4>
    <div className="flex flex-wrap gap-2 mb-4">
      {keywords?.split(",").map(
        (kw) =>
          kw.trim() && (
            <span
              key={kw}
              className="px-2.5 py-1 rounded-sm bg-[#141218] border border-[#C5A059]/20 font-mono text-[10px] text-[#E8E2D5]"
            >
              {kw.trim()}
            </span>
          ),
      )}
    </div>
    <p
      className={`font-serif text-base text-[#E8E2D5]/90 leading-relaxed max-w-[65ch] ${
        type === "reversed" ? "italic" : ""
      }`}
    >
      {text || "No description recorded."}
    </p>
  </div>
);
