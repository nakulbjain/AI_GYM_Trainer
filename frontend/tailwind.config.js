/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch Design System Core Tokens
        stitch: {
          bg: '#050505',
          'bg-subtle': '#0A0A0A',
          card: '#101012',
          hover: '#151517',
          border: 'rgba(255, 255, 255, 0.10)',
          'border-light': 'rgba(255, 255, 255, 0.18)',
          primary: '#B7F52A', // Tactical Electric Lime
          'primary-dim': '#9ED900',
          'primary-glow': 'rgba(183, 245, 42, 0.15)',
          warning: '#FFB020', // Biomechanical amber caution
          danger: '#FF4D4F',  // Critical fault alert red
          muted: '#6F7075',
          text: '#F7F7F5',
        },
        // Mapped for backwards-compatibility with existing component class references
        dark: {
          DEFAULT: '#050505',
          card: '#101012',
          border: 'rgba(255, 255, 255, 0.10)',
          muted: '#6F7075',
        },
        gold: {
          DEFAULT: '#B7F52A',
          light: '#CEFF4F',
          dark: '#9ED900',
          glow: 'rgba(183, 245, 42, 0.20)',
        },
        magenta: {
          DEFAULT: '#FFB020',
          light: '#FFC857',
          dark: '#D99100',
          glow: 'rgba(255, 176, 32, 0.25)',
        },
        brand: {
          primary: '#B7F52A',
          secondary: '#FF4D4F',
          accent: '#B7F52A',
          gold: '#B7F52A',
          red: '#FF4D4F',
          magenta: '#FFB020',
          mint: '#B7F52A',
          coral: '#FF4D4F',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Chivo', 'sans-serif'],
        heading: ['Chivo', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'stitch-sm': '4px',
        'stitch-md': '6px',
        'stitch-lg': '8px',
        'stitch-xl': '12px',
      },
      boxShadow: {
        'stitch-glow': '0 0 20px rgba(183, 245, 42, 0.35)',
        'stitch-glow-sm': '0 0 10px rgba(183, 245, 42, 0.25)',
        'stitch-card': '0 10px 30px -10px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
}
