/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // AXON Palette
        primary: {
          DEFAULT: '#0052FF', // Base Blue
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        axon: {
          paper: '#FBFBFB', // Paper White: Bersih, elegan
          obsidian: '#050505', // Obsidian Black: Kontras tajam
          neon: '#00F0FF', // Electric Cyan: AI Action / Signal
          ether: '#00D395', // Neural Green: Success State
          steel: '#8E8E93', // Cool Slate: Subtle Elements
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
      },
      borderRadius: {
        'swiss': '12px', // Modern Swiss
      }
    },
  },
  plugins: [],
}