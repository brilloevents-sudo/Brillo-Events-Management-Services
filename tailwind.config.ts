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
        // Luxury Brillo Christmas Brand Palette
        velvet: {
          deep: "#780D22",
          crimson: "#A61932",
          ruby: "#B82038",
          dark: "#4F0816",
        },
        champagne: {
          DEFAULT: "#D6B36A",
          light: "#EAD39C",
          dark: "#B58E43",
        },
        ivory: {
          DEFAULT: "#FFF8F0",
          soft: "#F9EFE4",
          border: "#E6D7C3",
        },
        midnight: {
          DEFAULT: "#211619",
          soft: "#36252A",
        },
        // Existing Operational & Funnel Tokens
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
          DEFAULT: "#A61932",
          950: "#36060F",
          900: "#4C0519",
          800: "#780D22",
          700: "#A61932",
          600: "#B82038",
          500: "#E11D48",
          400: "#FB7185",
        },
        gold: {
          DEFAULT: "#D6B36A",
          900: "#451A03",
          800: "#78350F",
          700: "#8C6207",
          600: "#9F8349",
          500: "#B99A5B",
          400: "#D6B36A",
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
          100: "#FFF8F0",
          200: "#F6F3EC",
          300: "#EFEAE0",
          400: "#E2DED4",
          500: "#C5C0B4",
        },
      },
      fontFamily: {
        sans: ["'Montserrat'", "var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        body: ["'Montserrat'", "system-ui", "sans-serif"],
        headline: ["'Montserrat'", "'Space Grotesk'", "sans-serif"],
        display: ["'Cormorant Garamond'", "Playfair Display", "Georgia", "serif"],
        serif: ["'Cormorant Garamond'", "var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        brand: ["'Cinzel'", "'Cormorant Garamond'", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "electric-glow": "0 0 25px -5px rgba(34, 197, 94, 0.4)",
        "crimson-glow": "0 10px 30px -5px rgba(166, 25, 50, 0.45)",
        "gold-glow": "0 8px 30px -5px rgba(214, 179, 106, 0.35)",
        "luxury-card": "0 16px 40px -10px rgba(33, 22, 25, 0.12)",
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
