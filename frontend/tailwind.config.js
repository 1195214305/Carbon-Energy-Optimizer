/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2dd4bf',
        secondary: '#f59e0b',
        accent: '#8b5cf6',
        dark: '#0f172a',
        'dark-light': '#1e293b'
      }
    },
  },
  plugins: [],
}
