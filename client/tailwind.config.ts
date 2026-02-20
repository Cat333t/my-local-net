/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--primary-color) / <alpha-value>)',
        secondary: 'rgb(var(--secondary-color) / <alpha-value>)',
        "bg-dark": 'rgb(var(--bg-dark) / <alpha-value>)',
        "bg": 'rgb(var(--bg) / <alpha-value>)',
        "bg-light": 'rgb(var(--bg-light) / <alpha-value>)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}