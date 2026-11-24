/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#F7FAF7',
          card: '#FFFFFF',
          subcard: '#F0F7F1',
          border: '#D8EAD9',
          darkBorder: '#BFDDBD',
        },
        sage: {
          50: '#F4F9F4',
          100: '#E8F5E9',
          200: '#D2EBD4',
          300: '#ADDAB2',
          400: '#7EC286',
          500: '#4CA869',
          600: '#3D8E56',
          700: '#317345',
          800: '#285C38',
          900: '#1C3E26',
        },
        ink: {
          DEFAULT: '#1C2B21',
          muted: '#526A59',
          faint: '#879E8E',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(45, 95, 55, 0.05)',
        'card': '0 2px 12px -1px rgba(35, 80, 45, 0.06)',
        'lift': '0 8px 24px -4px rgba(35, 80, 45, 0.10)',
      }
    },
  },
  plugins: [],
}
