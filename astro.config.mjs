import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  output: "static",
  adapter: vercel(),
  prefetch: true,
  site: "https://www.ultramarinoselcalvo.com",
  integrations: [
    react({
      include: ["**/react/**", "**/InstagramStories.jsx", "**/AdminPanel.jsx", "**/VideoAdminPanel.jsx"],
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
    plugins: [tailwindcss()],
    build: {
      minify: true,
      cssMinify: true,
    },
  },
});
