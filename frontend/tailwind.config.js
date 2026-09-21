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
          50: '#f0f4f9',
          100: '#dce5f2',
          200: '#bfd1e7',
          300: '#94b5d7',
          400: '#6493c4',
          500: '#4375b0',
          600: '#325d94',
          700: '#284b79',
          800: '#162744',
          900: '#0e1a2d',
          950: '#08101d',
        },
        construction: {
          DEFAULT: '#D97706',
          light: '#F59E0B',
          dark: '#B45309',
          hover: '#C26905',
          bg: '#FEF3C7'
        },
        solar: {
          DEFAULT: '#059669',
          light: '#10B981',
          dark: '#047857',
          hover: '#047857',
          bg: '#D1FAE5'
        },
        suppliers: {
          DEFAULT: '#4B5563',
          light: '#6B7280',
          dark: '#374151',
          hover: '#374151',
          bg: '#F3F4F6'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Mukta', 'sans-serif'],
        display: ['Outfit', 'Inter', 'Segoe UI', 'sans-serif']
      }
    },
  },
  plugins: [],
}
