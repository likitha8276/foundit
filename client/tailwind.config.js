/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F4EFE6',
          card: '#FAF7F0',
          border: '#DDD5C7',
          darkBorder: '#C8BEAD',
        },
        ink: {
          DEFAULT: '#1C1B19',
          muted: '#68645E',
          faint: '#9E9990',
        },
        rust: {
          DEFAULT: '#D9531E',
          hover: '#C24412',
          faint: '#FDF1EC',
          border: '#F4CBB8',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(28, 27, 25, 0.05)',
        'lift': '0 4px 8px -2px rgba(28, 27, 25, 0.08)',
      }
    },
  },
  plugins: [],
}
