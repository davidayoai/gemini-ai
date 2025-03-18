import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@db": path.resolve(__dirname, "db"),
      "@": path.resolve(__dirname, "client/src"), // Keep alias structure consistent
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    target: "esnext", // Ensures modern JavaScript support
  },
  server: {
    port: 3000, // Set development server port
    strictPort: true, // Prevents conflicts with other apps
    host: true, // Allows network access for mobile/devices
    watch: {
      usePolling: true, // Fixes issues with file watching in some environments
    },
  },
  esbuild: {
    jsxInject: undefined, // Prevents auto-injecting React if manually imported
  },
});
