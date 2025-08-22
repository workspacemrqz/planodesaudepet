import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { config } from "dotenv";

// Carrega as variáveis de ambiente
config();

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    // Plugin to create uploads directory
    {
      name: 'create-uploads-dir',
      writeBundle() {
        const uploadsDir = path.resolve(import.meta.dirname, "dist/public/uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
          console.log('Created uploads directory after build:', uploadsDir);
          // Create a gitkeep file to ensure the directory is tracked
          fs.writeFileSync(path.join(uploadsDir, '.gitkeep'), '# This ensures the uploads directory exists\n');
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      "date-fns": path.resolve(import.meta.dirname, "node_modules", "date-fns")
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('wouter')) {
              return 'router';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  define: {
    // This helps create the uploads directory during build
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  server: {
    fs: {
      strict: false,
      allow: [".."]
    },
  },
});
