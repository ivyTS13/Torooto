import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import useDrawerStore from "../stores/pileStore";

export default function CardSlot({ index }) {
  const drawnCards = useDrawerStore((state) => state.drawnCards);
  const flippedCards = useDrawerStore((state) => state.flippedCards);
  const toggleFlip = useDrawerStore((state) => state.toggleFlip);

  const card = drawnCards[index];
  const isFlipped = card ? !!flippedCards[card.card_id] : false;

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative w-28 lg:w-36 aspect-[3/5]"
        style={{ perspective: "1500px" }}
      >
        {!card && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-[20px] border border-white/[0.08] bg-white/[0.03] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-300/[0.05] to-transparent" />
            <div className="absolute inset-[6px] rounded-[14px] border border-white/[0.08]" />
            <div className="relative h-full flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border border-white/[0.1] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
              </div>
              <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-white/35">
                SLOT {index + 1}
              </p>
            </div>
          </motion.div>
        )}

        {card && (
          <motion.div
            layoutId={`card-${card.card_id}`}
            // "group" class enables the hover effects on the text/overlay inside
            className="absolute inset-0 cursor-pointer will-change-transform group" 
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 22 }}
            whileHover={{ y: -8, scale: 1.03 }}
            onClick={() => toggleFlip(card.card_id)}
          >
            {/* BACK OF CARD */}
            <div
              className="absolute inset-0 rounded-[20px] overflow-hidden bg-gradient-to-b from-[#312e5a] via-[#20264a] to-[#15162b] border border-amber-300/30 shadow-[0_10px_30px_rgba(20,20,60,.7)]"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="absolute inset-[6px] rounded-[14px] border border-amber-200/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border border-amber-200/25 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border border-amber-200/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-200/70 shadow-[0_0_8px_rgba(252,211,77,.9)]" />
                  </div>
                </div>
              </div>
              <div className="absolute top-5 left-0 right-0 text-center">
                <p className="text-[8px] tracking-[0.4em] uppercase text-amber-100/50">
                  Tarot
                </p>
              </div>
              <div className="absolute bottom-5 left-0 right-0 text-center">
                <p className="text-[8px] tracking-[0.4em] uppercase text-amber-100/50">
                  Reading
                </p>
              </div>
            </div>

            {/* FRONT OF CARD */}
            <div
              className="absolute inset-0 rounded-[20px] overflow-hidden bg-[#15162b] border border-amber-300/30 shadow-[0_10px_30px_rgba(20,20,60,.75)]"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
              }}
            >
              <div
                className={`absolute inset-0 flex items-center justify-center p-1 ${
                  card.isReversed ? "rotate-180" : ""
                }`}
              >
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.card_name}
                    loading="lazy"
                    // Removed grayscale to fix the "noise" issue
                    className="w-full h-full object-cover rounded-[16px] transition-all duration-500"
                  />
                ) : (
                  <Sparkles className="w-6 h-6 text-amber-200/50" />
                )}
              </div>

              {/* Gradient Overlay: Now invisible by default, fades in on hover */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-b-[20px]" />

              {/* Card Text: Invisible & slightly lowered by default, fades & slides up on hover */}
              <div className="absolute bottom-4 left-0 right-0 text-center z-10 px-2 pointer-events-none opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-white/90 drop-shadow-md">
                  {card.card_name} {card.isReversed && "(REV)"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}