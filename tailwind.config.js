/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#241f21',
        blush: '#cf9187',
        blushDark: '#b9786f',
        blushSoft: '#f2d2cc',
        cream: '#fffaf7',
        warm: '#f8ebe5',
        taupe: '#805d53',
        sage: '#809579',
        sageDark: '#6d8467',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Montserrat', 'Arial', 'sans-serif'],
        script: ['Allura', 'cursive'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(102, 59, 49, .13)',
      },
    },
  },
  plugins: [],
}
