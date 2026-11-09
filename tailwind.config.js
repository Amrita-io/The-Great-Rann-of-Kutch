/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      colors: {
        rann: {
          gold: '#dfa85f',
          amber: '#f59e0b',
          sand: '#d4af37',
          sky: '#38bdf8',
          twilight: '#1a1829',
          salt: '#f8fafc',
          dark: '#08080c'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 40s linear infinite',
      }
    },
  },
  plugins: [],
}

