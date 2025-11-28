// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwind()],
    server: {
      allowedHosts: ["kader.munthe.dev"],
    },
  },

  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});

