// postcss.config.mjs
export default {
  plugins: {
    // Change 'tailwindcss' to '@tailwindcss/postcss'
    '@tailwindcss/postcss': {}, // This is the key change
    autoprefixer: {},
  },
};