/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Paleta do app: tinta (ink), branco (ink-50) e um destaque lime
      colors: {
        ink: {
          950: "#0A0A0B",
          900: "#111113",
          850: "#16161A",
          800: "#1C1C21",
          700: "#26262D",
          600: "#34343C",
          500: "#4A4A54",
          400: "#6E6E7A",
          300: "#9A9AA6",
          200: "#C4C4CC",
          100: "#E6E6EA",
          50: "#F5F5F7",
        },
        lime: {
          DEFAULT: "#C6F432",
          soft: "#C6F43226",
          dim: "#9BC21F",
        },
      },
      fontFamily: {
        sans: ["Geist Variable", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono Variable", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
