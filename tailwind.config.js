// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: '#4589FF',
        light: '#F5F8FD',
        grayish: '#F4F4F4',
        accent: '#FF3D00',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      }
    }
  },
  plugins: [],
}
