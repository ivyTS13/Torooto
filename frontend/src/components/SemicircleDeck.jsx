import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import useDrawerStore from "../stores/pileStore";

const CardBack = React.memo(({ card, style, lift, isSelected, onSelect }) => {
  const { x, y, rotate, width, height, index } = style;

  return (
    <div
      onClick={onSelect}
      className="absolute bottom-0 left-1/2 cursor-pointer"
      style={{
        width,
        height,
        marginLeft: -width / 2,
        transform: `translate3d(${x}px, ${y + lift}px, 0) rotate(${
          isSelected ? 0 : rotate
        }deg) scale(${isSelected ? 1.15 : 1})`,
        transformOrigin: "bottom center",
        transition: "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
        willChange: isSelected ? "transform" : "auto",
        zIndex: isSelected ? 999 : index,
      }}
    >
      {/* Card back visual unchanged */}
      <div
        className={`relative w-full h-full rounded-[16px] md:rounded-[24px] overflow-hidden bg-gradient-to-b from-[#312e5a] via-[#20264a] to-[#15162b] border border-amber-300/30 ${
          isSelected
            ? "shadow-[0_20px_50px_rgba(167,139,250,0.4),0_0_25px_rgba(250,200,80,0.35)]"
            : "shadow-[0_10px_30px_rgba(20,20,60,0.75)]"
        }`}
      >
        <div className="absolute inset-[5px] md:inset-[8px] rounded-[12px] md:rounded-[18px] border border-amber-200/20 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 md:w-20 md:h-20 rounded-full border border-amber-200/25 flex items-center justify-center">
            <div className="w-7 h-7 md:w-12 md:h-12 rounded-full border border-amber-200/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-amber-200/70 shadow-[0_0_8px_rgba(252,211,77,0.9)]" />
            </div>
          </div>
        </div>
        <div className="absolute top-4 md:top-7 left-0 right-0 text-center pointer-events-none">
          <p className="text-[6px] md:text-[9px] tracking-[0.45em] uppercase text-amber-100/55 ml-[0.45em]">
            TAROT
          </p>
        </div>
        <div className="absolute bottom-4 md:bottom-7 left-0 right-0 text-center pointer-events-none">
          <p className="text-[6px] md:text-[9px] tracking-[0.45em] uppercase text-amber-100/55 ml-[0.45em]">
            DECK
          </p>
        </div>
      </div>
    </div>
  );
});

export default function SemicircleDeck() {
  const { availableCards, pickManualCard } = useDrawerStore();
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const containerRef = useRef(null);

  // Throttled resize listener
  useEffect(() => {
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setWindowWidth(window.innerWidth), 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Outside click using ref
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSelectedCardId(null);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleCardClick = useCallback(
    (e, card) => {
      e.stopPropagation();
      if (selectedCardId === card.card_id) {
        pickManualCard(card);
        setSelectedCardId(null);
      } else {
        setSelectedCardId(card.card_id);
      }
    },
    [selectedCardId, pickManualCard]
  );

  // ✅ useMemo is always called, even when availableCards is empty
  const cardStyles = useMemo(() => {
    if (!availableCards?.length) return [];

    const totalCards = availableCards.length;
    const isMobile = windowWidth < 768;
    const CARD_WIDTH = isMobile ? 64 : 92;
    const CARD_HEIGHT = isMobile ? 110 : 154;
    const MAX_WIDTH = Math.min(windowWidth * 0.9, 900);
    const MAX_SPACING = isMobile ? 10 : 14;
    const FAN_ANGLE = isMobile ? 75 : 58;
    const ARCH_HEIGHT = isMobile ? 14 : 24;
    const spacing =
      totalCards > 1 ? Math.min(MAX_SPACING, MAX_WIDTH / (totalCards - 1)) : 0;

    return availableCards.map((card, index) => {
      const t = totalCards === 1 ? 0.5 : index / (totalCards - 1);
      const angle = -FAN_ANGLE / 2 + t * FAN_ANGLE;
      const x = (index - (totalCards - 1) / 2) * spacing;
      const normalized =
        (index - (totalCards - 1) / 2) / ((totalCards - 1) / 2 || 1);
      const y = -(1 - normalized * normalized) * ARCH_HEIGHT;
      return {
        x,
        y,
        rotate: angle,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        index,
      };
    });
  }, [availableCards, windowWidth]);

  // Early return AFTER all hooks
  if (!availableCards?.length) return null;

  // Derived constants for JSX (not hooks)
  const isMobile = windowWidth < 768;
  const DECK_CONTAINER_HEIGHT = isMobile ? 180 : 270;
  const MAX_WIDTH = Math.min(windowWidth * 0.9, 900);
  const HOVER_LIFT = isMobile ? 35 : 52;

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center pointer-events-none select-none"
    >
      {/* Light pool using radial-gradient instead of blur */}
      <div
        className="absolute bottom-[-120px] w-[150vw] md:w-[900px] h-[200px] md:h-[260px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center bottom, rgba(99,102,241,0.2), rgba(168,85,247,0.15), transparent 70%)",
        }}
      />

      {/* Bottom vignette fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 md:h-44 bg-gradient-to-t from-[#050816] via-[#050816]/80 to-transparent pointer-events-none" />

      <div
        className="relative pointer-events-auto"
        style={{ width: MAX_WIDTH, height: DECK_CONTAINER_HEIGHT }}
      >
        {availableCards.map((card, index) => {
          const style = cardStyles[index];
          const isSelected = selectedCardId === card.card_id;

          return (
            <CardBack
              key={card.card_id}
              card={card}
              style={style}
              lift={isSelected ? -HOVER_LIFT : 0}
              isSelected={isSelected}
              onSelect={(e) => handleCardClick(e, card)}
            />
          );
        })}
      </div>
    </div>
  );
}