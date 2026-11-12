/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070C1E',
          900: '#0B132B',
          850: '#111C3A',
          800: '#1C2541',
          700: '#27355B',
          600: '#3A4A74',
        },
        gold: {
          50: '#FDFBF7',
          100: '#F9F4E8',
          200: '#F2E4C2',
          300: '#EBD49B',
          400: '#DFBE67',
          500: '#D4AF37', // signature dazzle gold
          600: '#B89225',
          700: '#8C6E19',
          800: '#604A10',
          900: '#362908',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 15px -3px rgba(212, 175, 55, 0.25)',
        'card-elevated': '0 4px 20px -2px rgba(11, 19, 43, 0.08)',
      }
    },
  },
  plugins: [],
}
