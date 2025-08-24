import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Configuração otimizada para produção e buildpack
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    target: "es2020",
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
    'process.env.NODE_ENV': '"production"'
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    force: true
  },
  mode: "production"
});
