// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwind from "@tailwindcss/vite";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      UPLOAD_BASE: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
      DATABASE_URL: envField.string({
        context: "server",
        access: "secret",
        optional: false,
        default: "./database.sqlite",
      }),
    },
  },
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
