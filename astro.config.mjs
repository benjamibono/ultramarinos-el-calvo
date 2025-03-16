import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    react({
      include: ["**/react/**", "**/InstagramStories.jsx"],
      ssr: false, // Desactiva SSR para componentes React si no es necesario
    }),
  ],
  image: {
    remotePatterns: [],
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            stories: ["react-insta-stories"],
          },
        },
      },
      minify: true,
      cssMinify: true,
    },
  },
});
