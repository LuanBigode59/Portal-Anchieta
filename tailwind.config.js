/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mil': {
          'black': '#0a0a0a',
          'dark': '#111111',
          'panel': '#141414',
          'card': '#1a1a1a',
          'hover': '#1e1e1e',
          'input': '#0d0d0d',
          'border': '#2a2a2e',
          'border-light': '#333333',
        },
        'army': {
          'green': '#2d5a1e',
          'green-light': '#4a8c34',
          'green-dark': '#1e3d14',
          'green-glow': '#3a7a28',
        },
        'gold': {
          DEFAULT: '#c9a84c',
          'light': '#e0c068',
          'dark': '#a08530',
          'muted': '#8b7530',
        },
        'steel': {
          DEFAULT: '#2a2a2e',
          'light': '#3a3a40',
          'dark': '#1a1a1e',
        },
        'choque': {
          'yellow': '#FFD700',
          'yellow-dark': '#DAA520',
          'blue': '#1a2332',
          'blue-dark': '#0f1923',
        },
        'danger': {
          DEFAULT: '#8b1a1a',
          'light': '#c62828',
        },
        'success': {
          DEFAULT: '#1a6b2a',
          'light': '#2e7d32',
        },
        'warn': {
          DEFAULT: '#8b6914',
          'light': '#f9a825',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'display': ['Oswald', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0,0,0,0.6)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.7), 0 0 15px rgba(45,90,30,0.15)',
        'gold': '0 0 20px rgba(201,168,76,0.2)',
        'gold-lg': '0 0 40px rgba(201,168,76,0.3)',
        'green': '0 0 15px rgba(45,90,30,0.3)',
        'green-lg': '0 0 40px rgba(45,90,30,0.4)',
        'panel': '0 1px 3px rgba(0,0,0,0.5)',
        'glow-choque': '0 0 30px rgba(255,215,0,0.15)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-out',
        'fadeInUp': 'fadeInUp 0.6s ease-out',
        'fadeInDown': 'fadeInDown 0.5s ease-out',
        'slideUp': 'slideUp 0.4s ease-out',
        'slideLeft': 'slideInLeft 0.3s ease-out',
        'slideRight': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'scanline': 'scanline 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'borderGlow': 'borderGlow 3s ease-in-out infinite alternate',
        'scaleIn': 'scaleIn 0.3s ease-out',
        'typewriter': 'typewriter 3s steps(40) 1s forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(45,90,30,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(45,90,30,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        borderGlow: {
          '0%': { borderColor: 'rgba(201,168,76,0.3)' },
          '100%': { borderColor: 'rgba(201,168,76,0.8)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'military-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
