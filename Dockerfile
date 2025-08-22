# Use the official Heroku builder image
FROM heroku/builder:24

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies with retry and fallback
RUN npm ci --only=production --no-audit --no-fund --prefer-offline || \
    (echo "Retrying npm install..." && npm ci --only=production --no-audit --no-fund --prefer-offline) || \
    (echo "Fallback to npm install..." && npm install --only=production --no-audit --no-fund --prefer-offline)

# Clean npm cache
RUN npm cache clean --force

# Copy source code
COPY . .

# Build the application with production config and fallback
RUN npm run build || npm run build:fallback

# Create production start script
RUN echo '#!/bin/bash\nnode server/start-production.js' > /app/start.sh && chmod +x /app/start.sh

# Create health check script
RUN echo '#!/bin/bash\ncurl -f http://localhost:8080/api/health || exit 1' > /app/healthcheck.sh && chmod +x /app/healthcheck.sh

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD ["/app/healthcheck.sh"]

# Start the application
CMD ["/app/start.sh"]
