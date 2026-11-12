
import type { Config } from "tailwindcss";

// v3 daylight + keynote (2026-11-12): every gray on the site is Apple's neutral scale, so the older
// pages' gray-* classes land on the same tiles (#f5f5f7), hairlines (#d2d2d7 / #e8e8ed) and text
// (#1d1d1f / #6e6e73) as the new ones. 400 is darkened to #737378 so small gray-400 text passes AA.
const night = {
  50: "#F5F5F7", 100: "#E8E8ED", 200: "#D2D2D7", 300: "#A1A1A6", 400: "#737378",
  500: "#636366", 600: "#515154", 700: "#424245", 800: "#2C2C2E", 900: "#1D1D1F", 950: "#0B0B0D",
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
        // ...and so do the older tools' leftover blues (icons, links, info chips)
        blue: auroraScale,
        sky: auroraScale,
        slate: night,
        zinc: night,
        neutral: night,
        night: { DEFAULT: "var(--v3-night)", deck: "var(--v3-deck)", panel: "var(--v3-panel)", raised: "var(--v3-raised)", hair: "var(--v3-hair)" },
        aurora: { DEFAULT: "rgb(var(--v3-aurora-rgb) / <alpha-value>)", soft: "#7BE3C3", deep: "#08624A" },
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
        skyblue: "#0B7D5E", // the old sky accent now reads as the deep aurora
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
