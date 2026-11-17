import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import usePileHistoryStore from "../../stores/usePileHistoryStore";

const ITEMS_PER_PAGE = 5;
const RITUAL_EASE = [0.22, 1, 0.36, 1];

export default function PileHistoryView({
  basePath = "/piles",
  title = "Reading History",
  subtitle = "Chronological record of your saved draws",
}) {
  const navigate = useNavigate();
  const { piles, totalPages, isLoading, error, fetchPiles, deletePile } =
    usePileHistoryStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pileToDelete, setPileToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPiles(currentPage, ITEMS_PER_PAGE);
  }, [fetchPiles, currentPage]);

  useEffect(() => {
    if (!isDeleteModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) {
        setIsDeleteModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleteModalOpen, isSubmitting]);

  const goPrevious = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages || 1, p + 1));

  const triggerDeleteRequest = (pile) => {
    setPileToDelete(pile);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!pileToDelete) return;
    setIsSubmitting(true);
    const result = await deletePile(pileToDelete.pile_id);
    setIsSubmitting(false);

    if (result.success) {
      setIsDeleteModalOpen(false);
      if (piles.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        fetchPiles(currentPage, ITEMS_PER_PAGE);
      }
    }
  };

  const handleViewPile = (pile) => {
    navigate(`${basePath}/${pile.pile_id}`, { state: { pile } });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto text-[#E8E2D5] w-full">
      <header className="mb-8 md:mb-10 pb-6 border-b border-[#C5A059]/20">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#C5A059] mb-2">
          Folio Ledger
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-[0.08em] text-[#E8E2D5]">
          {title}
        </h1>
        <p className="font-serif italic text-base text-[#9E9689] mt-1.5">
          {subtitle}
        </p>
      </header>

      <div className="folio-plate relative rounded-sm overflow-hidden">
        {isLoading && piles && piles.length > 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B0A0E]/70">
            <Loader2 className="animate-spin text-[#C5A059]" size={32} strokeWidth={1.5} />
          </div>
        )}

        {isLoading && (!piles || piles.length === 0) ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#C5A059]" size={32} strokeWidth={1.5} />
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#9E9689]">
              Loading readings…
            </p>
          </div>
        ) : error ? (
          <div className="py-20 px-6 flex flex-col items-center justify-center text-center">
            <AlertCircle size={28} className="mb-3 text-[#C9A49A]" />
            <p className="font-serif text-base text-[#E8E2D5]">{error}</p>
            <button
              type="button"
              onClick={() => fetchPiles(currentPage, ITEMS_PER_PAGE)}
              className="mt-5 px-5 py-2 rounded-sm border border-[#C5A059]/40 bg-[#1C1917] font-mono text-xs uppercase tracking-[0.16em] text-[#E8E2D5] hover:border-[#C5A059] hover:text-[#C5A059] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
            >
              Retry
            </button>
          </div>
        ) : !piles || piles.length === 0 ? (
          <div className="py-20 px-6 text-center font-serif italic text-base text-[#9E9689]">
            No readings have been recorded yet. Draw and save a spread to build your archive.
          </div>
        ) : (
          <>
            {/* Mobile Compact List */}
            <div className="block md:hidden divide-y divide-[#C5A059]/15">
              {piles.map((pile) => (
                <div key={pile.pile_id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs text-[#C5A059] tabular-nums">
                        #{pile.pile_id.split("-")[0]}
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-xs text-[#9E9689] mt-1 tabular-nums">
                        <Clock size={12} className="text-[#8A6D3B]" />
                        <span>{formatDate(pile.drawn_at)}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-sm border border-[#C5A059]/30 bg-[#1C1917] font-mono text-[10px] uppercase tracking-[0.14em] text-[#E8E2D5] tabular-nums">
                      {pile.pile_contents?.length || 0} Card
                      {pile.pile_contents?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-[#C5A059]/10">
                    <button
                      type="button"
                      onClick={() => handleViewPile(pile)}
                      className="p-2 rounded-sm border border-transparent text-[#9E9689] hover:text-[#C5A059] hover:border-[#C5A059]/30 hover:bg-[#1C1917] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                      title="View Reading"
                      aria-label={`View reading ${pile.pile_id.split("-")[0]}`}
                    >
                      <Eye size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerDeleteRequest(pile)}
                      className="p-2 rounded-sm border border-transparent text-[#9E9689] hover:text-[#C9A49A] hover:border-[#8B3A32] hover:bg-[#5E1914]/35 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                      title="Delete Reading"
                      aria-label={`Delete reading ${pile.pile_id.split("-")[0]}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Ledger Table */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead className="bg-[#1C1917]/65 text-[#9E9689] font-mono text-[11px] uppercase tracking-[0.18em] border-b border-[#C5A059]/20">
                <tr>
                  <th className="px-6 py-4 font-medium">Reading ID</th>
                  <th className="px-6 py-4 font-medium">Recorded At</th>
                  <th className="px-6 py-4 font-medium">Spread Size</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A059]/15">
                {piles.map((pile) => (
                  <tr
                    key={pile.pile_id}
                    className="hover:bg-[#1C1917]/55 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-[#C5A059] tabular-nums">
                      #{pile.pile_id.split("-")[0]}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-mono text-xs text-[#E8E2D5]/90 tabular-nums">
                        <Clock size={13} className="text-[#8A6D3B]" />
                        <span>{formatDate(pile.drawn_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-sm border border-[#C5A059]/25 bg-[#1C1917] font-mono text-[10px] uppercase tracking-[0.14em] text-[#E8E2D5] tabular-nums">
                        {pile.pile_contents?.length || 0} Card
                        {pile.pile_contents?.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewPile(pile)}
                          className="p-2 rounded-sm border border-transparent text-[#9E9689] hover:text-[#C5A059] hover:border-[#C5A059]/30 hover:bg-[#1C1917] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                          title="View Reading"
                          aria-label={`View reading ${pile.pile_id.split("-")[0]}`}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerDeleteRequest(pile)}
                          className="p-2 rounded-sm border border-transparent text-[#9E9689] hover:text-[#C9A49A] hover:border-[#8B3A32] hover:bg-[#5E1914]/35 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                          title="Delete Reading"
                          aria-label={`Delete reading ${pile.pile_id.split("-")[0]}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-[#C5A059]/20 bg-[#1C1917]/40">
                <span className="font-mono text-xs text-[#9E9689] tabular-nums">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label="Previous page"
                    onClick={goPrevious}
                    disabled={currentPage === 1 || isLoading}
                    className="p-2 rounded-sm border border-[#C5A059]/25 bg-[#141218] text-[#9E9689] hover:text-[#C5A059] hover:border-[#C5A059]/60 disabled:opacity-35 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next page"
                    onClick={goNext}
                    disabled={currentPage === totalPages || isLoading}
                    className="p-2 rounded-sm border border-[#C5A059]/25 bg-[#141218] text-[#9E9689] hover:text-[#C5A059] hover:border-[#C5A059]/60 disabled:opacity-35 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0B0A0E]/85 overscroll-contain"
            onClick={() => !isSubmitting && setIsDeleteModalOpen(false)}
          >
            <Motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-reading-title"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.35, ease: RITUAL_EASE }}
              style={{ overscrollBehavior: "contain" }}
              onClick={(e) => e.stopPropagation()}
              className="folio-plate folio-inset w-full max-w-sm rounded-sm border-[#8B3A32] p-7 text-center"
            >
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-sm border border-[#8B3A32] bg-[#5E1914]/35">
                <Trash2 size={20} className="text-[#C9A49A]" />
              </div>
              <h2
                id="delete-reading-title"
                className="font-display text-xl tracking-[0.08em] uppercase text-[#E8E2D5] mb-2"
              >
                Delete Reading?
              </h2>
              <p className="font-serif text-sm text-[#9E9689] mb-7 leading-relaxed">
                This reading record will be permanently removed from your saved history.
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-sm border border-[#8B3A32] bg-[#5E1914] hover:bg-[#74211B] font-display text-xs uppercase tracking-[0.18em] text-[#E8E2D5] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                >
                  {isSubmitting ? "Removing…" : "Delete Reading"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-sm border border-[#C5A059]/25 bg-[#1C1917] text-[#9E9689] hover:text-[#E8E2D5] hover:border-[#C5A059]/50 font-display text-xs uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                >
                  Cancel
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
