import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF9',
          100: '#FAF6F1',
          200: '#F5EDE4',
          300: '#EDD9C8',
        },
        blush: {
          50: '#FDF5F6',
          100: '#F9E8EB',
          200: '#F2D0D6',
          300: '#E8B4BC',
          400: '#D990A0',
          500: '#C4788A',
          600: '#A85C70',
          700: '#8B4059',
        },
        rose: {
          brand: '#B76E79',
          dark: '#8B4A55',
          light: '#F2D0D6',
          pale: '#FDF0F2',
        },
        burgundy: {
          DEFAULT: '#6B2737',
          light: '#8B3A4D',
          dark: '#4A1B27',
        },
        charcoal: {
          DEFAULT: '#2C2C2C',
          light: '#4A4A4A',
          muted: '#6B6B6B',
        },
        gold: {
          DEFAULT: '#C9A96E',
          light: '#E8D5A3',
          dark: '#A07840',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.65rem',
      },
      letterSpacing: {
        widest: '0.25em',
        'ultra-wide': '0.35em',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-luxury': 'linear-gradient(135deg, #FAF6F1 0%, #F2D0D6 50%, #FAF6F1 100%)',
        'hero-overlay': 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
      },
      boxShadow: {
        luxury: '0 4px 40px rgba(183, 110, 121, 0.12)',
        'luxury-lg': '0 8px 60px rgba(183, 110, 121, 0.18)',
        card: '0 2px 20px rgba(44, 44, 44, 0.08)',
        'card-hover': '0 8px 40px rgba(44, 44, 44, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
