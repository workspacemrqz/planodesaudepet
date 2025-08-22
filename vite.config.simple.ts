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
            if (id.includes('date-fns')) {
              return 'date-fns';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  define: {
    // Definir variáveis de ambiente com valores padrão
    'import.meta.env.VITE_DEFAULT_WHATSAPP': JSON.stringify("(11) 99999-9999"),
    'import.meta.env.VITE_DEFAULT_EMAIL': JSON.stringify("contato@unipetplan.com.br"),
    'import.meta.env.VITE_DEFAULT_PHONE': JSON.stringify("0800 123 4567"),
    'import.meta.env.VITE_DEFAULT_ADDRESS': JSON.stringify("AVENIDA DOM SEVERINO, 1372, FATIMA - Teresina/PI"),
    'import.meta.env.VITE_DEFAULT_CNPJ': JSON.stringify("00.000.000/0001-00"),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(""),
    'import.meta.env.VITE_API_TIMEOUT': JSON.stringify("10000"),
    'import.meta.env.VITE_MAX_FILE_SIZE': JSON.stringify("5242880"),
    'import.meta.env.VITE_ALLOWED_FILE_TYPES': JSON.stringify("image/jpeg,image/png,image/gif"),
    'import.meta.env.VITE_DEFAULT_PAGE_SIZE': JSON.stringify("10"),
    'import.meta.env.VITE_MAX_PAGE_SIZE': JSON.stringify("100"),
    'import.meta.env.VITE_DEFAULT_CACHE_TTL': JSON.stringify("300000"),
    'import.meta.env.VITE_MAX_CACHE_TTL': JSON.stringify("3600000"),
    'import.meta.env.VITE_THEME': JSON.stringify("light"),
    'import.meta.env.VITE_LANGUAGE': JSON.stringify("pt-BR"),
    'import.meta.env.VITE_TIMEZONE': JSON.stringify("America/Sao_Paulo"),
    'import.meta.env.VITE_ANALYTICS_ENABLED': JSON.stringify("false"),
    'import.meta.env.VITE_ANALYTICS_TRACKING_ID': JSON.stringify(""),
    'import.meta.env.VITE_MONITORING_ENABLED': JSON.stringify("false"),
    'import.meta.env.VITE_MONITORING_ENDPOINT': JSON.stringify(""),
    'import.meta.env.VITE_FEATURE_DARK_MODE': JSON.stringify("false"),
    'import.meta.env.VITE_FEATURE_ADVANCED_SEARCH': JSON.stringify("false"),
    'import.meta.env.VITE_FEATURE_REALTIME_UPDATES': JSON.stringify("false"),
  },
  server: {
    fs: {
      strict: false,
      allow: [".."]
    },
  },
  optimizeDeps: {
    include: ['date-fns', 'date-fns/locale/pt-BR']
  }
});
