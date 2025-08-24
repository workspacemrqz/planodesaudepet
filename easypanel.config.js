module.exports = {
  // Configuração do Build
  build: {
    method: 'buildpacks',
    builder: 'heroku/builder:24'
  },

  // Configuração do Deploy
  deploy: {
    restartPolicy: 'always'
  },

  // Variáveis de Ambiente
  environment: {
    NODE_ENV: 'production',
    PORT: '8080',
    HOST: '0.0.0.0'
  },

  // Recursos
  resources: {
    cpu: '0.5',
    memory: '512Mi'
  },

  // Configurações de Rede
  network: {
    port: 8080,
    protocol: 'http'
  },

  // Configurações de Log
  logging: {
    level: 'info',
    format: 'json'
  },

  // Configurações de Monitoramento
  monitoring: {
    enabled: true,
    metrics: true,
    healthCheck: true
  }
};
