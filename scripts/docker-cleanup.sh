#!/bin/bash

# BuffrSign Docker Cleanup Script
# Clean up Docker resources

set -e

echo "🧹 Cleaning up BuffrSign Docker resources..."

# Stop and remove containers
echo "🛑 Stopping containers..."
docker-compose down --remove-orphans

# Remove images
echo "🗑️  Removing images..."
docker-compose down --rmi all

# Remove volumes
echo "🗑️  Removing volumes..."
docker-compose down -v

# Remove unused Docker resources
echo "🧹 Removing unused Docker resources..."
docker system prune -f

# Remove specific BuffrSign images
echo "🗑️  Removing BuffrSign images..."
docker images | grep buffrsign | awk '{print $3}' | xargs -r docker rmi -f

echo "✅ Cleanup completed!"
echo "💡 Run './scripts/docker-dev.sh' to start fresh development environment"
