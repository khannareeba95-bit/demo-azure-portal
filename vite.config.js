import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
// to check quicksight dashboard in local enable commented line
//import viteBasicSslPlugin from '@vitejs/plugin-basic-ssl';
export default defineConfig({
  base: "/", // This ensures absolute paths from root
  build: {
    rollupOptions: {
      external: [/^node:.*/],
    },
    outDir: "dist",
    assetsDir: "assets",
  },
  plugins: [
    react(),
    // viteBasicSslPlugin()
  ],
  server: {
    watch: {
      usePolling: true,
    },
    // https: true,

    port: 3000,

    open: true,
  },
  define: {
    global: "window",
    // global: {},
    // _global: "({})",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "./runtimeConfig": "./runtimeConfig.browser",
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});
