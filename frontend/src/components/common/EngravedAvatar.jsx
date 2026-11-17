import React from "react";

const getMonogram = (name, email) => {
  const source = (name || email || "T").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};

/**
 * Displays the user's uploaded avatar or falls back to an engraved brass monogram seal.
 */
export default function EngravedAvatar({
  user,
  size = 32,
  className = "",
  textClassName = "text-xs",
}) {
  const monogram = getMonogram(user?.name, user?.email);

  if (user?.image_url) {
    return (
      <img
        src={user.image_url}
        alt={user.name || "User avatar"}
        width={size}
        height={size}
        decoding="async"
        className={`object-cover border border-[#C5A059]/35 bg-[#1C1917] ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center bg-[#1C1917] border border-[#C5A059]/45 text-[#E8E2D5] font-display tracking-widest select-none shadow-[inset_0_0_0_2px_rgba(197,160,89,0.14)] ${textClassName} ${className}`}
      style={{ width: size, height: size }}
    >
      {monogram}
    </span>
  );
}
