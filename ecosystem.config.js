module.exports = {
  apps: [
    {
      name: 'unipet-plan',
      script: 'dist/server/index.js',
      cwd: process.cwd(),
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8080,
        HOST: process.env.HOST || '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8080,
        HOST: process.env.HOST || '0.0.0.0'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads', 'dist'],
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Configurações específicas para Easypanel
      source_map_support: false,
      disable_source_map_support: true,
      // Configurações de performance
      node_args: '--max-old-space-size=512',
      // Configurações de health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true
    }
  ],
  
  // Configurações de deploy
  deploy: {
    production: {
      user: 'node',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'https://github.com/seu-usuario/planodesaudepet.git',
      path: '/app',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
