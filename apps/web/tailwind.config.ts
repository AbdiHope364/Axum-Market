import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '475px',
      },
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#faf7f2',
          100: '#f4ede1',
          200: '#e8dac2',
          300: '#d8c09d',
          400: '#c5a377',
          500: '#b38a59',
          600: '#9b7147',
          700: '#7d593a',
          800: '#674a33',
          900: '#553e2d',
        },
      },
    },
  },
  plugins: [],
};

export default config;

