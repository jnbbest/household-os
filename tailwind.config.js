/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#f3eee2',
        plate: '#fcf9f3',
        'plate-2': '#f7f2e6',
        grid: '#e4dbc9',
        rule: '#cfc4ae',
        'rule-2': '#b6a991',
        ink: '#231e18',
        body: '#51483d',
        muted: '#7a7063',
        faint: '#a59a87',
        terra: {
          DEFAULT: '#bd4e29',
          light: '#d96c42',
          wash: '#bd4e290d'
        },
        sage: '#56704d',
        brass: '#a07a26',
        blue: '#3b5f7d',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['Fraunces', 'serif'],
      }
    },
  },
  plugins: [],
}
