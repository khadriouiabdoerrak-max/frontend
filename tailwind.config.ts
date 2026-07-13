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
        background: "#F8F1E7",
        ivory: "#FFFDF8",
        champagne: "#D8B98C",
        gold: "#C99A4A",
        cocoa: "#3A2418",
        espresso: "#1F1712",
        "muted-brown": "#6D5A4A",
        success: "#2F6B45",
        error: "#B42318",
        surface: "#FFFDF8",
        primary: "#1F1712",
        secondary: "#6D5A4A",
        accent: "#3A2418",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        arabic: [
          "var(--font-ibm-plex-arabic)",
          "var(--font-tajawal)",
          "var(--font-inter)",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "16px",
        badge: "999px",
        btn: "12px",
      },
      boxShadow: {
        card: "0 2px 16px 0 rgba(58,36,24,0.08)",
        modal: "0 8px 48px 0 rgba(58,36,24,0.18)",
      },
    },
  },
  plugins: [],
};
export default config;
