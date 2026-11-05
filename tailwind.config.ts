import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        anime: {
          bg: "#0e1119",
          surface: "#121620",
          card: "#171c29",
          cardHover: "#242a3b",
          sidebar: "#11151e",
          border: "rgba(168, 85, 247, 0.22)",
          borderGlow: "rgba(192, 38, 211, 0.45)",
          purple: "#7c3aed",
          fuchsia: "#c026d3",
          pink: "#ec4899",
          textMuted: "#a1a8bc",
          textSecondary: "#c5c9d6",
        },
        cinema: {
          bg: "#0e1119",
          surface: "#121620",
          card: "#171c29",
          elevated: "#222939",
          border: "rgba(168, 85, 247, 0.22)",
          hover: "#2b3245",
          accent: "#7c3aed",
          accentLight: "#a855f7",
          accentGlow: "rgba(124, 58, 237, 0.35)",
          blue: "#3b82f6",
          amber: "#f59e0b",
          textMuted: "#a1a8bc",
          textSecondary: "#c5c9d6",
        },
      },
      fontFamily: {
        arabic: [
          "Cairo",
          "IBM Plex Sans Arabic",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        anime: "0 10px 30px -10px rgba(0, 0, 0, 0.8)",
        glow: "0 0 25px -3px rgba(168, 85, 247, 0.45)",
        glowPink: "0 0 25px -3px rgba(236, 72, 153, 0.5)",
        card: "0 4px 20px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;

