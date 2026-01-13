/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moss: {
          50: '#f2f7f2',
          100: '#dbede3',
          200: '#b8dbc8',
          300: '#8ac1a5',
          400: '#5da182',
          500: '#3e8466',
          600: '#2d6851',
          700: '#265442',
          800: '#224436',
          900: '#1d382d',
        },
        sage: {
          50: '#f4f7f5',
          100: '#e3ebe6',
          200: '#c5d9ce',
          300: '#9dbba8',
          400: '#759b83',
          500: '#557f65',
          600: '#40654e',
          700: '#355140',
        },
        terra: {
          300: '#e0bfae',
          400: '#d1a088',
          500: '#bd7e60',
        },
        fog: {
          300: '#b8c5d1',
          400: '#94a8b9',
          500: '#728ca1',
        },
        gold: {
          300: '#f0d98f',
          400: '#e6c760',
          500: '#d4af37', // Bioluminescent highlight
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'], // We will assume Inter or system sans for now
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}