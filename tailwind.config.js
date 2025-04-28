import {heroui} from "@heroui/react";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
    // ...nextui.content
  ],
  theme: {
    extend: {
      fontFamily: {
        geist: "var(--font-geist-sans)",
        geistMono: "var(--font-geist-mono)",
        poppins: "var(--font-poppins)",
        josefin: "var(--font-josefin-sans)",
        bricolage_grotesque: "var(--font-bricolage-grotesque)",
      },
      backgroundImage: {
        dark_background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e);"
      }
    },
  },
  plugins: [heroui()]
};
export default config;