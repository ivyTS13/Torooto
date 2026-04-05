import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  ChevronLeft,
  LayoutGrid,
  Moon,
  Sun,
  Compass,
} from "lucide-react";
import useCardStore from "../../stores/cardStore";
import useDeckStore from "../../stores/deckStore";
import { useRef } from "react";

export default function CardManagement() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef({});
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

  // Modals state
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

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
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
      card_position: parseInt(formData.card_position),
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
      showSuccess(selectedCard ? "Arcana updated" : "Card manifested");
    }
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    const result = await softDeleteCard(selectedCard.card_id);
    setIsSubmitting(false);
    if (result.success) {
      setActiveModal(null);
      showSuccess("Card vanished from deck");
    }
  };

  const downloadExampleCsv = () => {
    const headers = ["Card Number & Name", "suit", "image_url", "position"];
    const exampleRows = [
      ["0 The Fool", "Major Arcana", "https://example.com/fool.jpg", "0"],
      [
        "1 The Magician",
        "Major Arcana",
        "https://example.com/magician.jpg",
        "1",
      ],
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

  // Add this helper function
  const handleImageUpload = async (cardId, file) => {
    if (!file) return;
    setIsSubmitting(true);
    const result = await updateCardImage(cardId, file);
    setIsSubmitting(false);
    if (result.success) {
      showSuccess("Vision updated");
    }
  };
  return (
    // Softer background: Deep Obsidian Slate instead of pure black
    <div className="min-h-screen bg-[#121217] text-gray-100 p-6 lg:p-10 font-sans selection:bg-purple-500/30 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
        <div className="space-y-2">
          <button
            onClick={() => navigate("/admin/decks")}
            className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest hover:text-purple-300 transition group"
          >
            <ChevronLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Back to Library
          </button>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-50 to-indigo-300 bg-clip-text text-transparent italic tracking-tight">
            {currentDeck?.deck_name || "Manage Deck"}
          </h1>
          <p className="text-gray-400 text-sm tracking-wide">
            Catalog and edit the mystical properties of your cards.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleOpenForm("add")}
            className="flex items-center gap-2 px-6 py-3 bg-white text-[#121217] rounded-2xl font-bold hover:bg-purple-100 transition shadow-lg shadow-white/5"
          >
            <Plus size={18} /> Add Card
          </button>
          <label className="flex items-center gap-2 px-6 py-3 bg-purple-950/40 border border-purple-500/20 rounded-2xl cursor-pointer hover:bg-purple-900/50 transition">
            <Upload size={18} className="text-purple-400" />
            <span className="font-bold text-purple-100">Bulk Import</span>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => uploadCards(deckId, e.target.files[0])}
              className="hidden"
            />
          </label>
          <button
            onClick={downloadExampleCsv}
            className="p-3 bg-gray-800/60 border border-white/5 rounded-2xl hover:bg-gray-800 transition text-gray-400"
            title="Download Example CSV"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 relative z-10">
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              layout
              key={card.card_id}
              className="group relative aspect-[3/5] bg-gray-900/80 border border-white/5 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-500 shadow-xl shadow-black/20"
            >
              {/* Image container – same as DeckExplorer */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt=""
                    className="w-full h-full object-contain transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <Sparkles size={32} className="text-purple-500/20" />
                )}
              </div>

              {/* Gradient overlay – softer, like DeckExplorer */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300 mb-1">
                  {card.card_suit}
                </span>
                <h3 className="text-lg font-bold text-gray-50 mb-3 italic leading-tight">
                  {card.card_name}
                </h3>

                {/* Centered button group – same as before but without flex-1 */}
                <div className="flex justify-center gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <label className="bg-white/5 backdrop-blur-md p-2.5 rounded-lg border border-white/10 hover:bg-indigo-500/30 hover:border-indigo-500/50 text-indigo-100 cursor-pointer">
                    <ImageIcon size={16} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(card.card_id, e.target.files[0])
                      }
                    />
                  </label>
                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setActiveModal("detail");
                    }}
                    className="bg-white/5 backdrop-blur-md p-2.5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20"
                  >
                    <Eye size={16} className="text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleOpenForm("edit", card)}
                    className="bg-white/5 backdrop-blur-md p-2.5 rounded-lg border border-white/10 hover:bg-purple-500/30 hover:border-purple-500/50 text-purple-100"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setActiveModal("delete");
                    }}
                    className="bg-rose-950/50 backdrop-blur-md p-2.5 rounded-lg border border-rose-500/20 hover:bg-rose-600/60 text-rose-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading state against softer bg */}
      {isLoading && cards.length === 0 && (
        <div className="py-32 flex flex-col items-center max-w-7xl mx-auto relative z-10">
          <Loader2 className="animate-spin text-purple-500/50" size={40} />
          <p className="text-purple-300/30 mt-4 text-xs uppercase tracking-wider font-bold">
            Consulting the ether...
          </p>
        </div>
      )}

      {/* TOAST SYSTEM */}
      <div className="fixed bottom-10 right-10 z-[100] space-y-4 max-w-md w-full">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-rose-950/80 border border-rose-500/30 backdrop-blur-xl p-5 rounded-2xl flex items-start gap-4 shadow-2xl shadow-black/30"
            >
              <AlertCircle className="text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-rose-50">
                  Error encountered
                </p>
                <p className="text-xs text-rose-100/80 mt-1">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-rose-300 hover:text-white"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-emerald-950/80 border border-emerald-500/30 backdrop-blur-xl p-5 rounded-2xl flex items-center gap-4 shadow-2xl shadow-black/30"
            >
              <CheckCircle2 className="text-emerald-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-emerald-50">
                {successMessage}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL SYSTEM */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-[#0a0c14]/90 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              // Softer Dark Gray Modal: bg-[#13151f]
              className="relative w-full max-w-5xl bg-[#13151f] border border-white/5 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-8 border-b border-white/5 sticky top-0 bg-[#13151f] z-10">
                <h2 className="text-3xl font-bold italic tracking-tight text-gray-50">
                  {activeModal === "add" && "New Arcana"}
                  {activeModal === "edit" &&
                    `Refine ${selectedCard?.card_name}`}
                  {activeModal === "detail" && selectedCard?.card_name}
                </h2>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-3 hover:bg-white/5 rounded-full transition text-gray-500 hover:text-white"
                >
                  <X />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                {activeModal === "delete" ? (
                  <div className="py-12 text-center max-w-sm mx-auto">
                    <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Trash2 size={40} className="text-rose-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-50">
                      Banish this Card?
                    </h3>
                    <p className="text-gray-400 mb-8">
                      This will move "{selectedCard?.card_name}" to your
                      archives.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={confirmDelete}
                        className="flex-1 py-4 bg-rose-600 rounded-2xl font-bold hover:bg-rose-500 transition shadow-lg shadow-rose-900/30"
                      >
                        Confirm Banish
                      </button>
                      <button
                        onClick={() => setActiveModal(null)}
                        className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl transition text-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : activeModal === "detail" ? (
                  <div className="flex flex-col lg:flex-row gap-12">
                  <div className="w-full lg:w-1/3 aspect-[3/5] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-gray-950 flex items-center justify-center">
                      {selectedCard?.image_url ? (
                        <img
                          src={selectedCard.image_url}
                          className="w-full h-full object-covergrayscale-[15%]"
                          alt=""
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="text-white/5" size={60} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                        <DetailTag
                          label="Suit"
                          value={selectedCard?.card_suit}
                          icon={LayoutGrid}
                        />
                        <DetailTag
                          label="Position"
                          value={`#${selectedCard?.card_position?.toString().padStart(2, "0")}`}
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
                        keywords={
                          selectedCard?.card_metadata?.reversed_keywords
                        }
                        type="reversed"
                      />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField
                        label="Card Name"
                        value={formData.card_name}
                        onChange={(v) =>
                          setFormData({ ...formData, card_name: v })
                        }
                        placeholder="The High Priestess"
                      />
                      <InputField
                        label="Suit"
                        value={formData.card_suit}
                        onChange={(v) =>
                          setFormData({ ...formData, card_suit: v })
                        }
                        placeholder="Major Arcana"
                      />
                      <InputField
                        label="Position Index"
                        type="number"
                        value={formData.card_position}
                        onChange={(v) =>
                          setFormData({ ...formData, card_position: v })
                        }
                        placeholder="2"
                      />
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-purple-400 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Sun size={14} /> Upright Properties
                      </h4>
                      <InputField
                        label="Upright Keywords (comma separated)"
                        value={formData.upright_keywords}
                        onChange={(v) =>
                          setFormData({ ...formData, upright_keywords: v })
                        }
                      />
                      <TextAreaField
                        label="Upright Meaning"
                        value={formData.upright_meaning}
                        onChange={(v) =>
                          setFormData({ ...formData, upright_meaning: v })
                        }
                      />
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-rose-400 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Moon size={14} /> Reversed Properties
                      </h4>
                      <InputField
                        label="Reversed Keywords"
                        value={formData.reversed_keywords}
                        onChange={(v) =>
                          setFormData({ ...formData, reversed_keywords: v })
                        }
                      />
                      <TextAreaField
                        label="Reversed Meaning"
                        value={formData.reversed_meaning}
                        onChange={(v) =>
                          setFormData({ ...formData, reversed_meaning: v })
                        }
                      />
                    </div>

                    <InputField
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
                      className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl font-bold text-lg hover:brightness-110 transition shadow-xl shadow-purple-500/20 text-white"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin mx-auto" />
                      ) : selectedCard ? (
                        "Update Card Record"
                      ) : (
                        "Manifest New Card"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.3); }
      `}</style>
    </div>
  );
}

/* HELPER COMPONENTS (Softened colors) */

const InputField = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
      {label}
    </label>
    {/* Darker input background: bg-gray-950 */}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required
      className="w-full bg-gray-950 border border-white/5 rounded-2xl px-5 py-4 focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-700 text-gray-100"
    />
  </div>
);

const TextAreaField = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
      {label}
    </label>
    {/* Darker textarea background: bg-gray-950 */}
    <textarea
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-950 border border-white/5 rounded-2xl px-5 py-4 focus:border-purple-500/50 outline-none transition-all resize-none text-gray-200"
    />
  </div>
);

const DetailTag = ({ label, value, icon: Icon }) => (
  // Soft gray tag background: bg-gray-900
  <div className="bg-gray-900 p-5 rounded-2xl border border-white/5 flex items-center gap-4">
    <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter">
        {label}
      </p>
      <p className="text-xl font-medium text-gray-50">{value}</p>
    </div>
  </div>
);

const MeaningBlock = ({ title, text, keywords, type }) => (
  // Meanings use deep, slightly more saturated backgrounds (emerald-950/20, rose-950/20) against soft gray
  <div
    className={`p-7 rounded-3xl border ${type === "upright" ? "bg-emerald-950/20 border-emerald-500/10" : "bg-rose-950/20 border-rose-500/10"}`}
  >
    <h4
      className={`text-xs font-black uppercase tracking-[0.2em] mb-5 ${type === "upright" ? "text-emerald-400" : "text-rose-400"}`}
    >
      {title}
    </h4>
    <div className="flex flex-wrap gap-2.5 mb-5">
      {keywords?.split(",").map(
        (kw) =>
          kw.trim() && (
            <span
              key={kw}
              className="px-3 py-1 bg-gray-800 border border-white/5 rounded-lg text-[10px] font-semibold text-gray-300 tracking-wide"
            >
              {kw.trim()}
            </span>
          ),
      )}
    </div>
    <p
      className={`text-gray-200 leading-relaxed ${type === "reversed" ? "italic" : ""}`}
    >
      "{text || "No description provided."}"
    </p>
  </div>
);
