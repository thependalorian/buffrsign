"""
Main FastAPI application for BuffrSign - Digital Signature Platform

This is the main entry point that integrates all backend services:
- AI Agent API
- Document processing
- Authentication
- Workflow management
- CLI integration
"""

import os
import logging
import time
import asyncio
from contextlib import asynccontextmanager
from typing import Dict, Any, List
from datetime import datetime
import uvicorn
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
import redis.asyncio as redis

# Import our modules
from auth.auth_utils import get_current_user, create_access_token, verify_token
from api.document_routes import router as document_router
from api.signature_routes import router as signature_router
from api.workflow_routes import router as workflow_router
from api.ai_routes import router as ai_router
from services.database_service import DatabaseService
from services.supabase_service import SupabaseService
from services.storage_service import StorageService

# Import Neo4j agent orchestration
from agent.initialize_orchestration import initialize_orchestration, shutdown_orchestration, get_orchestration_status

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Application configuration
APP_ENV = os.getenv("APP_ENV", "development")
APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
APP_PORT = int(os.getenv("APP_PORT", 8000))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# Security configuration
security = HTTPBearer(auto_error=False)

# Rate limiting configuration
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))  # seconds
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Initialize services
database_service = DatabaseService()
supabase_service = SupabaseService()
storage_service = StorageService()

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware using Redis"""
    
    def __init__(self, app, redis_url: str, max_requests: int, window_seconds: int):
        super().__init__(app)
        self.redis_url = redis_url
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.redis_client = None
    
    async def connect_redis(self):
        """Connect to Redis for rate limiting"""
        try:
            self.redis_client = redis.from_url(self.redis_url)
            await self.redis_client.ping()
            logger.info("✅ Redis connected for rate limiting")
        except Exception as e:
            logger.warning(f"⚠️ Redis not available for rate limiting: {e}")
            self.redis_client = None
    
    async def __call__(self, request: Request, call_next):
        # Skip rate limiting for health checks and static files
        if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Check rate limit
        if self.redis_client:
            try:
                key = f"rate_limit:{client_ip}"
                current_requests = await self.redis_client.get(key)
                
                if current_requests is None:
                    # First request in window
                    await self.redis_client.setex(key, self.window_seconds, 1)
                else:
                    current_count = int(current_requests)
                    if current_count >= self.max_requests:
                        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                        return JSONResponse(
                            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            content={
                                "error": "Rate limit exceeded",
                                "message": f"Too many requests. Limit: {self.max_requests} per {self.window_seconds} seconds",
                                "retry_after": self.window_seconds
                            }
                        )
                    else:
                        await self.redis_client.incr(key)
            except Exception as e:
                logger.error(f"Rate limiting error: {e}")
                # Continue without rate limiting if Redis fails
        
        return await call_next(request)

class SecurityMiddleware(BaseHTTPMiddleware):
    """Security middleware for additional protection"""
    
    async def __call__(self, request: Request, call_next):
        # Add security headers
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Content Security Policy
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none';"
        )
        response.headers["Content-Security-Policy"] = csp_policy
        
        return response

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for FastAPI app."""
    # Startup
    logger.info("🚀 Starting BuffrSign API...")
    logger.info(f"Environment: {APP_ENV}")
    logger.info(f"Host: {APP_HOST}:{APP_PORT}")
    
    try:
        # Initialize services
        logger.info("Initializing services...")
        
        # Initialize database connections
        await database_service.initialize()
        logger.info("✅ Database service initialized")
        
        # Initialize Supabase service
        await supabase_service.initialize()
        logger.info("✅ Supabase service initialized")
        
        # Initialize storage service
        await storage_service.initialize()
        logger.info("✅ Storage service initialized")
        
        # Initialize Neo4j agent orchestration
        orchestration_status = await initialize_orchestration()
        if orchestration_status:
            logger.info("✅ Neo4j agent orchestration initialized")
        else:
            logger.warning("⚠️ Failed to initialize Neo4j agent orchestration")
        
        # Initialize rate limiting
        rate_limit_middleware = app.user_middleware[0].cls
        await rate_limit_middleware.connect_redis()
        
            # Test all service connections
    logger.info("Testing service connections...")
    
    # Test database connection
    await database_service.test_connection()
    logger.info("✅ Database connection successful")
    
    # Test Supabase connection
    await supabase_service.test_connection()
    logger.info("✅ Supabase connection successful")
    
    # Test storage connection
    await storage_service.test_connection()
    logger.info("✅ Storage connection successful")
    
    # Test Neo4j agent orchestration
    orchestration_status = get_orchestration_status()
    if orchestration_status.get("status") == "ready":
        logger.info("✅ Neo4j agent orchestration status: ready")
    else:
        logger.warning(f"⚠️ Neo4j agent orchestration status: {orchestration_status.get('status')}")
        
        logger.info("✅ BuffrSign API startup complete")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down BuffrSign API...")
    try:
        # Cleanup resources
        logger.info("Cleaning up resources...")
        
        # Shutdown Neo4j agent orchestration
        orchestration_shutdown = await shutdown_orchestration()
        if orchestration_shutdown:
            logger.info("✅ Neo4j agent orchestration shut down")
        else:
            logger.warning("⚠️ Failed to shut down Neo4j agent orchestration")
        
        await database_service.cleanup()
        await supabase_service.cleanup()
        await storage_service.cleanup()
        logger.info("✅ Cleanup completed")
    except Exception as e:
        logger.error(f"Shutdown error: {e}")

# Create FastAPI app
app = FastAPI(
    title="BuffrSign API",
    description="Digital Signature Platform with AI-Powered Document Processing - ETA 2019 Compliant",
    version="1.2.0",
    docs_url="/docs" if APP_ENV == "development" else None,
    redoc_url="/redoc" if APP_ENV == "development" else None,
    lifespan=lifespan
)

# Add security middleware first
app.add_middleware(SecurityMiddleware)

# Add rate limiting middleware
app.add_middleware(RateLimitMiddleware, 
                  redis_url=REDIS_URL,
                  max_requests=RATE_LIMIT_REQUESTS,
                  window_seconds=RATE_LIMIT_WINDOW)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add trusted host middleware in production
if APP_ENV == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=ALLOWED_HOSTS
    )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint with service status."""
    try:
        # Check all service health
        db_health = await database_service.health_check()
        supabase_health = await supabase_service.health_check()
        storage_health = await storage_service.health_check()
        
        overall_health = all([db_health, supabase_health, storage_health])
        
        # Check Neo4j agent orchestration health
        orchestration_status = get_orchestration_status()
        orchestration_health = orchestration_status.get("status") == "ready"
        
        overall_health = all([db_health, supabase_health, storage_health, orchestration_health])
        
        return {
            "status": "healthy" if overall_health else "degraded",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.2.0",
            "environment": APP_ENV,
            "services": {
                "database": "healthy" if db_health else "unhealthy",
                "supabase": "healthy" if supabase_health else "unhealthy",
                "storage": "healthy" if storage_health else "unhealthy",
                "neo4j_agent": "healthy" if orchestration_health else "unhealthy"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.2.0",
            "environment": APP_ENV,
            "error": str(e)
        }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "BuffrSign API - Digital Signature Platform",
        "version": "1.2.0",
        "environment": APP_ENV,
        "compliance": "ETA 2019 Compliant",
        "features": [
            "AI-Powered Document Analysis",
            "Electronic Signatures",
            "Audit Trails",
            "Compliance Reporting",
            "Multi-Factor Authentication"
        ],
        "docs": "/docs" if APP_ENV == "development" else None,
        "timestamp": datetime.utcnow().isoformat()
    }

# Authentication endpoint
@app.post("/api/v1/auth/login")
async def login(credentials: Dict[str, str]):
    """Login endpoint that returns JWT token"""
    try:
        email = credentials.get("email")
        password = credentials.get("password")
        
        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required"
            )
        
        # Authenticate with Supabase
        user = await supabase_service.authenticate_user(email, password)
        
        if user:
            # Create JWT token
            token_data = {
                "sub": user["id"],
                "email": user["email"],
                "role": user.get("role", "individual"),
                "plan": user.get("plan", "free")
            }
            
            access_token = create_access_token(token_data)
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "role": user.get("role", "individual"),
                    "plan": user.get("plan", "free"),
                    "first_name": user.get("first_name"),
                    "last_name": user.get("last_name"),
                    "company": user.get("company")
                }
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )

@app.post("/api/v1/auth/register")
async def register(user_data: Dict[str, str]):
    """Register new user endpoint"""
    try:
        email = user_data.get("email")
        password = user_data.get("password")
        first_name = user_data.get("first_name")
        last_name = user_data.get("last_name")
        company = user_data.get("company")
        
        if not all([email, password, first_name, last_name]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email, password, first_name, and last_name are required"
            )
        
        # Register user with Supabase
        user = await supabase_service.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            company=company
        )
        
        if user:
            # Create JWT token
            token_data = {
                "sub": user["id"],
                "email": user["email"],
                "role": user.get("role", "individual"),
                "plan": user.get("plan", "free")
            }
            
            access_token = create_access_token(token_data)
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "role": user.get("role", "individual"),
                    "plan": user.get("plan", "free"),
                    "first_name": user.get("first_name"),
                    "last_name": user.get("last_name"),
                    "company": user.get("company")
                }
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User registration failed"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

# Protected endpoint example
@app.get("/api/v1/me")
async def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user information"""
    try:
        # Get full user profile from database
        user_profile = await database_service.get_user_profile(current_user.get("user_id"))
        
        return {
            "user_id": current_user.get("user_id"),
            "email": current_user.get("email"),
            "role": current_user.get("role"),
            "plan": current_user.get("plan"),
            "profile": user_profile
        }
    except Exception as e:
        logger.error(f"Error getting user info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user information"
        )

# Include routers
app.include_router(document_router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(signature_router, prefix="/api/v1/signatures", tags=["signatures"])
app.include_router(workflow_router, prefix="/api/v1/workflows", tags=["workflows"])
app.include_router(ai_router, tags=["ai"])

# CLI integration endpoint
@app.post("/api/v1/cli/execute")
async def cli_execute(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Execute CLI commands via API."""
    try:
        command = request.get("command")
        if not command:
            raise HTTPException(status_code=400, detail="Command is required")
        
        # Execute CLI command
        result = await database_service.execute_cli_command(command, current_user.get("user_id"))
        
        return {
            "success": True,
            "command": command,
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"CLI execution error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=APP_HOST,
        port=APP_PORT,
        reload=APP_ENV == "development",
        log_level=LOG_LEVEL.lower()
    )
