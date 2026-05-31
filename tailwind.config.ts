import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#FAF8F5",
          soft: "#FDFBF7",
          warm: "#F4F0E8",
        },
        porcelain: "#fdfbf7",
        ink: {
          DEFAULT: "#1A1814",
          soft: "#2A2620",
        },
        stone: {
          DEFAULT: "#8c8579",
          soft: "#a8a195",
        },
        gold: {
          DEFAULT: "#C9A96E",
          soft: "#D9BE89",
          deep: "#A88955",
          pale: "#E8D8B7",
        },
        sage: {
          DEFAULT: "#E8EDE8",
          deep: "#C5D0C5",
        },
        hairline: "#E8E2D5",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "var(--font-frank)", "Georgia", "serif"],
        hebrew: ["var(--font-frank)", "Georgia", "serif"],
        sans: ["var(--font-heebo)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widish: "0.18em",
        wider2: "0.25em",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26,24,20,0.04), 0 8px 24px -12px rgba(26,24,20,0.10)",
        lift: "0 2px 4px rgba(26,24,20,0.04), 0 12px 32px -10px rgba(26,24,20,0.12)",
      },
      animation: {
        shimmer: "shimmer 2.8s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
        "progress-bar": "progressBar 1.2s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "0.4", transform: "translateX(-100%)" },
          "50%": { opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(201, 169, 110, 0.35)",
            transform: "scale(1)",
          },
          "50%": {
            boxShadow: "0 0 0 6px rgba(201, 169, 110, 0)",
            transform: "scale(1.08)",
          },
        },
        progressBar: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
