# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 80

# Set environment
ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0

# Start the application
CMD ["npm", "start"]
