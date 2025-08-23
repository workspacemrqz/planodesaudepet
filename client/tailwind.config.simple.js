/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{css,scss}"
  ],
  theme: {
    extend: {
      colors: {
        "unipet-dark": "#277F80",
        "unipet-primary": "#EAA42A", 
        "unipet-white": "#FFFFFF",
        "unipet-light": "#F2F2F2",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
