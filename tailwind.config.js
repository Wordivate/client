/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        wordivate: {
          primary: "#7c3aed",
          "primary-content": "#ffffff",
          secondary: "#f59e0b",
          "secondary-content": "#1a1a1a",
          accent: "#06b6d4",
          "accent-content": "#ffffff",
          neutral: "#1e1b4b",
          "neutral-content": "#e0e7ff",
          "base-100": "#0f0b2e",
          "base-200": "#1a1550",
          "base-300": "#261e70",
          "base-content": "#e0e7ff",
          info: "#38bdf8",
          success: "#34d399",
          warning: "#fbbf24",
          error: "#f87171",
        },
      },
    ],
    darkTheme: "wordivate",
  },
};

