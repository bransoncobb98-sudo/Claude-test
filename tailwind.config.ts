import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // TX Arts Pathway brand system — a Texas-inspired but understated
        // navy/terracotta/gold palette meant to read as "credible academic",
        // not "western" or "childish". See docs/architecture.md §8 branding.
        brand: {
          navy: {
            50: '#eef2f7',
            100: '#d6e0ec',
            200: '#adc1d9',
            300: '#7f9fc0',
            400: '#4f76a0',
            500: '#345880',
            600: '#26436a',
            700: '#1c3355',
            800: '#142643',
            900: '#0d1a2e',
          },
          terracotta: {
            50: '#fdf3ee',
            100: '#fbe1d3',
            200: '#f4bda0',
            300: '#ec9670',
            400: '#e0713f',
            500: '#c6572a',
            600: '#a2431f',
            700: '#7d341a',
            800: '#5c2716',
            900: '#3d1a10',
          },
          gold: {
            50: '#fdf8ec',
            100: '#f9edc7',
            200: '#f2d98a',
            300: '#e9c04f',
            400: '#dba82c',
            500: '#b98a1f',
            600: '#916c19',
            700: '#6c5013',
            800: '#48360d',
            900: '#241b07',
          },
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f7f8fa',
          muted: '#eef0f3',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-source-serif)', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
