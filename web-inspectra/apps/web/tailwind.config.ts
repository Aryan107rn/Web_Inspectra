import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#06090c",
          panel: "#0b1116",
          raised: "#111922",
        },
        scan: {
          cyan: "#4cd9e0",
          violet: "#8b7ff0",
          amber: "#f0b84c",
          red: "#f0616b",
          green: "#4ce0a0",
        },
        ink: {
          100: "#f4f6f7",
          300: "#c3cbd1",
          400: "#8a97a0",
          600: "#5b6670",
        },
        line: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "scan-grid":
          "linear-gradient(rgba(76,217,224,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(76,217,224,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        "scan-grid-size": "36px 36px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.45)",
        "glow-cyan": "0 0 24px rgba(76,217,224,0.35)",
        "glow-violet": "0 0 24px rgba(139,127,240,0.35)",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        sweep: "sweep 3.2s linear infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
