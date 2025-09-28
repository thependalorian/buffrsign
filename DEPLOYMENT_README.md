# BuffrSign Digital Signature Platform - Deployment Guide

A comprehensive deployment guide for the BuffrSign digital signature platform with Docker Compose and Caddy reverse proxy support.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Supabase project
- Digital certificate authority setup
- Email service configuration
- Document storage solution

### 1. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit with your configuration
nano .env
```

### 2. Deploy with Script (Recommended)
```bash
# Local development deployment
python deploy.py --type local --project localai

# Cloud production deployment
python deploy.py --type cloud
```

### 3. Manual Docker Compose Deployment
```bash
# Local deployment
docker compose -p buffrsign up -d --build

# Cloud deployment with Caddy
docker compose -f docker-compose.yml -f docker-compose.caddy.yml up -d --build
```

## 📋 Environment Configuration

### Required Variables
```env
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_ANON_KEY=your_anon_key

# Authentication
JWT_SECRET=your_jwt_secret_minimum_32_characters

# Digital Signature
SIGNATURE_ALGORITHM=RSA-SHA256
CERTIFICATE_AUTHORITY=internal
SIGNATURE_VALIDITY_DAYS=365

# Document Storage
STORAGE_PROVIDER=supabase
STORAGE_BUCKET=documents
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx
```

### Compliance Configuration
```env
# Namibia ETA 2019 Compliance
NAMIBIA_ETA_COMPLIANCE=true

# SADC Cross-Border Recognition
SADC_CROSS_BORDER=true

# Audit Logging
AUDIT_LOGGING=true

# Encryption
ENCRYPTION_KEY=your_encryption_key_minimum_32_characters
```

### Optional Variables
```env
# Email Service
EMAIL_PROVIDER=supabase
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Security
CORS_ORIGINS=http://localhost:3000,https://app.sign.buffr.ai
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## 🏗️ Architecture

### Services
- **buffrsign-api**: Main API service (Node.js/Express)
- **buffrsign-frontend**: Next.js frontend application
- **buffrsign-worker**: Background job processor for document processing
- **caddy**: Reverse proxy with SSL (cloud deployment only)

### Networks
- **buffrsign-network**: Internal Docker network for service communication

### Volumes
- **buffrsign-data**: Persistent data storage
- **caddy_data**: Caddy SSL certificates and configuration
- **caddy_config**: Caddy runtime configuration

## 🔧 Deployment Options

### Local Development
```bash
# Deploy alongside existing AI stack
python deploy.py --type local --project localai

# Access points:
# - API: http://localhost:8001
# - Frontend: http://localhost:8082
# - Health: http://localhost:8001/health
```

### Cloud Production
```bash
# Deploy with integrated Caddy and SSL
python deploy.py --type cloud

# Configure domains in .env:
# API_HOSTNAME=api.sign.buffr.ai
# FRONTEND_HOSTNAME=sign.buffr.ai
# LETSENCRYPT_EMAIL=admin@mail.buffr.ai
```

## 🔒 Security Features

### Digital Signature Security
- RSA-SHA256 signature algorithm
- Certificate-based authentication
- Document integrity verification
- Timestamp validation
- Audit trail logging

### Caddy Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000

### API Security
- CORS configuration
- Rate limiting
- JWT authentication
- Request body size limits (10MB)
- File type validation
- Encryption at rest

### SSL/TLS
- Automatic Let's Encrypt certificates
- HTTPS redirect
- HSTS headers

## 📊 Monitoring & Health Checks

### Health Endpoints
```bash
# API health check
curl http://localhost:8001/health

# Frontend health check
curl http://localhost:8082/api/health
```

### Service Monitoring
```bash
# Check service status
docker compose ps

# View service logs
docker compose logs -f buffrsign-api
docker compose logs -f buffrsign-frontend
docker compose logs -f buffrsign-worker

# Check Caddy logs (cloud deployment)
docker compose logs -f caddy
```

## 🔄 Maintenance Operations

### Update Services
```bash
# Rebuild and restart all services
docker compose up -d --build

# Rebuild specific service
docker compose build buffrsign-api
docker compose up -d buffrsign-api
```

### Scale Services
```bash
# Scale worker service for document processing
docker compose up -d --scale buffrsign-worker=3
```

### Backup & Restore
```bash
# Backup volumes
docker run --rm -v buffrsign-data:/data -v $(pwd):/backup alpine tar czf /backup/buffrsign-data.tar.gz -C /data .

# Restore volumes
docker run --rm -v buffrsign-data:/data -v $(pwd):/backup alpine tar xzf /backup/buffrsign-data.tar.gz -C /data
```

## 🚨 Troubleshooting

### Common Issues

1. **Services won't start**
   ```bash
   # Check logs
   docker compose logs -f
   
   # Rebuild without cache
   docker compose build --no-cache
   ```

2. **Port conflicts**
   ```bash
   # Check port usage
   netstat -tlnp | grep :8001
   
   # Stop conflicting services
   docker compose down
   ```

3. **Database connection issues**
   ```bash
   # Verify Supabase credentials
   echo $SUPABASE_URL
   echo $SUPABASE_SERVICE_KEY
   ```

4. **Document storage issues**
   ```bash
   # Check storage configuration
   echo $STORAGE_PROVIDER
   echo $STORAGE_BUCKET
   
   # Verify file permissions
   docker compose exec buffrsign-api ls -la /app/uploads
   ```

5. **SSL certificate issues**
   ```bash
   # Check Caddy logs
   docker compose logs -f caddy
   
   # Restart Caddy
   docker compose restart caddy
   ```

### Performance Optimization

1. **Resource Limits**
   ```yaml
   # Add to docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 1G
         cpus: '1.0'
   ```

2. **Document Processing Optimization**
   ```env
   # Add to .env
   WORKER_CONCURRENCY=5
   DOCUMENT_PROCESSING_TIMEOUT=300000
   ```

## 📚 Compliance & Legal

### Namibia ETA 2019 Compliance
- Electronic signature validity
- Digital certificate requirements
- Audit trail maintenance
- Data protection compliance

### SADC Cross-Border Recognition
- Cross-border document validation
- Regional compliance standards
- International signature recognition

### Security Standards
- ISO 27001 compliance
- SOC 2 Type II requirements
- GDPR data protection
- PCI DSS for payment processing

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Namibia ETA 2019](https://www.lac.org.na/laws/2019/Electronic_Transactions_Act_4_of_2019.pdf)
- [SADC Digital Signature Framework](https://www.sadc.int/)

## 🆘 Support

For deployment issues:
1. Check service logs: `docker compose logs -f`
2. Verify environment variables: `docker compose config`
3. Test health endpoints: `curl http://localhost:8001/health`
4. Review Caddy configuration: `docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile`
5. Check compliance settings: Verify NAMIBIA_ETA_COMPLIANCE and SADC_CROSS_BORDER settings
