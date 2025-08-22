# Use the official Heroku builder image
FROM heroku/builder:24

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create production start script
RUN echo '#!/bin/bash\nnode server/start-production.js' > /app/start.sh && chmod +x /app/start.sh

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Start the application
CMD ["/app/start.sh"]
