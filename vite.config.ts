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
      "@": path.resolve(__dirname, "client/src"), // Ensure alias is correct
    }
  },
  root: path.resolve(__dirname, "client"), // Ensures Vite serves from the correct folder
  build: {
    outDir: path.resolve(__dirname, "client/dist"), // ✅ Store the build in client/dist
    emptyOutDir: true,
    target: "esnext",
  },
  server: {
    port: 3000, // ✅ Standard Vite React port
    strictPort: true,
    host: "localhost", // Prevents external access
    watch: {
      usePolling: true, // Fix for file-watching issues
    },
    open: true, // Auto-opens the browser on start
  },
  esbuild: {
    jsxInject: undefined,
  },
});
