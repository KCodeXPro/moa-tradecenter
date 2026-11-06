/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moa: {
          primary: "#1A1F36",
          secondary: "#E87323",
          background: "#F5F5F0",
          card: "#FFFFFF",
          text: "#1A1F36",
          muted: "#6B7280",
        },
      },
    },
  },
  plugins: [],
}