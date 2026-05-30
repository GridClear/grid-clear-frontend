import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "gc-dark": "var(--bg-dark)",
        "gc-light": "var(--bg-light)",
        "gc-muted": "var(--text-muted)",
        "gc-border": "var(--border)",
        "gc-nav-muted": "var(--text-nav-muted)",
        "gc-accent": "var(--accent)",
        "gc-accent-soft": "var(--accent-soft)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      maxWidth: {
        content: "1400px",
      },
      animation: {
        "ken-burns": "kenBurns 20s ease-in-out infinite alternate",
      },
      keyframes: {
        kenBurns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
