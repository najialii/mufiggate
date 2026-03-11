/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'sp-',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'sudan-green': '#007A3D',
        'sudan-red': '#D21034',
        'sudan-black': '#000000',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      }
    }
  },
  plugins: []
};
