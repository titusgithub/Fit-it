/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6366f1',
          DEFAULT: '#4f46e5',
          dark: '#4338ca',
        },
        secondary: {
          light: '#f43f5e',
          DEFAULT: '#e11d48',
          dark: '#be123c',
        },
        accent: '#fbbf24',
        background: '#f8fafc',
        surface: '#ffffff',
        text: {
          primary: '#0f172a',
          secondary: '#64748b',
          muted: '#94a3b8',
        },
      },
    },
  },
  plugins: [],
}
