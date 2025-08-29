import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { LOCAL_IP } = require("./scripts/generate-env.cjs");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: LOCAL_IP,
    port: 5173,
    proxy: {
      "/api": {
        target: `http://${LOCAL_IP}:8080`,
        changeOrigin: true,
      },
      "/uploads": {
        target: `http://${LOCAL_IP}:8080`,
        changeOrigin: true,
      },
    },
  },
});
