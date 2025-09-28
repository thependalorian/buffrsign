#!/bin/bash

# BuffrSign Production Deployment Script
set -e

echo "🚀 Starting BuffrSign Production Deployment..."

# Check if required environment variables are set
required_vars=(
    "DATABASE_URL"
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "REDIS_URL"
    "OPENAI_API_KEY"
    "GROQ_API_KEY"
    "NEO4J_URI"
    "NEO4J_USERNAME"
    "NEO4J_PASSWORD"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Environment variable $var is not set"
        exit 1
    fi
done

echo "✅ All required environment variables are set"

# Create necessary directories
mkdir -p logs ssl

# Build and start services
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.production.yml build

echo "🚀 Starting services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Health check
echo "🏥 Performing health check..."
max_attempts=10
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Health check passed"
        break
    else
        echo "⏳ Health check attempt $attempt/$max_attempts failed, retrying..."
        sleep 10
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Health check failed after $max_attempts attempts"
    echo "📋 Service logs:"
    docker-compose -f docker-compose.production.yml logs backend
    exit 1
fi

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.production.yml exec backend python -c "
import asyncio
from services.database_service import DatabaseService

async def migrate():
    db_service = DatabaseService()
    await db_service.initialize()
    print('✅ Database migrations completed')

asyncio.run(migrate())
"

# Initialize Neo4j
echo "🕸️ Initializing Neo4j..."
docker-compose -f docker-compose.production.yml exec backend python -c "
import asyncio
from agent.initialize_orchestration import initialize_orchestration

async def init_neo4j():
    status = await initialize_orchestration()
    if status:
        print('✅ Neo4j initialization completed')
    else:
        print('⚠️ Neo4j initialization failed')

asyncio.run(init_neo4j())
"

echo "🎉 BuffrSign Production Deployment Completed Successfully!"
echo "📊 Service Status:"
docker-compose -f docker-compose.production.yml ps

echo "🌐 Services available at:"
echo "  - API: http://localhost:8000"
echo "  - Neo4j Browser: http://localhost:7474"
echo "  - Redis: localhost:6379"