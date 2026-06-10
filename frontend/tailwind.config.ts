import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper:     "var(--paper)",
        "paper-2": "var(--paper-2)",
        ink:       "var(--ink)",
        "ink-soft":"var(--ink-soft)",
        muted:     "var(--muted)",
        line:      "var(--line)",
        "line-soft":"var(--line-soft)",
        paddy:     "var(--paddy)",
        "paddy-2": "var(--paddy-2)",
        "paddy-soft":"var(--paddy-soft)",
        terra:     "var(--terra)",
        "terra-2": "var(--terra-2)",
        gold:      "var(--gold)",
        cream:     "var(--cream)",
      },
      fontFamily: {
        // `serif` is a legacy alias — actual font is the display face
        // (Bricolage Grotesque, a grotesque sans).
        serif: ["var(--font-display)", "Bricolage Grotesque", "system-ui", "sans-serif"],
        sans:  ["var(--font-geist-sans)", "Geist", "system-ui", "sans-serif"],
        mono:  ["var(--font-geist-mono)", "Geist Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 0 rgba(29,26,20,.06), 0 12px 40px -20px rgba(29,26,20,.25)",
      },
      borderRadius: {
        "card": "6px",
        "card-lg": "8px",
      },
      maxWidth: {
        "app": "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
