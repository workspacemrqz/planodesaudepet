export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
  // Configuração específica para produção
  options: {
    from: undefined,
    to: undefined
  },
  // Configurações adicionais para otimização
  map: false, // Desabilitar source maps em produção
  parser: 'postcss-scss', // Usar parser SCSS se necessário
}
