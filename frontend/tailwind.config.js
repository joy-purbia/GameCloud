/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        tech: ['Rajdhani', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        dark: {
          900: '#07090e',
          800: '#0c1017',
          700: '#111520'
        }
      }
    },
  },
  plugins: [],
}
