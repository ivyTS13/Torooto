const ROMAN_PAIRS = [
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

/**
 * Formats non-negative integers as classical Roman numerals (`0` stays `"0"` for The Fool).
 */
export function toRomanNumeral(value) {
  if (!Number.isFinite(value) || value < 0) return "";
  if (value === 0) return "0";

  let remainder = Math.floor(value);
  let result = "";

  for (const [arabic, roman] of ROMAN_PAIRS) {
    while (remainder >= arabic) {
      result += roman;
      remainder -= arabic;
    }
  }

  return result;
}
