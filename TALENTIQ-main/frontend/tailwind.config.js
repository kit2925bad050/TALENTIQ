/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#070a13',
          card: '#0d1322',
          surface: '#121a2f',
          glass: 'rgba(15, 23, 42, 0.65)',
        },
        primary: {
          DEFAULT: '#00f2fe',
          glow: '#4facfe',
          dark: '#0284c7',
        },
        accent: {
          purple: '#8a2be2',
          neon: '#00f5a0',
          amber: '#fbbf24',
          rose: '#f43f5e',
        },
        border: {
          glass: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(0, 242, 254, 0.25)',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 242, 254, 0.3)',
        'glow-purple': '0 0 25px -5px rgba(138, 43, 226, 0.3)',
        'glow-emerald': '0 0 25px -5px rgba(0, 245, 160, 0.3)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
