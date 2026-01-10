import { color } from 'motion';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      height: {
        "9.5/10-vh": "95vh",
        "1/10-vh": "10vh",
        "2.5/10-vh": "25vh",
      },
      colors: {
        primary: "#54ca84",
        secondary: "#32ac64",
        "primary-light": "#f0f0f0",
        "primary-dark": "#111111",
        "secondary-light": "#f8f8f8",
        "secondary-dark": "#000000",
      },
      animation: {
        marquee: "marquee 15s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [],
};
