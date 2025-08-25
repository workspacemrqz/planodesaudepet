
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './index.html'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E1AC33',
        secondary: '#277677',
        accent: '#277677',
        light: '#FBF9F7',
        dark: '#302e2b',
        'unipet-dark': '#277677',
        'unipet-primary': '#E1AC33',
        'unipet-white': '#FBF9F7',
        'unipet-light': '#f5f5f5'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
