/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0B0A0E",
        velvet: "#141218",
        umber: "#1C1917",
        gold: "#C5A059",
        bronze: "#8A6D3B",
        oxblood: "#5E1914",
        parchment: "#E8E2D5",
        ash: "#9E9689",
        "rose-parchment": "#C9A49A",
      },
      fontFamily: {
        display: ['"Cinzel"', "Georgia", "serif"],
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      transitionTimingFunction: {
        ritual: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      boxShadow: {
        cast: "0 18px 40px -12px rgba(11, 10, 14, 0.85)",
        plate: "0 24px 56px -16px rgba(11, 10, 14, 0.92)",
      },
    },
  },
  plugins: [],
};
