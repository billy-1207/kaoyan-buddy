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
        primary: "#2E5A88",
        "primary-light": "#3A6FA6",
        accent: "#D4A843",
        "accent-light": "#E0C06A",
        light: "#F0F4F8",
        mid: "#D5E3F0",
        success: "#2E7D32",
        warn: "#E65100",
        text: "#333333",
        muted: "#666666",
      },
      animation: {
        "bounce-slow": "bounce-slow 3s ease-in-out infinite",
      },
      keyframes: {
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
