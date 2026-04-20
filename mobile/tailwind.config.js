/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2a5280',
          DEFAULT: '#1e3a5f',
          dark: '#0f2440',
        },
        accent: {
          light: '#ff8b5e',
          DEFAULT: '#ff6b35',
          dark: '#e05520',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        background: '#0a0f1a',
        surface: '#111827',
        'surface-2': '#1a2332',
        glass: 'rgba(255, 255, 255, 0.05)',
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        border: 'rgba(148, 163, 184, 0.1)',
      },
    },
  },
  plugins: [],
}
