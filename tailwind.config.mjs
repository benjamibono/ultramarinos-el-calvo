import animations from "@midudev/tailwind-animations";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      overscrollBehavior: {
        none: "none",
      }
    },
    screens: {
      mobile: "360px",
      tablet: "640px",
      md: "768px",
      laptop: "1024px",
      pc: "1280px",
    },
  },
  plugins: [animations],
};
