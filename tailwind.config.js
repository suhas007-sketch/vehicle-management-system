/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#18181b',
        primary: '#3b82f6', // Electric blue
        primaryDark: '#2563eb',
        accent: '#8b5cf6', // Purple
        amberLight: '#fbbf24',
        textMain: '#f8fafc',
        textMuted: '#94a3b8',
        border: '#27272a'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 15px -3px rgba(59, 130, 246, 0.5)',
        'glowAccent': '0 0 15px -3px rgba(139, 92, 246, 0.5)'
      }
    },
  },
  plugins: [],
}
