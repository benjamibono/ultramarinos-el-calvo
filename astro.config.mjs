import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.ultramarinoselcalvo.com",
  integrations: [
    tailwind(),
    react({
      include: ["**/react/**", "**/InstagramStories.jsx"],
      ssr: false,
    }),
    sitemap({
      i18n: {
        defaultLocale: "es",
        locales: {
          es: "es-ES",
          en: "en-US",
        },
      },
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
