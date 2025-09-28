# BuffrSign Docker Setup

This document provides comprehensive instructions for running BuffrSign using Docker containers.

## 🏗️ Architecture

BuffrSign is a Next.js application that runs entirely in Docker containers. The setup includes:

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and DaisyUI
- **Database**: Supabase (PostgreSQL) - external service
- **AI Services**: Groq, OpenAI - external APIs
- **Email**: SendGrid - external service

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0+
- Node.js 20+ (for local development)
- Environment variables configured

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.template .env
```

Edit `.env` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key

# Authentication
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 2. Development Environment

Start the development environment:

```bash
# Using the helper script
./scripts/docker-dev.sh

# Or manually
docker-compose up frontend
```

The application will be available at: http://localhost:3000

### 3. Production Environment

Start the production environment:

```bash
# Using the helper script
./scripts/docker-prod.sh

# Or manually
docker-compose --profile production up -d frontend-prod
```

The production application will be available at: http://localhost:3001

## 🧪 Testing

Run tests in Docker:

```bash
# Using the helper script
./scripts/docker-test.sh

# Or manually
docker-compose --profile testing run --rm frontend-test
```

## 🛠️ Available Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| `docker-dev.sh` | Start development environment | `./scripts/docker-dev.sh` |
| `docker-prod.sh` | Start production environment | `./scripts/docker-prod.sh` |
| `docker-test.sh` | Run tests | `./scripts/docker-test.sh` |
| `docker-cleanup.sh` | Clean up Docker resources | `./scripts/docker-cleanup.sh` |

## 🐳 Docker Commands

### Development

```bash
# Build development image
docker-compose build frontend

# Start development server
docker-compose up frontend

# Start in background
docker-compose up -d frontend

# View logs
docker-compose logs -f frontend

# Stop development server
docker-compose down
```

### Production

```bash
# Build production image
docker-compose --profile production build frontend-prod

# Start production server
docker-compose --profile production up -d frontend-prod

# View production logs
docker-compose --profile production logs -f frontend-prod

# Stop production server
docker-compose --profile production down
```

### Testing

```bash
# Run tests
docker-compose --profile testing run --rm frontend-test

# Run tests with coverage
docker-compose --profile testing run --rm frontend-test npm run test:coverage
```

## 🔧 Docker Configuration

### Multi-Stage Build

The Dockerfile uses multi-stage builds for optimization:

1. **deps**: Install production dependencies
2. **builder**: Build the Next.js application
3. **runner**: Production runtime (minimal image)
4. **development**: Development environment with hot reload
5. **testing**: Testing environment with test dependencies

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Node environment | Yes |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `GROQ_API_KEY` | Groq API key for AI services | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `SENDGRID_API_KEY` | SendGrid API key for emails | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Yes |
| `NEXTAUTH_URL` | NextAuth.js URL | Yes |

## 🏥 Health Checks

The application includes health checks:

- **Development**: http://localhost:3000/api/health
- **Production**: http://localhost:3001/api/health

Health check status can be viewed with:

```bash
docker-compose ps
```

## 📊 Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend

# Production logs
docker-compose --profile production logs -f frontend-prod
```

### Container Status

```bash
# Running containers
docker-compose ps

# Resource usage
docker stats
```

## 🧹 Cleanup

### Clean Up Resources

```bash
# Using helper script
./scripts/docker-cleanup.sh

# Manual cleanup
docker-compose down --rmi all -v
docker system prune -f
```

### Reset Everything

```bash
# Stop all containers
docker-compose down

# Remove all images
docker-compose down --rmi all

# Remove all volumes
docker-compose down -v

# Clean up system
docker system prune -a -f
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill the process or use different port
   docker-compose up -p 3001:3000 frontend
   ```

2. **Environment variables not loaded**
   ```bash
   # Check if .env file exists
   ls -la .env
   
   # Verify environment variables
   docker-compose config
   ```

3. **Build failures**
   ```bash
   # Clean build
   docker-compose build --no-cache frontend
   
   # Check build logs
   docker-compose build frontend
   ```

4. **Permission issues**
   ```bash
   # Fix script permissions
   chmod +x scripts/docker-*.sh
   ```

### Debug Mode

Run containers in debug mode:

```bash
# Development with debug
docker-compose run --rm frontend sh

# Production with debug
docker-compose --profile production run --rm frontend-prod sh
```

## 📈 Performance Optimization

### Build Optimization

- Multi-stage builds reduce final image size
- `.dockerignore` excludes unnecessary files
- Standalone Next.js output for production
- Node.js Alpine images for smaller footprint

### Runtime Optimization

- Non-root user for security
- Health checks for reliability
- Proper signal handling
- Resource limits (can be added to docker-compose.yml)

## 🔒 Security

### Security Features

- Non-root user in containers
- Minimal base images (Alpine Linux)
- No unnecessary packages in production
- Environment variable isolation
- Health checks for monitoring

### Security Best Practices

1. Keep base images updated
2. Use specific image tags
3. Scan images for vulnerabilities
4. Limit container resources
5. Use secrets management for sensitive data

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Supabase Documentation](https://supabase.com/docs)

## 🤝 Contributing

When contributing to the Docker setup:

1. Test changes in development environment
2. Verify production build works
3. Update documentation if needed
4. Test cleanup scripts
5. Ensure security best practices

## 📞 Support

For Docker-related issues:

1. Check this documentation
2. Review Docker logs
3. Verify environment variables
4. Test with clean environment
5. Create issue with detailed logs
