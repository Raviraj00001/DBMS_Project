/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFBF7',
          100: '#FAF6EE',
          200: '#F5ECE0',
          300: '#EFE2CE',
          400: '#E4CFB2',
        },
        champagne: {
          50: '#FAF7F2',
          100: '#F4ECE0',
          200: '#E9DBC5',
          300: '#DCC7A5',
          400: '#CDB284',
          500: '#BFA068',
        },
        gold: {
          100: '#FBF3D5',
          200: '#F6E5A6',
          300: '#EED372',
          400: '#E5C045',
          500: '#D4AF37', // Classic metallic gold
          600: '#B89225',
          700: '#947217',
          800: '#755811',
          900: '#5A420B',
        },
        charcoal: {
          800: '#262C36',
          900: '#1A1E24',
          950: '#111418',
        },
        blush: {
          50: '#FDF8F7',
          100: '#FAEEEE',
          200: '#F4D8D7',
          300: '#EBBCBA',
          400: '#DF9B98',
          500: '#CE7875',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-soft': '0 4px 20px -2px rgba(212, 175, 55, 0.15)',
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}

