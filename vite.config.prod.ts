import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
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
    // Garantir que as variáveis de ambiente estejam disponíveis
    'import.meta.env.VITE_DEFAULT_WHATSAPP': JSON.stringify(process.env.VITE_DEFAULT_WHATSAPP || "(11) 99999-9999"),
    'import.meta.env.VITE_DEFAULT_EMAIL': JSON.stringify(process.env.VITE_DEFAULT_EMAIL || "contato@unipetplan.com.br"),
    'import.meta.env.VITE_DEFAULT_PHONE': JSON.stringify(process.env.VITE_DEFAULT_PHONE || "0800 123 4567"),
    'import.meta.env.VITE_DEFAULT_ADDRESS': JSON.stringify(process.env.VITE_DEFAULT_ADDRESS || "AVENIDA DOM SEVERINO, 1372, FATIMA - Teresina/PI"),
    'import.meta.env.VITE_DEFAULT_CNPJ': JSON.stringify(process.env.VITE_DEFAULT_CNPJ || "00.000.000/0001-00"),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || ""),
    'import.meta.env.VITE_API_TIMEOUT': JSON.stringify(process.env.VITE_API_TIMEOUT || "10000"),
    'import.meta.env.VITE_MAX_FILE_SIZE': JSON.stringify(process.env.VITE_MAX_FILE_SIZE || "5242880"),
    'import.meta.env.VITE_ALLOWED_FILE_TYPES': JSON.stringify(process.env.VITE_ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/gif"),
    'import.meta.env.VITE_DEFAULT_PAGE_SIZE': JSON.stringify(process.env.VITE_DEFAULT_PAGE_SIZE || "10"),
    'import.meta.env.VITE_MAX_PAGE_SIZE': JSON.stringify(process.env.VITE_MAX_PAGE_SIZE || "100"),
    'import.meta.env.VITE_DEFAULT_CACHE_TTL': JSON.stringify(process.env.VITE_DEFAULT_CACHE_TTL || "300000"),
    'import.meta.env.VITE_MAX_CACHE_TTL': JSON.stringify(process.env.VITE_MAX_CACHE_TTL || "3600000"),
    'import.meta.env.VITE_THEME': JSON.stringify(process.env.VITE_THEME || "light"),
    'import.meta.env.VITE_LANGUAGE': JSON.stringify(process.env.VITE_LANGUAGE || "pt-BR"),
    'import.meta.env.VITE_TIMEZONE': JSON.stringify(process.env.VITE_TIMEZONE || "America/Sao_Paulo"),
    'import.meta.env.VITE_ANALYTICS_ENABLED': JSON.stringify(process.env.VITE_ANALYTICS_ENABLED || "false"),
    'import.meta.env.VITE_ANALYTICS_TRACKING_ID': JSON.stringify(process.env.VITE_ANALYTICS_TRACKING_ID || ""),
    'import.meta.env.VITE_MONITORING_ENABLED': JSON.stringify(process.env.VITE_MONITORING_ENABLED || "false"),
    'import.meta.env.VITE_MONITORING_ENDPOINT': JSON.stringify(process.env.VITE_MONITORING_ENDPOINT || ""),
    'import.meta.env.VITE_FEATURE_DARK_MODE': JSON.stringify(process.env.VITE_FEATURE_DARK_MODE || "false"),
    'import.meta.env.VITE_FEATURE_ADVANCED_SEARCH': JSON.stringify(process.env.VITE_FEATURE_ADVANCED_SEARCH || "false"),
    'import.meta.env.VITE_FEATURE_REALTIME_UPDATES': JSON.stringify(process.env.VITE_FEATURE_REALTIME_UPDATES || "false"),
  },
  server: {
    fs: {
      strict: false,
      allow: [".."]
    },
  },
});
