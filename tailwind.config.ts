import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#070A0F",
          900: "#0B0F17",
          850: "#0F1622",
          800: "#151E2E",
          700: "#1E2B42",
          600: "#2C3E5E",
        },
        crimson: {
          900: "#4C0519",
          800: "#881337",
          700: "#9F1239",
          600: "#BE123C",
          500: "#E11D48",
          400: "#FB7185",
        },
        gold: {
          900: "#451A03",
          800: "#78350F",
          700: "#92400E",
          600: "#B45309",
          500: "#D97706",
          400: "#F59E0B",
          300: "#FCD34D",
          200: "#FDE68A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
