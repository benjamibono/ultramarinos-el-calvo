import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  site: "https://www.ultramarinoselcalvo.com",
  integrations: [
    tailwind(),
    react({
      include: ["**/react/**", "**/InstagramStories.jsx", "**/AdminPanel.jsx", "**/VideoAdminPanel.jsx"],
      ssr: false,
    }),
    sitemap({
      filter: (page) => !page.includes("/admin"),
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
