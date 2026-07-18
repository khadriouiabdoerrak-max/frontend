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
        /* Salon Warmth — matches OXIPRIME cream + gold packaging; calm trust */
        background: "#F6F1E8",
        ivory: "#FFFBF5",
        champagne: "#D4C4A8",
        gold: "#9A7B4F",
        cocoa: "#2C241C",
        espresso: "#1A1510",
        "muted-brown": "#6E6256",
        success: "#3D6B4F",
        error: "#B42318",
        surface: "#FFFBF5",
        primary: "#1A1510",
        secondary: "#6E6256",
        accent: "#9A7B4F",
      },
      fontFamily: {
        sans: ["var(--font-ibm-plex-arabic)", "sans-serif"],
        arabic: ["var(--font-ibm-plex-arabic)", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        badge: "999px",
        btn: "12px",
      },
      boxShadow: {
        card: "0 2px 14px 0 rgba(44,36,28,0.07)",
        modal: "0 8px 40px 0 rgba(44,36,28,0.16)",
      },
    },
  },
  plugins: [],
};
export default config;
