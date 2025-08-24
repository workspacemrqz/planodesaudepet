import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Configuração ultra-simplificada para buildpack
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    target: "es2015",
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
  // Configurações específicas para buildpack
  optimizeDeps: {
    include: ["react", "react-dom"]
  },
  // Garantir que funcione em produção
  mode: "production"
});
