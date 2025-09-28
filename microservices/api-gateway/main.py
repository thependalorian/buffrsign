"""
BuffrSign API Gateway - Microservice
Centralized entry point for all BuffrSign microservices
Handles routing, authentication, rate limiting, and load balancing
"""

import os
import logging
import httpx
import redis.asyncio as redis
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import FastAPI, Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import time
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Redis setup
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = None

# Security
security = HTTPBearer()

# Microservices configuration
MICROSERVICES = {
    "auth": {
        "url": os.getenv("AUTH_SERVICE_URL", "http://localhost:8001"),
        "prefix": "/api/auth",
        "rate_limit": 100,
        "timeout": 30
    },
    "documents": {
        "url": os.getenv("DOCUMENT_SERVICE_URL", "http://localhost:8002"),
        "prefix": "/api/documents",
        "rate_limit": 50,
        "timeout": 60
    },
    "signatures": {
        "url": os.getenv("SIGNATURE_SERVICE_URL", "http://localhost:8003"),
        "prefix": "/api/signatures",
        "rate_limit": 30,
        "timeout": 60
    },
    "emails": {
        "url": os.getenv("EMAIL_SERVICE_URL", "http://localhost:8004"),
        "prefix": "/api/emails",
        "rate_limit": 20,
        "timeout": 30
    },
    "ai": {
        "url": os.getenv("AI_SERVICE_URL", "http://localhost:8005"),
        "prefix": "/api/ai",
        "rate_limit": 10,
        "timeout": 120
    }
}

app = FastAPI(
    title="BuffrSign API Gateway",
    description="Centralized API Gateway for BuffrSign microservices",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting models
class RateLimitInfo(BaseModel):
    requests: int
    window_start: float
    limit: int

# Health check response
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    services: Dict[str, str]

# Rate limiting service
class RateLimitService:
    def __init__(self):
        self.redis_client = None
    
    async def get_redis(self):
        if self.redis_client is None:
            self.redis_client = redis.from_url(REDIS_URL)
        return self.redis_client
    
    async def check_rate_limit(self, key: str, limit: int, window: int = 60) -> bool:
        """Check if request is within rate limit"""
        redis_conn = await self.get_redis()
        
        try:
            current_time = time.time()
            window_start = current_time - window
            
            # Use sliding window counter
            pipe = redis_conn.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zcard(key)
            pipe.zadd(key, {str(current_time): current_time})
            pipe.expire(key, window)
            
            results = await pipe.execute()
            current_count = results[1]
            
            return current_count < limit
            
        except Exception as e:
            logger.error(f"Rate limit check failed: {e}")
            return True  # Allow request if rate limiting fails

# Initialize rate limiting service
rate_limit_service = RateLimitService()

# Authentication service
class AuthService:
    def __init__(self):
        self.auth_service_url = MICROSERVICES["auth"]["url"]
    
    async def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token with auth service"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.auth_service_url}/api/auth/me",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=10
                )
                if response.status_code == 200:
                    return response.json()
                return None
            except httpx.RequestError:
                return None

# Initialize auth service
auth_service = AuthService()

# Service discovery and health check
class ServiceDiscovery:
    def __init__(self):
        self.services = MICROSERVICES
    
    async def check_service_health(self, service_name: str) -> bool:
        """Check if service is healthy"""
        service_config = self.services.get(service_name)
        if not service_config:
            return False
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{service_config['url']}/api/health",
                    timeout=5
                )
                return response.status_code == 200
            except httpx.RequestError:
                return False
    
    async def get_healthy_services(self) -> Dict[str, str]:
        """Get all healthy services"""
        healthy_services = {}
        
        for service_name, service_config in self.services.items():
            if await self.check_service_health(service_name):
                healthy_services[service_name] = "healthy"
            else:
                healthy_services[service_name] = "unhealthy"
        
        return healthy_services

# Initialize service discovery
service_discovery = ServiceDiscovery()

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current authenticated user"""
    token = credentials.credentials
    user = await auth_service.verify_token(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user

# Rate limiting dependency
async def check_rate_limit(request: Request, service_name: str = "default"):
    """Check rate limit for request"""
    # Get client IP
    client_ip = request.client.host
    
    # Get service config
    service_config = MICROSERVICES.get(service_name, {"rate_limit": 100})
    rate_limit = service_config["rate_limit"]
    
    # Create rate limit key
    rate_limit_key = f"rate_limit:{client_ip}:{service_name}"
    
    # Check rate limit
    if not await rate_limit_service.check_rate_limit(rate_limit_key, rate_limit):
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Limit: {rate_limit} requests per minute"
        )

# Service routing functions
async def route_auth_service(request: Request, path: str):
    """Route requests to auth service"""
    service_config = MICROSERVICES["auth"]
    
    async with httpx.AsyncClient(timeout=service_config["timeout"]) as client:
        url = f"{service_config['url']}{path}"
        
        # Forward request
        response = await client.request(
            method=request.method,
            url=url,
            headers=dict(request.headers),
            content=await request.body()
        )
        
        return JSONResponse(
            content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
            status_code=response.status_code,
            headers=dict(response.headers)
        )

async def route_document_service(request: Request, path: str, current_user: Dict[str, Any]):
    """Route requests to document service"""
    service_config = MICROSERVICES["documents"]
    
    async with httpx.AsyncClient(timeout=service_config["timeout"]) as client:
        url = f"{service_config['url']}{path}"
        
        # Add user context to headers
        headers = dict(request.headers)
        headers["X-User-ID"] = current_user["id"]
        headers["X-User-Role"] = current_user["role"]
        
        response = await client.request(
            method=request.method,
            url=url,
            headers=headers,
            content=await request.body()
        )
        
        return JSONResponse(
            content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
            status_code=response.status_code,
            headers=dict(response.headers)
        )

async def route_signature_service(request: Request, path: str, current_user: Dict[str, Any]):
    """Route requests to signature service"""
    service_config = MICROSERVICES["signatures"]
    
    async with httpx.AsyncClient(timeout=service_config["timeout"]) as client:
        url = f"{service_config['url']}{path}"
        
        # Add user context to headers
        headers = dict(request.headers)
        headers["X-User-ID"] = current_user["id"]
        headers["X-User-Role"] = current_user["role"]
        
        response = await client.request(
            method=request.method,
            url=url,
            headers=headers,
            content=await request.body()
        )
        
        return JSONResponse(
            content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
            status_code=response.status_code,
            headers=dict(response.headers)
        )

async def route_email_service(request: Request, path: str, current_user: Dict[str, Any]):
    """Route requests to email service"""
    service_config = MICROSERVICES["emails"]
    
    async with httpx.AsyncClient(timeout=service_config["timeout"]) as client:
        url = f"{service_config['url']}{path}"
        
        # Add user context to headers
        headers = dict(request.headers)
        headers["X-User-ID"] = current_user["id"]
        headers["X-User-Role"] = current_user["role"]
        
        response = await client.request(
            method=request.method,
            url=url,
            headers=headers,
            content=await request.body()
        )
        
        return JSONResponse(
            content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
            status_code=response.status_code,
            headers=dict(response.headers)
        )

async def route_ai_service(request: Request, path: str, current_user: Dict[str, Any]):
    """Route requests to AI service"""
    service_config = MICROSERVICES["ai"]
    
    async with httpx.AsyncClient(timeout=service_config["timeout"]) as client:
        url = f"{service_config['url']}{path}"
        
        # Add user context to headers
        headers = dict(request.headers)
        headers["X-User-ID"] = current_user["id"]
        headers["X-User-Role"] = current_user["role"]
        
        response = await client.request(
            method=request.method,
            url=url,
            headers=headers,
            content=await request.body()
        )
        
        return JSONResponse(
            content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
            status_code=response.status_code,
            headers=dict(response.headers)
        )

# API Routes
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    services = await service_discovery.get_healthy_services()
    
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        services=services
    )

# Auth service routes
@app.api_route("/api/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def auth_routes(request: Request, path: str):
    """Route auth service requests"""
    await check_rate_limit(request, "auth")
    return await route_auth_service(request, f"/api/auth/{path}")

# Document service routes
@app.api_route("/api/documents/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def document_routes(request: Request, path: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Route document service requests"""
    await check_rate_limit(request, "documents")
    return await route_document_service(request, f"/api/documents/{path}", current_user)

# Signature service routes
@app.api_route("/api/signatures/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def signature_routes(request: Request, path: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Route signature service requests"""
    await check_rate_limit(request, "signatures")
    return await route_signature_service(request, f"/api/signatures/{path}", current_user)

# Email service routes
@app.api_route("/api/emails/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def email_routes(request: Request, path: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Route email service requests"""
    await check_rate_limit(request, "emails")
    return await route_email_service(request, f"/api/emails/{path}", current_user)

# AI service routes
@app.api_route("/api/ai/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def ai_routes(request: Request, path: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Route AI service requests"""
    await check_rate_limit(request, "ai")
    return await route_ai_service(request, f"/api/ai/{path}", current_user)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "BuffrSign API Gateway",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "services": list(MICROSERVICES.keys())
    }

# Service status endpoint
@app.get("/api/services/status")
async def services_status():
    """Get status of all microservices"""
    services = await service_discovery.get_healthy_services()
    
    return {
        "services": services,
        "total_services": len(services),
        "healthy_services": sum(1 for status in services.values() if status == "healthy"),
        "timestamp": datetime.utcnow().isoformat()
    }

# Metrics endpoint
@app.get("/api/metrics")
async def get_metrics():
    """Get API Gateway metrics"""
    redis_conn = await rate_limit_service.get_redis()
    
    try:
        # Get rate limit keys
        rate_limit_keys = await redis_conn.keys("rate_limit:*")
        
        metrics = {
            "total_rate_limit_keys": len(rate_limit_keys),
            "services": {},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Get metrics per service
        for service_name in MICROSERVICES.keys():
            service_keys = [key for key in rate_limit_keys if service_name in key]
            metrics["services"][service_name] = {
                "rate_limit_keys": len(service_keys),
                "status": "healthy" if await service_discovery.check_service_health(service_name) else "unhealthy"
            }
        
        return metrics
        
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        return {
            "error": "Failed to get metrics",
            "timestamp": datetime.utcnow().isoformat()
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)