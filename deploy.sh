#!/bin/bash

# EasyPanel Deploy Script for Plano de Saúde Pet
# This script helps deploy the application to EasyPanel

set -e

echo "🚀 Starting deployment to EasyPanel..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is required"
    exit 1
fi

if [ -z "$LOGIN" ]; then
    echo "❌ Error: LOGIN environment variable is required"
    exit 1
fi

if [ -z "$SENHA" ]; then
    echo "❌ Error: SENHA environment variable is required"
    exit 1
fi

if [ -z "$SESSION_SECRET" ]; then
    echo "❌ Error: SESSION_SECRET environment variable is required"
    exit 1
fi

echo "✅ Environment variables validated"

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t planodesaudepet:latest .

echo "✅ Docker image built successfully"

# Run the container
echo "🚀 Starting container..."
docker run -d \
    --name planodesaudepet \
    -p 8080:8080 \
    -e NODE_ENV=production \
    -e PORT=8080 \
    -e HOST=0.0.0.0 \
    -e DATABASE_URL="$DATABASE_URL" \
    -e LOGIN="$LOGIN" \
    -e SENHA="$SENHA" \
    -e SESSION_SECRET="$SESSION_SECRET" \
    -v "$(pwd)/uploads:/app/uploads" \
    planodesaudepet:latest

echo "✅ Container started successfully"
echo "🌐 Application is running on http://localhost:8080"

# Wait for the application to be ready
echo "⏳ Waiting for application to be ready..."
sleep 10

# Check if the application is responding
if curl -f http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "✅ Application is healthy and responding"
else
    echo "⚠️  Application might still be starting up"
    echo "📋 Check logs with: docker logs planodesaudepet"
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker logs planodesaudepet"
echo "  Stop app: docker stop planodesaudepet"
echo "  Remove app: docker rm planodesaudepet"
echo "  Restart app: docker restart planodesaudepet"
