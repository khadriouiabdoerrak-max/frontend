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
        /* Crown Jade system — prestige botanical, not cream-gold beauty default */
        background: "#F2F0EC",
        ivory: "#FAF9F7",
        champagne: "#B8C5BE",
        gold: "#1A6B58",
        cocoa: "#14241F",
        espresso: "#0C1612",
        "muted-brown": "#5A6B63",
        success: "#1F7A4D",
        error: "#B42318",
        surface: "#FAF9F7",
        primary: "#0C1612",
        secondary: "#5A6B63",
        accent: "#1A6B58",
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
        card: "0 2px 14px 0 rgba(20,36,31,0.07)",
        modal: "0 8px 40px 0 rgba(20,36,31,0.16)",
      },
    },
  },
  plugins: [],
};
export default config;
