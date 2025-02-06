import { defineConfig } from "astro/config";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://eclipticcreative.com",
  server: {
    host: "0.0.0.0",
    port: 4321,
  },
  integrations: [icon()],
});
