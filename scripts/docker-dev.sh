#!/bin/bash

# BuffrSign Docker Development Script
# Quick development environment setup

set -e

echo "🚀 Starting BuffrSign Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f env.template ]; then
        cp env.template .env
        echo "✅ Created .env from template. Please update with your actual values."
    else
        echo "❌ env.template not found. Please create a .env file manually."
        exit 1
    fi
fi

# Build and start development environment
echo "🔨 Building development container..."
docker-compose build frontend

echo "🚀 Starting development server..."
docker-compose up frontend

echo "✅ Development environment is running!"
echo "📱 Frontend: http://localhost:3000"
echo "🛑 Press Ctrl+C to stop"
