/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // 🔴 THIS WAS MISSING - THIS IS THE FIX!
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#030712',
        },
      },
    },
  },
  plugins: [],
};