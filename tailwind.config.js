/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        harbor: '#0f766e',
        coral: '#ef6f61',
        signal: '#f5b841',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(23, 32, 51, 0.12)',
      },
    },
  },
  plugins: [],
}
