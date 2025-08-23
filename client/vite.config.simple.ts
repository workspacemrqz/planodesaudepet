import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Configuração simplificada para buildpack
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild", // Usar esbuild que é mais rápido e não requer dependências extras
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"]
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  define: {
    global: "globalThis",
  },
});
