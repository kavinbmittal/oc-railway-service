import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/mc/",
  build: {
    outDir: "dist",
  },
  server: {
    proxy: {
      "/mc/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
