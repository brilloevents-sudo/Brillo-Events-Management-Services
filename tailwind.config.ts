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
        // Ultra-Premium Direct-Response Funnel Tokens
        obsidian: {
          DEFAULT: "#09090B",
          950: "#09090B",
          900: "#121215",
          850: "#18181B",
          800: "#27272A",
        },
        charcoal: {
          DEFAULT: "#18181B",
          card: "#18181B",
          border: "#27272A",
          950: "#101211",
          900: "#171A18",
          850: "#18181B",
          800: "#202421",
          700: "#2C312D",
          600: "#3E443F",
        },
        crimson: {
          DEFAULT: "#E11D48",
          950: "#36060F",
          900: "#4C0519",
          800: "#881337",
          700: "#9F1239",
          600: "#BE123C",
          500: "#E11D48",
          400: "#FB7185",
        },
        gold: {
          DEFAULT: "#D4AF37",
          900: "#451A03",
          800: "#78350F",
          700: "#8C6207",
          600: "#9F8349",
          500: "#B99A5B",
          400: "#D4AF37",
          300: "#E7CE97",
          200: "#F3E3BC",
        },
        electric: {
          DEFAULT: "#22C55E",
          50: "#F0FDF4",
          100: "#DCFCE7",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
        },
        warm: {
          50: "#FFFEFB",
          100: "#FBF9F4",
          200: "#F6F3EC",
          300: "#EFEAE0",
          400: "#E2DED4",
          500: "#C5C0B4",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        headline: ["'Space Grotesk'", "Montserrat", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "electric-glow": "0 0 25px -5px rgba(34, 197, 94, 0.4)",
        "crimson-glow": "0 0 25px -5px rgba(225, 29, 72, 0.4)",
        "gold-glow": "0 0 25px -5px rgba(212, 175, 55, 0.3)",
      },
      animation: {
        marquee: "marquee 35s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
