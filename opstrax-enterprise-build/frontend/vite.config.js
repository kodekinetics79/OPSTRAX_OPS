import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 10000,
    host: '0.0.0.0',
    strictPort: true,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/views": path.resolve(__dirname, "./src/views"),
      "@/api": path.resolve(__dirname, "./src/config/api"),
      "@/routes": path.resolve(__dirname, "./src/config/routes"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/config": path.resolve(__dirname, "./src/config"),
      "@/constants": path.resolve(__dirname, "./src/constants"),
      "@/context": path.resolve(__dirname, "./src/context"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/assets": path.resolve(__dirname, "./src/assets"),
      "@/layout": path.resolve(__dirname, "./src/layout"),
      "@/utils": path.resolve(__dirname, "./src/utils")
    },
  },
});
