import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
  Flame,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import usePileHistoryStore from "../stores/usePileHistoryStore";

const ITEMS_PER_PAGE = 5;

export default function PileList() {
  const navigate = useNavigate();
  const { piles, totalPages, isLoading, error, fetchPiles, deletePile } =
    usePileHistoryStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pileToDelete, setPileToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data whenever currentPage changes (server-side pagination)
  useEffect(() => {
    fetchPiles(currentPage, ITEMS_PER_PAGE);
  }, [fetchPiles, currentPage]);

  const goPrevious = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages || 1, p + 1));

  const triggerDeleteRequest = (pile) => {
    setPileToDelete(pile);
    setIsDeleteModalOpen(true);
  };

  const confirmBanishment = async () => {
    if (!pileToDelete) return;
    setIsSubmitting(true);
    const result = await deletePile(pileToDelete.pile_id);
    setIsSubmitting(false);

    if (result.success) {
      setIsDeleteModalOpen(false);
      // If the current page becomes empty, go to previous page, otherwise refetch
      if (piles.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        fetchPiles(currentPage, ITEMS_PER_PAGE);
      }
    }
  };

  const handleViewPile = (pileId) => {
    navigate(`/admin/piles/${pileId}`);
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
    <div className="p-4 md:p-8 max-w-6xl mx-auto text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 md:mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-200 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Pile History
          </h1>
          <p className="text-gray-500 text-xs md:text-sm mt-2 tracking-wide uppercase font-medium">
            Echoes of Past Readings
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative bg-black/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Loading overlay when changing pages and we already have data */}
        {isLoading && piles.length > 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Loader2 className="animate-spin text-purple-400" size={40} />
          </div>
        )}

        {/* Full page loading (first load) */}
        {isLoading && piles.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-purple-500/50" size={40} />
            <p className="text-purple-300/30 font-mono text-xs uppercase tracking-[0.3em]">
              Summoning History...
            </p>
          </div>
        ) : error ? (
          <div className="py-20 flex flex-col items-center justify-center text-rose-300">
            <AlertCircle size={32} className="mb-4" />
            <p>{error}</p>
            <button
              onClick={() => fetchPiles(currentPage, ITEMS_PER_PAGE)}
              className="mt-6 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        ) : piles.length === 0 ? (
          <div className="py-20 text-center text-gray-500 italic font-serif text-sm md:text-base">
            No piles have been cast yet. Draw your first reading.
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4 p-4">
              {piles.map((pile) => (
                <div
                  key={pile.pile_id}
                  className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-purple-50 font-mono text-xs truncate max-w-[150px]">
                        {pile.pile_id.split("-")[0]}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                        <Clock size={12} className="text-purple-400/70" />
                        {formatDate(pile.drawn_at)}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-purple-950/30 text-purple-400 border border-purple-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {pile.pile_contents?.length || 0} Card
                      {pile.pile_contents?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleViewPile(pile.pile_id)}
                      className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                      title="View Reading"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => triggerDeleteRequest(pile)}
                      className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                      title="Delete Pile"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                <tr>
                  <th className="px-8 py-6">Pile ID</th>
                  <th className="px-8 py-6">Drawn At</th>
                  <th className="px-8 py-6">Cards</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {piles.map((pile) => (
                  <tr
                    key={pile.pile_id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="text-purple-50 font-mono text-xs truncate max-w-[150px]">
                        {pile.pile_id.split("-")[0]}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Clock size={14} className="text-purple-400/70" />
                        {formatDate(pile.drawn_at)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-purple-950/30 text-purple-400 border border-purple-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {pile.pile_contents?.length || 0} Card
                        {pile.pile_contents?.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleViewPile(pile.pile_id)}
                          className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                          title="View Reading"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => triggerDeleteRequest(pile)}
                          className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                          title="Delete Pile"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-t border-white/5 bg-white/[0.01]">
                <span className="text-gray-500 text-xs font-mono">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={goPrevious}
                    disabled={currentPage === 1 || isLoading}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={goNext}
                    disabled={currentPage === totalPages || isLoading}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0d0202] border border-rose-900/30 w-full max-w-sm rounded-[2rem] p-6 md:p-8 text-center shadow-2xl shadow-rose-950/20"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Flame
                  size={28}
                  className="text-rose-500 animate-pulse md:size-32"
                />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-rose-100 mb-2 font-serif">
                Banish This Pile?
              </h2>
              <p className="text-gray-500 text-xs md:text-sm mb-6 md:mb-8 leading-relaxed">
                The chronicle of this reading will be lost to the void. This
                cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmBanishment}
                  disabled={isSubmitting}
                  className="w-full py-3 md:py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-rose-900/40 disabled:opacity-50 text-sm md:text-base"
                >
                  {isSubmitting ? "Banishing..." : "Confirm Banishment"}
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-3 md:py-4 bg-transparent text-gray-500 hover:text-gray-300 font-medium transition-all text-sm"
                >
                  Keep the Memory
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}