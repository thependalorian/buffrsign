#!/bin/bash

# BuffrSign Docker Testing Script
# Run tests in Docker environment

set -e

echo "🧪 Starting BuffrSign Testing Environment..."

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
        echo "✅ Created .env from template."
    else
        echo "❌ env.template not found. Please create a .env file manually."
        exit 1
    fi
fi

# Build and run tests
echo "🔨 Building test container..."
docker-compose --profile testing build frontend-test

echo "🧪 Running tests..."
docker-compose --profile testing run --rm frontend-test

echo "✅ Tests completed!"
echo "📊 Test coverage report generated in coverage/ directory"
