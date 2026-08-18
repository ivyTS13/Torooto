import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useDrawerStore from "../stores/pileStore";

export default function SemicircleDeck() {
  const { availableCards, pickManualCard } = useDrawerStore();
  
  // Track window width for dynamic responsiveness
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 900
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!availableCards.length) return null;

  const totalCards = availableCards.length;

  // Responsive Breakpoint
  const isMobile = windowWidth < 768;

  // Dynamic Card & Layout Variables
  const CARD_WIDTH = isMobile ? 64 : 92;
  const CARD_HEIGHT = isMobile ? 110 : 154;
  const DECK_CONTAINER_HEIGHT = isMobile ? 180 : 270;
  
  // Math for the arc
  const MAX_WIDTH = Math.min(windowWidth * 0.9, 900);
  const MAX_SPACING = isMobile ? 10 : 14; // Tighter spacing on mobile
  const FAN_ANGLE = isMobile ? 75 : 58;   // Wider fan angle on mobile to prevent extreme stacking
  const ARCH_HEIGHT = isMobile ? 14 : 24; // Less extreme vertical curve on mobile
  const HOVER_LIFT = isMobile ? 35 : 52;  // Distance card raises when tapped/hovered

  const spacing =
    totalCards > 1 ? Math.min(MAX_SPACING, MAX_WIDTH / (totalCards - 1)) : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center pointer-events-none select-none">
      
      {/* Cosmic background light pool */}
      <div
        className="
          absolute
          bottom-[-120px]
          w-[150vw] md:w-[900px]
          h-[200px] md:h-[260px]
          rounded-full
          bg-gradient-to-t
          from-indigo-500/20
          via-purple-500/15
          to-transparent
          blur-[100px] md:blur-[130px]
          pointer-events-none
        "
      />

      {/* Bottom vignette fade */}
      <div
        className="
          absolute
          inset-x-0
          bottom-0
          h-32 md:h-44
          bg-gradient-to-t
          from-[#050816]
          via-[#050816]/80
          to-transparent
          pointer-events-none
        "
      />

      {/* Deck Container */}
      <div
        className="relative pointer-events-auto transition-all duration-300"
        style={{ width: MAX_WIDTH, height: DECK_CONTAINER_HEIGHT }}
      >
        <AnimatePresence>
          {availableCards.map((card, index) => {
            const t = totalCards === 1 ? 0.5 : index / (totalCards - 1);
            const angle = -FAN_ANGLE / 2 + t * FAN_ANGLE;
            const x = (index - (totalCards - 1) / 2) * spacing;
            const normalized =
              (index - (totalCards - 1) / 2) / ((totalCards - 1) / 2 || 1);
            
            // Calculates the parabola (arch) for the y-axis
            const y = -(1 - normalized * normalized) * ARCH_HEIGHT;

            return (
              <motion.div
                key={card.card_id}
                initial={{ opacity: 0, y: 120 }}
                animate={{
                  opacity: 1,
                  x,
                  y,
                  rotate: angle,
                  scale: 1,
                  zIndex: index,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{
                  y: y - HOVER_LIFT,
                  scale: 1.15,
                  rotate: 0,
                  zIndex: 999,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                  },
                }}
                // Added whileTap for excellent mobile touch response
                whileTap={{
                  y: y - HOVER_LIFT,
                  scale: 1.15,
                  rotate: 0,
                  zIndex: 999,
                }}
                transition={{ duration: 0.2 }}
                onClick={() => pickManualCard(card)}
                className="absolute bottom-0 left-1/2 cursor-pointer group"
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  marginLeft: -CARD_WIDTH / 2,
                  transformOrigin: "bottom center",
                }}
              >
                {/* External Glow on Hover/Tap */}
                <div
                  className="
                    absolute
                    -inset-3 md:-inset-4
                    rounded-full
                    bg-purple-500/0
                    blur-xl md:blur-2xl
                    transition-all
                    duration-300
                    group-hover:bg-purple-400/25
                    pointer-events-none
                  "
                />

                {/* Card Main Body */}
                <div
                  className="
                    relative
                    w-full
                    h-full
                    rounded-[16px] md:rounded-[24px]
                    overflow-hidden
                    bg-gradient-to-b
                    from-[#312e5a]
                    via-[#20264a]
                    to-[#15162b]
                    border
                    border-amber-300/30
                    shadow-[0_10px_30px_rgba(20,20,60,.75),0_0_15px_rgba(250,200,80,.15)]
                    md:shadow-[0_20px_60px_rgba(20,20,60,.75),0_0_25px_rgba(250,200,80,.15)]
                    transition-shadow
                    duration-300
                    group-hover:shadow-[0_20px_50px_rgba(167,139,250,0.4),0_0_25px_rgba(250,200,80,0.35)]
                  "
                >
                  {/* Nebula Inner Light */}
                  <div
                    className="
                      absolute
                      -inset-6 md:-inset-10
                      bg-gradient-to-br
                      from-indigo-400/20
                      via-purple-400/10
                      to-transparent
                      blur-2xl md:blur-3xl
                      pointer-events-none
                    "
                  />

                  {/* REALISTIC LIGHTNING WAVE (Foil Sheen) */}
                  <div
                    className="
                      absolute
                      inset-0
                      opacity-0
                      group-hover:opacity-100
                      transition-opacity
                      duration-300
                      pointer-events-none
                      overflow-hidden
                    "
                  >
                    <motion.div
                      className="
                        absolute
                        -top-[50%]
                        -bottom-[50%]
                        w-[180%]
                        -left-[40%]
                        bg-gradient-to-r
                        from-transparent
                        via-white/10
                        via-amber-100/30
                        via-white/20
                        to-transparent
                        -skew-x-12
                      "
                      initial={{ x: "-120%" }}
                      whileHover={{
                        x: ["120%", "-120%"],
                        transition: {
                          repeat: Infinity,
                          repeatType: "loop",
                          duration: 1.6,
                          ease: "linear",
                        },
                      }}
                      whileTap={{
                        x: ["120%", "-120%"],
                        transition: {
                          repeat: Infinity,
                          repeatType: "loop",
                          duration: 1.6,
                          ease: "linear",
                        },
                      }}
                    />
                  </div>

                  {/* Inner Decorative Border */}
                  <div
                    className="
                      absolute
                      inset-[5px] md:inset-[8px]
                      rounded-[12px] md:rounded-[18px]
                      border
                      border-amber-200/20
                      pointer-events-none
                    "
                  />

                  {/* Center Emblem Symbol */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 md:w-20 md:h-20 rounded-full border border-amber-200/25 flex items-center justify-center">
                      <div className="w-7 h-7 md:w-12 md:h-12 rounded-full border border-amber-200/30 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-amber-200/70 shadow-[0_0_8px_rgba(252,211,77,.9)] md:shadow-[0_0_12px_rgba(252,211,77,.9)]" />
                      </div>
                    </div>
                  </div>

                  {/* Top Text */}
                  <div className="absolute top-4 md:top-7 left-0 right-0 text-center pointer-events-none">
                    <p className="text-[6px] md:text-[9px] tracking-[0.45em] uppercase text-amber-100/55 ml-[0.45em]">
                      TAROT
                    </p>
                  </div>

                  {/* Bottom Text */}
                  <div className="absolute bottom-4 md:bottom-7 left-0 right-0 text-center pointer-events-none">
                    <p className="text-[6px] md:text-[9px] tracking-[0.45em] uppercase text-amber-100/55 ml-[0.45em]">
                      DECK
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}