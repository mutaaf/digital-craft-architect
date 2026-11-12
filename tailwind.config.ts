
import type { Config } from "tailwindcss";

// v3 (the beta overhaul, after mutaafaziz.com's Mission Control): every gray on the site is the
// polar night's, cool and faintly teal, so the pages' own dark: variants land on the instrument deck.
const night = {
  50: "#F2F5F6", 100: "#E4E9EB", 200: "#CBD3D7", 300: "#A9B4BA", 400: "#8C979E",
  500: "#68747C", 600: "#4A555D", 700: "#2E373D", 800: "#1A2126", 900: "#12181C", 950: "#0B0F12",
};
// ...and the old purple/indigo/violet "AI" gradients turn to the aurora, so every page's accents agree
const auroraScale = {
  50: "#EAFBF5", 100: "#CFF5E8", 200: "#A8F0D9", 300: "#7BE3C3", 400: "#4FCFA9",
  500: "#2FB28E", 600: "#238F73", 700: "#1D725D", 800: "#19594A", 900: "#14463B", 950: "#0B2A23",
};

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        gray: night,
        purple: auroraScale,
        violet: auroraScale,
        indigo: auroraScale,
        fuchsia: auroraScale,
        slate: night,
        zinc: night,
        neutral: night,
        night: { DEFAULT: "#0B0F12", deck: "#0E1316", panel: "#12181C", raised: "#1A2126", hair: "#252C31" },
        aurora: { DEFAULT: "#7BE3C3", soft: "#A8F0D9", deep: "#3E8F7A" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        skyblue: "#7BE3C3", // the old sky accent now reads as the aurora
        ink: {
          DEFAULT: "#0b0b0d",
          soft: "#17171b",
        },
        bone: {
          DEFAULT: "#f4efe6",
          soft: "#ece6d9",
        },
        copper: {
          DEFAULT: "#c96e2c",
          soft: "#e89862",
        },
        smoke: "#8a847a",
        // Warm-brand accents — used alongside skyblue/primary on the
        // marketing site and as the canonical palette for /classes/*.
        gold: {
          DEFAULT: "#c9913a",
          soft: "#e3b06b",
          light: "#fdf5e8",
          deep: "#8a5d18",
        },
        cream: {
          DEFAULT: "#fdf8f2",
          soft: "#fbf3e8",
        },
        "ink-warm": "#1a1714",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.5s ease-out",
        "slide-up": "slide-up 0.7s ease-out",
      },
      fontFamily: {
        sans: ["'Instrument Sans'", "Avenir Next", "Avenir", "system-ui", "sans-serif"],
        serif: ["'Instrument Serif'", "Georgia", "serif"],
        display: ["Fraunces", "Newsreader", "Georgia", "serif"],
        editorial: ["Newsreader", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
