import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8e72d5', // Main primary color
          600: '#7c5ec8',
          700: '#6b4bb3',
          800: '#5a3d95',
          900: '#4a3278',
        },
      },
      borderRadius: {
        'pill': '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
