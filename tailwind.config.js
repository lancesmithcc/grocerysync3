module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Jost', 'sans-serif'],
      },
      colors: {
        purple: "#8b5cf6",
        background: "#0d0d0d",
        black: "#000000"
      },
      borderRadius: {
        aurora: "33px"
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    }
  },
  plugins: []
}; 