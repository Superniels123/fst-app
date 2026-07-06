/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fst: {
          green: '#008C3C',
          greenDark: '#00662B',
          greenTint: '#E6F0E6',
          blue: '#0082C8',
          red: '#E40808',
          navy: '#253464',
        },
      },
      fontFamily: {
        heading: ['Barlow Condensed', 'sans-serif'],
        body: ['Mulish', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
