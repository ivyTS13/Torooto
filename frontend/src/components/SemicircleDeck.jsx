import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import useDrawerStore from "../stores/pileStore";
import CardBackMotif from "./common/CardBackMotif";

const CardBack = React.memo(({ card, style, lift, isSelected, onSelect }) => {
  const { x, y, rotate, width, height, index } = style;

  const handleClick = (e) => {
    onSelect(e, card);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSelected}
      aria-label={`Select Tarot card ${index + 1}`}
      className="absolute bottom-0 left-1/2 appearance-none bg-transparent border-0 p-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059] rounded-[3px]"
      style={{
        width,
        height,
        marginLeft: -width / 2,
        transform: `translate3d(${x}px, ${y + lift}px, 0) rotate(${
          isSelected ? 0 : rotate
        }deg) scale(${isSelected ? 1.12 : 1})`,
        transformOrigin: "bottom center",
        transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: isSelected ? "transform" : "auto",
        zIndex: isSelected ? 999 : index,
      }}
    >
      <span
        className={`block relative w-full h-full rounded-[3px] overflow-hidden border transition-colors duration-300 ${
          isSelected
            ? "border-[#C5A059] shadow-[0_22px_45px_-10px_rgba(11,10,14,0.95),0_0_0_1px_rgba(197,160,89,0.35)]"
            : "border-[#C5A059]/35 shadow-[0_12px_28px_-10px_rgba(11,10,14,0.85)] hover:border-[#C5A059]/65"
        }`}
      >
        <CardBackMotif compact />
      </span>
    </button>
  );
});

export default function SemicircleDeck() {
  const availableCards = useDrawerStore((state) => state.availableCards);
  const pickManualCard = useDrawerStore((state) => state.pickManualCard);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const selectedCardIdRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const containerRef = useRef(null);

  useEffect(() => {
    selectedCardIdRef.current = selectedCardId;
  }, [selectedCardId]);

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

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        selectedCardIdRef.current = null;
        setSelectedCardId(null);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleCardSelect = useCallback(
    (e, card) => {
      e.stopPropagation();
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(10);
      }
      if (selectedCardIdRef.current === card.card_id) {
        pickManualCard(card);
        selectedCardIdRef.current = null;
        setSelectedCardId(null);
      } else {
        selectedCardIdRef.current = card.card_id;
        setSelectedCardId(card.card_id);
      }
    },
    [pickManualCard],
  );

  const cardStyles = useMemo(() => {
    if (!availableCards?.length) return [];

    const totalCards = availableCards.length;
    const isMobile = windowWidth < 768;
    const CARD_WIDTH = isMobile ? 56 : 92;
    const CARD_HEIGHT = isMobile ? 96 : 154;
    const MAX_SPAN = Math.max(0, Math.min(windowWidth - CARD_WIDTH - 24, 900 - CARD_WIDTH));
    const MAX_SPACING = isMobile ? 10 : 14;
    const FAN_ANGLE = isMobile ? 56 : 58;
    const ARCH_HEIGHT = isMobile ? 12 : 24;
    const spacing =
      totalCards > 1 ? Math.min(MAX_SPACING, MAX_SPAN / (totalCards - 1)) : 0;

    return availableCards.map((_, index) => {
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

  if (!availableCards?.length) return null;

  const isMobile = windowWidth < 768;
  const DECK_CONTAINER_HEIGHT = isMobile ? 188 : 270;
  const MAX_WIDTH = Math.min(windowWidth - 16, 900);
  const HOVER_LIFT = isMobile ? 30 : 52;

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center pointer-events-none select-none overflow-x-clip"
    >
      <div
        aria-hidden="true"
        className="absolute bottom-[-110px] w-[140vw] md:w-[880px] h-[190px] md:h-[240px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center bottom, rgba(197, 160, 89, 0.08), transparent 68%)",
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-32 md:h-44 bg-gradient-to-t from-[#0B0A0E] via-[#0B0A0E]/85 to-transparent pointer-events-none"
      />

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
              onSelect={handleCardSelect}
            />
          );
        })}
      </div>
    </div>
  );
}
