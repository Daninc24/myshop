/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff6600', // vibrant orange
          light: '#ff944d',
          dark: '#cc5200',
        },
        secondary: {
          DEFAULT: '#1e293b', // dark blue-gray
          light: '#334155',
          dark: '#0f172a',
        },
        accent: {
          DEFAULT: '#6366f1', // indigo
          light: '#a5b4fc',
          dark: '#4338ca',
        },
        success: '#22c55e',
        warning: '#facc15',
        error: '#ef4444',
        info: '#0ea5e9',
        background: '#f8fafc',
        surface: '#ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0,0,0,0.06)',
        'strong': '0 4px 24px 0 rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}

