import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Subtle dark-mode friendly palette for data tools
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c8",
          700: "#0369a1",
          900: "#0c4a6e",
          950: "#082f49",
        },
        accent: "#22c55e", // green for "live" states
      },
    },
  },
  plugins: [],
  darkMode: "media", // respects prefers-color-scheme automatically
};

export default config;
