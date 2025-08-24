/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './index.html'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#277677',
        secondary: '#1a5a5c',
        accent: '#E1AC33',
        light: '#FBF9F7',
        dark: '#302e2b'
      }
    },
  },
  plugins: [],
}
