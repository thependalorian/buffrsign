#!/bin/bash

# BuffrSign Docker Production Script
# Production deployment setup

set -e

echo "🚀 Starting BuffrSign Production Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one with production values."
    exit 1
fi

# Build production image
echo "🔨 Building production container..."
docker-compose --profile production build frontend-prod

# Start production environment
echo "🚀 Starting production server..."
docker-compose --profile production up -d frontend-prod

echo "✅ Production environment is running!"
echo "📱 Frontend: http://localhost:3001"
echo "📊 Check logs: docker-compose --profile production logs -f frontend-prod"
echo "🛑 Stop: docker-compose --profile production down"
