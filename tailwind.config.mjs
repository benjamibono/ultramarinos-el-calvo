import animations from "@midudev/tailwind-animations";
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat Variable', ...defaultTheme.fontFamily.sans],
      },
      overscrollBehavior: {
        none: "none",
      },
    },
    screens: {
      xs: "320px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      xxl: "1536px"
    },
  },
  plugins: [animations],
};
