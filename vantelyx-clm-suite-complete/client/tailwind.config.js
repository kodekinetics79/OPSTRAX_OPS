/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#b8ddff',
          300: '#85c7ff',
          400: '#4aadff',
          500: '#1f91f2',
          600: '#0d72cf',
          700: '#0b5ba7',
          800: '#0e4d88',
          900: '#123f70'
        },
        ink: '#0b1220'
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.10)',
        glow: '0 18px 50px rgba(31, 145, 242, 0.32)'
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: []
};
