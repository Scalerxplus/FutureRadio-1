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
        "brand-purple": "#E50914", // Vibrant GenZ Red
        "brand-teal": "#FFFFFF",   // Pure White
        "brand-dark": "#000000",   // Deep Black
        "brand-surface": "#111111",// Charcoal Black
        "brand-border": "#222222", // Dark Gray Border
      },
    },
  },
  plugins: [],
};
export default config;
