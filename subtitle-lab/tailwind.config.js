/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        archivo: ['"Archivo Black"', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        space: ['"Space Grotesk"', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        libre: ['"Libre Baskerville"', 'serif'],
        manrope: ['Manrope', 'sans-serif'],
        dm: ['"DM Sans"', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        caveat: ['Caveat', 'cursive'],
        kalam: ['Kalam', 'cursive'],
      },
    },
  },
  plugins: [],
};
