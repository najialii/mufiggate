/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'sudan-green': '#007A3D',
        'sudan-red': '#D21034',
      }
    }
  },
  plugins: []
};
