import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import useDrawerStore from "../stores/pileStore";

export default function CardSlot({ index }) {
  const { drawnCards, flippedCards, toggleFlip } = useDrawerStore();

  const card = drawnCards[index];
  const isFlipped = card ? !!flippedCards[card.card_id] : false;

  return (
    <div className="relative flex flex-col items-center">
      {/* ========================================================= */}
      {/* Card Container */}
      {/* ========================================================= */}
      <div
        className="relative w-28 lg:w-36 aspect-[3/5]"
        style={{ perspective: "1800px" }}
      >
        {/* Empty Slot */}
        {!card && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="
              absolute
              inset-0
              rounded-[20px]
              border
              border-white/[0.08]
              bg-white/[0.03]
              backdrop-blur-xl
              overflow-hidden
            "
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

        {/* CARD */}
        {card && (
          <motion.div
            layoutId={`card-${card.card_id}`}
            className="absolute inset-0 cursor-pointer"
            style={{
              transformStyle: "preserve-3d",
            }}
            animate={{
              rotateY: isFlipped ? 180 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 22,
            }}
            whileHover={{
              y: -8,
              scale: 1.03,
            }}
            onClick={() => toggleFlip(card.card_id)}
          >

            {/* ===================================================== */}
            {/* BACK - Cosmic Galaxy Theme */}
            {/* ===================================================== */}
            <div
              className="
                absolute
                inset-0
                rounded-[20px]
                overflow-hidden
                bg-gradient-to-b
                from-[#312e5a]
                via-[#20264a]
                to-[#15162b]
                border
                border-amber-300/30
                shadow-[0_20px_60px_rgba(20,20,60,.7),0_0_25px_rgba(250,200,80,.18)]
              "
              style={{
                backfaceVisibility: "hidden",
              }}
            >

              {/* galaxy glow */}
              <div
                className="
                  absolute
                  -inset-10
                  bg-gradient-to-br
                  from-indigo-400/20
                  via-purple-400/10
                  to-transparent
                  blur-3xl
                "
              />

              {/* border */}
              <div
                className="
                  absolute
                  inset-[6px]
                  rounded-[14px]
                  border
                  border-amber-200/20
                "
              />


              {/* center symbol */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="
                    w-14
                    h-14
                    rounded-full
                    border
                    border-amber-200/25
                    flex
                    items-center
                    justify-center
                  "
                >
                  <div
                    className="
                      w-8
                      h-8
                      rounded-full
                      border
                      border-amber-200/30
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <div
                      className="
                        w-2
                        h-2
                        rounded-full
                        bg-amber-200/70
                        shadow-[0_0_12px_rgba(252,211,77,.9)]
                      "
                    />
                  </div>
                </div>
              </div>


              {/* top */}
              <div className="absolute top-5 left-0 right-0 text-center">
                <p className="text-[8px] tracking-[0.4em] uppercase text-amber-100/50">
                  Tarot
                </p>
              </div>


              {/* bottom */}
              <div className="absolute bottom-5 left-0 right-0 text-center">
                <p className="text-[8px] tracking-[0.4em] uppercase text-amber-100/50">
                  Reading
                </p>
              </div>

            </div>


            {/* ===================================================== */}
            {/* FRONT */}
            {/* ===================================================== */}
            <div
              className="
                absolute
                inset-0
                rounded-[20px]
                overflow-hidden
                bg-[#15162b]
                border
                border-amber-300/30
                shadow-[0_20px_60px_rgba(20,20,60,.75)]
              "
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
              }}
            >

              {/* magical glow */}
              <AnimatePresence>
                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="
                      absolute
                      -inset-20
                      bg-purple-400/10
                      blur-[70px]
                    "
                  />
                )}
              </AnimatePresence>


              {/* cosmic overlay */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-br
                  from-indigo-300/10
                  via-purple-300/10
                  to-transparent
                "
              />


              {/* image */}
              <div
                className={`relative h-full w-full ${
                  card.isReversed ? "rotate-180" : ""
                }`}
              >

                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.card_name}
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                      rounded-[20px]
                    "
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-200/50" />
                  </div>
                )}

              </div>

            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}