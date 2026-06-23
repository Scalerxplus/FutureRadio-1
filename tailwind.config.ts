import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "brand-yellow": "#F3F574", // Neo-Brutalist High-Vis Yellow
        "brand-red": "#FF2E2E",    // Neo-Brutalist Red
        "brand-dark": "#0A0D14",   // Deep Navy / Dark Charcoal
        "brand-surface": "#111118",
        "brand-border": "#000000", 
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(0,0,0,1)',
        'brutal-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'brutal-hover': '6px 6px 0px 0px rgba(0,0,0,1)',
      },
      borderWidth: {
        'brutal': '4px',
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "sans-serif"],
        display: ["var(--font-baloo)", "sans-serif"],
        digital: ["var(--font-digital)", "monospace"],
        khand: ["var(--font-khand)", "sans-serif"],
        rozha: ["var(--font-rozha)", "serif"],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
      animation: {
        marquee: 'marquee 15s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
