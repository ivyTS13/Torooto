import React from "react";

/**
 * Hairline brass L-brackets framing Tarot cards, dials, and reading folios.
 */
export default function RegistrationMarks({
  size = "sm",
  tone = "gold",
  className = "",
}) {
  const sizeClass = size === "md" ? "h-3 w-3" : "h-2 w-2";
  const borderClass =
    tone === "oxblood"
      ? "border-[#8B3A32]/75 group-hover:border-[#C5A059]/75 transition-colors duration-500"
      : "border-[#C5A059]/45 group-hover:border-[#C5A059]/85 transition-colors duration-500";

  return (
    <span aria-hidden="true" className={`pointer-events-none ${className}`}>
      <span
        className={`absolute top-1 left-1 ${sizeClass} border-t border-l ${borderClass}`}
      />
      <span
        className={`absolute top-1 right-1 ${sizeClass} border-t border-r ${borderClass}`}
      />
      <span
        className={`absolute bottom-1 left-1 ${sizeClass} border-b border-l ${borderClass}`}
      />
      <span
        className={`absolute bottom-1 right-1 ${sizeClass} border-b border-r ${borderClass}`}
      />
    </span>
  );
}
