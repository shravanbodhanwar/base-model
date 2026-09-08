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
        enterprise: {
          bg: "#0A0F1E",
          surface: "#0D1B2A",
          surface2: "#1A2744",
        },
        accent: {
          blue: "#3B82F6",
          cyan: "#06B6D4",
        },
        status: {
          active: "#4ade80",
          revoked: "#f87171",
          pending: "#fbbf24",
          inactive: "#9ca3af",
        }
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px #3B82F6" },
          "100%": { boxShadow: "0 0 20px #06B6D4" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
