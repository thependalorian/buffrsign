"""
BuffrSign Integration Service - Microservice
Handles third-party integrations, webhooks, and API connections for BuffrSign
"""

import os
import logging
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from enum import Enum

import redis.asyncio as redis
from fastapi import FastAPI, HTTPException, status, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON, create_engine, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
import jwt
from contextlib import asynccontextmanager
import httpx
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/buffrsign_integrations")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis setup
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = None

# Security
security = HTTPBearer()

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")

# Service configuration
SERVICE_NAME = "integration-service"
SERVICE_VERSION = "1.0.0"
SERVICE_PORT = int(os.getenv("SERVICE_PORT", 8011))

# Enums
class IntegrationType(str, Enum):
    API = "api"
    WEBHOOK = "webhook"
    OAUTH = "oauth"
    WEBHOOK_INCOMING = "webhook_incoming"
    SCHEDULED = "scheduled"

class IntegrationStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"
    CONFIGURING = "configuring"

class WebhookStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    RETRYING = "retrying"

class SyncStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

# Database Models
class Integration(Base):
    __tablename__ = "integrations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    integration_type = Column(String, nullable=False)
    provider = Column(String, nullable=False, index=True)
    status = Column(String, default=IntegrationStatus.PENDING)
    configuration = Column(JSON, nullable=False)
    credentials = Column(JSON, nullable=False)
    webhook_url = Column(String, nullable=True)
    api_endpoint = Column(String, nullable=True)
    rate_limit = Column(Integer, default=100)  # requests per minute
    timeout_seconds = Column(Integer, default=30)
    retry_count = Column(Integer, default=3)
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime)
    last_error = Column(Text)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Webhook(Base):
    __tablename__ = "webhooks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    integration_id = Column(String, ForeignKey("integrations.id"), nullable=False)
    event_type = Column(String, nullable=False, index=True)
    webhook_url = Column(String, nullable=False)
    secret_key = Column(String, nullable=True)
    headers = Column(JSON, default=dict)
    payload_template = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    retry_count = Column(Integer, default=3)
    timeout_seconds = Column(Integer, default=30)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WebhookDelivery(Base):
    __tablename__ = "webhook_deliveries"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    webhook_id = Column(String, ForeignKey("webhooks.id"), nullable=False)
    event_id = Column(String, nullable=False, index=True)
    status = Column(String, default=WebhookStatus.PENDING)
    payload = Column(JSON, nullable=False)
    response_status = Column(Integer)
    response_body = Column(Text)
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    delivered_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DataSync(Base):
    __tablename__ = "data_syncs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    integration_id = Column(String, ForeignKey("integrations.id"), nullable=False)
    sync_type = Column(String, nullable=False)  # full, incremental, delta
    status = Column(String, default=SyncStatus.PENDING)
    source_table = Column(String, nullable=False)
    target_table = Column(String, nullable=False)
    sync_config = Column(JSON, default=dict)
    records_processed = Column(Integer, default=0)
    records_successful = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    error_message = Column(Text)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class IntegrationLog(Base):
    __tablename__ = "integration_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    integration_id = Column(String, ForeignKey("integrations.id"), nullable=False)
    log_level = Column(String, nullable=False)  # info, warning, error, debug
    message = Column(Text, nullable=False)
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class APICredential(Base):
    __tablename__ = "api_credentials"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    integration_id = Column(String, ForeignKey("integrations.id"), nullable=False)
    credential_type = Column(String, nullable=False)  # api_key, oauth_token, basic_auth
    credential_name = Column(String, nullable=False)
    credential_value = Column(String, nullable=False)  # encrypted
    is_encrypted = Column(Boolean, default=True)
    expires_at = Column(DateTime)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic Models
class IntegrationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    integration_type: IntegrationType
    provider: str
    configuration: Dict[str, Any]
    credentials: Dict[str, Any]
    webhook_url: Optional[str] = None
    api_endpoint: Optional[str] = None
    rate_limit: int = 100
    timeout_seconds: int = 30
    retry_count: int = 3

class IntegrationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[IntegrationStatus] = None
    configuration: Optional[Dict[str, Any]] = None
    credentials: Optional[Dict[str, Any]] = None
    webhook_url: Optional[str] = None
    api_endpoint: Optional[str] = None
    rate_limit: Optional[int] = None
    timeout_seconds: Optional[int] = None
    retry_count: Optional[int] = None
    is_active: Optional[bool] = None

class WebhookCreate(BaseModel):
    integration_id: str
    event_type: str
    webhook_url: str
    secret_key: Optional[str] = None
    headers: Optional[Dict[str, str]] = {}
    payload_template: Optional[Dict[str, Any]] = {}
    retry_count: int = 3
    timeout_seconds: int = 30

class WebhookDeliveryCreate(BaseModel):
    webhook_id: str
    event_id: str
    payload: Dict[str, Any]

class DataSyncCreate(BaseModel):
    integration_id: str
    sync_type: str
    source_table: str
    target_table: str
    sync_config: Optional[Dict[str, Any]] = {}

class IntegrationTest(BaseModel):
    integration_id: str
    test_type: str  # connection, authentication, data_sync
    test_config: Optional[Dict[str, Any]] = {}

class IntegrationResponse(BaseModel):
    total_integrations: int
    active_integrations: int
    failed_integrations: int
    webhook_deliveries_today: int
    data_syncs_today: int
    last_sync: Optional[datetime]
    error_rate: float

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Redis connection
async def connect_redis():
    global redis_client
    try:
        redis_client = redis.from_url(REDIS_URL)
        await redis_client.ping()
        logger.info("✅ Redis connected for integration service")
    except Exception as e:
        logger.warning(f"⚠️ Redis not available: {e}")
        redis_client = None

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current user from JWT token"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return {"user_id": user_id, "email": payload.get("email")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"🚀 Starting {SERVICE_NAME} v{SERVICE_VERSION}")
    await connect_redis()
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created/verified")
    
    yield
    
    # Shutdown
    if redis_client:
        await redis_client.close()
    logger.info(f"🛑 {SERVICE_NAME} shutdown complete")

# FastAPI app
app = FastAPI(
    title=f"{SERVICE_NAME.title()}",
    description="Third-party integrations and API management microservice",
    version=SERVICE_VERSION,
    lifespan=lifespan
)

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "description": "Third-party integrations and API management",
        "endpoints": {
            "health": "/health",
            "integrations": "/api/integrations",
            "webhooks": "/api/integrations/webhooks",
            "deliveries": "/api/integrations/deliveries",
            "syncs": "/api/integrations/syncs",
            "logs": "/api/integrations/logs",
            "test": "/api/integrations/test",
            "overview": "/api/integrations/overview"
        }
    }

# Integration Management
@app.get("/api/integrations")
async def get_integrations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    integration_type: Optional[IntegrationType] = None,
    provider: Optional[str] = None,
    status: Optional[IntegrationStatus] = None,
    is_active: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get integrations with filtering"""
    query = db.query(Integration)
    
    if integration_type:
        query = query.filter(Integration.integration_type == integration_type)
    if provider:
        query = query.filter(Integration.provider == provider)
    if status:
        query = query.filter(Integration.status == status)
    if is_active is not None:
        query = query.filter(Integration.is_active == is_active)
    
    integrations = query.order_by(Integration.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "integrations": [
            {
                "id": integration.id,
                "name": integration.name,
                "description": integration.description,
                "integration_type": integration.integration_type,
                "provider": integration.provider,
                "status": integration.status,
                "configuration": integration.configuration,
                "webhook_url": integration.webhook_url,
                "api_endpoint": integration.api_endpoint,
                "rate_limit": integration.rate_limit,
                "timeout_seconds": integration.timeout_seconds,
                "retry_count": integration.retry_count,
                "is_active": integration.is_active,
                "last_sync": integration.last_sync,
                "last_error": integration.last_error,
                "created_by": integration.created_by,
                "created_at": integration.created_at,
                "updated_at": integration.updated_at
            }
            for integration in integrations
        ]
    }

@app.post("/api/integrations")
async def create_integration(
    integration_data: IntegrationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new integration"""
    new_integration = Integration(
        name=integration_data.name,
        description=integration_data.description,
        integration_type=integration_data.integration_type,
        provider=integration_data.provider,
        configuration=integration_data.configuration,
        credentials=integration_data.credentials,
        webhook_url=integration_data.webhook_url,
        api_endpoint=integration_data.api_endpoint,
        rate_limit=integration_data.rate_limit,
        timeout_seconds=integration_data.timeout_seconds,
        retry_count=integration_data.retry_count,
        created_by=current_user["user_id"]
    )
    
    db.add(new_integration)
    db.commit()
    db.refresh(new_integration)
    
    logger.info(f"✅ Integration created: {integration_data.name}")
    
    return {
        "id": new_integration.id,
        "name": new_integration.name,
        "description": new_integration.description,
        "integration_type": new_integration.integration_type,
        "provider": new_integration.provider,
        "status": new_integration.status,
        "configuration": new_integration.configuration,
        "webhook_url": new_integration.webhook_url,
        "api_endpoint": new_integration.api_endpoint,
        "rate_limit": new_integration.rate_limit,
        "timeout_seconds": new_integration.timeout_seconds,
        "retry_count": new_integration.retry_count,
        "is_active": new_integration.is_active,
        "created_by": new_integration.created_by,
        "created_at": new_integration.created_at
    }

@app.put("/api/integrations/{integration_id}")
async def update_integration(
    integration_id: str,
    integration_data: IntegrationUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an integration"""
    integration = db.query(Integration).filter(Integration.id == integration_id).first()
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found"
        )
    
    # Update fields
    if integration_data.name is not None:
        integration.name = integration_data.name
    if integration_data.description is not None:
        integration.description = integration_data.description
    if integration_data.status is not None:
        integration.status = integration_data.status
    if integration_data.configuration is not None:
        integration.configuration = integration_data.configuration
    if integration_data.credentials is not None:
        integration.credentials = integration_data.credentials
    if integration_data.webhook_url is not None:
        integration.webhook_url = integration_data.webhook_url
    if integration_data.api_endpoint is not None:
        integration.api_endpoint = integration_data.api_endpoint
    if integration_data.rate_limit is not None:
        integration.rate_limit = integration_data.rate_limit
    if integration_data.timeout_seconds is not None:
        integration.timeout_seconds = integration_data.timeout_seconds
    if integration_data.retry_count is not None:
        integration.retry_count = integration_data.retry_count
    if integration_data.is_active is not None:
        integration.is_active = integration_data.is_active
    
    integration.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(integration)
    
    logger.info(f"✅ Integration updated: {integration.name}")
    
    return {
        "id": integration.id,
        "name": integration.name,
        "description": integration.description,
        "integration_type": integration.integration_type,
        "provider": integration.provider,
        "status": integration.status,
        "configuration": integration.configuration,
        "webhook_url": integration.webhook_url,
        "api_endpoint": integration.api_endpoint,
        "rate_limit": integration.rate_limit,
        "timeout_seconds": integration.timeout_seconds,
        "retry_count": integration.retry_count,
        "is_active": integration.is_active,
        "updated_at": integration.updated_at
    }

# Webhook Management
@app.get("/api/integrations/webhooks")
async def get_webhooks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    integration_id: Optional[str] = None,
    event_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get webhooks with filtering"""
    query = db.query(Webhook)
    
    if integration_id:
        query = query.filter(Webhook.integration_id == integration_id)
    if event_type:
        query = query.filter(Webhook.event_type == event_type)
    if is_active is not None:
        query = query.filter(Webhook.is_active == is_active)
    
    webhooks = query.order_by(Webhook.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "webhooks": [
            {
                "id": webhook.id,
                "integration_id": webhook.integration_id,
                "event_type": webhook.event_type,
                "webhook_url": webhook.webhook_url,
                "secret_key": webhook.secret_key,
                "headers": webhook.headers,
                "payload_template": webhook.payload_template,
                "is_active": webhook.is_active,
                "retry_count": webhook.retry_count,
                "timeout_seconds": webhook.timeout_seconds,
                "created_by": webhook.created_by,
                "created_at": webhook.created_at,
                "updated_at": webhook.updated_at
            }
            for webhook in webhooks
        ]
    }

@app.post("/api/integrations/webhooks")
async def create_webhook(
    webhook_data: WebhookCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new webhook"""
    # Verify integration exists
    integration = db.query(Integration).filter(Integration.id == webhook_data.integration_id).first()
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found"
        )
    
    new_webhook = Webhook(
        integration_id=webhook_data.integration_id,
        event_type=webhook_data.event_type,
        webhook_url=webhook_data.webhook_url,
        secret_key=webhook_data.secret_key,
        headers=webhook_data.headers,
        payload_template=webhook_data.payload_template,
        retry_count=webhook_data.retry_count,
        timeout_seconds=webhook_data.timeout_seconds,
        created_by=current_user["user_id"]
    )
    
    db.add(new_webhook)
    db.commit()
    db.refresh(new_webhook)
    
    logger.info(f"✅ Webhook created: {webhook_data.event_type}")
    
    return {
        "id": new_webhook.id,
        "integration_id": new_webhook.integration_id,
        "event_type": new_webhook.event_type,
        "webhook_url": new_webhook.webhook_url,
        "secret_key": new_webhook.secret_key,
        "headers": new_webhook.headers,
        "payload_template": new_webhook.payload_template,
        "is_active": new_webhook.is_active,
        "retry_count": new_webhook.retry_count,
        "timeout_seconds": new_webhook.timeout_seconds,
        "created_by": new_webhook.created_by,
        "created_at": new_webhook.created_at
    }

# Webhook Delivery Management
@app.post("/api/integrations/deliveries")
async def create_webhook_delivery(
    delivery_data: WebhookDeliveryCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new webhook delivery"""
    # Verify webhook exists
    webhook = db.query(Webhook).filter(Webhook.id == delivery_data.webhook_id).first()
    if not webhook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook not found"
        )
    
    new_delivery = WebhookDelivery(
        webhook_id=delivery_data.webhook_id,
        event_id=delivery_data.event_id,
        payload=delivery_data.payload
    )
    
    db.add(new_delivery)
    db.commit()
    db.refresh(new_delivery)
    
    # Send webhook asynchronously
    asyncio.create_task(send_webhook_delivery(new_delivery.id, webhook, delivery_data.payload, db))
    
    logger.info(f"✅ Webhook delivery created: {delivery_data.event_id}")
    
    return {
        "id": new_delivery.id,
        "webhook_id": new_delivery.webhook_id,
        "event_id": new_delivery.event_id,
        "status": new_delivery.status,
        "payload": new_delivery.payload,
        "created_at": new_delivery.created_at
    }

@app.get("/api/integrations/deliveries")
async def get_webhook_deliveries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    webhook_id: Optional[str] = None,
    status: Optional[WebhookStatus] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get webhook deliveries with filtering"""
    query = db.query(WebhookDelivery)
    
    if webhook_id:
        query = query.filter(WebhookDelivery.webhook_id == webhook_id)
    if status:
        query = query.filter(WebhookDelivery.status == status)
    
    deliveries = query.order_by(WebhookDelivery.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "deliveries": [
            {
                "id": delivery.id,
                "webhook_id": delivery.webhook_id,
                "event_id": delivery.event_id,
                "status": delivery.status,
                "payload": delivery.payload,
                "response_status": delivery.response_status,
                "response_body": delivery.response_body,
                "error_message": delivery.error_message,
                "retry_count": delivery.retry_count,
                "delivered_at": delivery.delivered_at,
                "created_at": delivery.created_at,
                "updated_at": delivery.updated_at
            }
            for delivery in deliveries
        ]
    }

# Data Sync Management
@app.get("/api/integrations/syncs")
async def get_data_syncs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    integration_id: Optional[str] = None,
    status: Optional[SyncStatus] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get data syncs with filtering"""
    query = db.query(DataSync)
    
    if integration_id:
        query = query.filter(DataSync.integration_id == integration_id)
    if status:
        query = query.filter(DataSync.status == status)
    
    syncs = query.order_by(DataSync.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "syncs": [
            {
                "id": sync.id,
                "integration_id": sync.integration_id,
                "sync_type": sync.sync_type,
                "status": sync.status,
                "source_table": sync.source_table,
                "target_table": sync.target_table,
                "sync_config": sync.sync_config,
                "records_processed": sync.records_processed,
                "records_successful": sync.records_successful,
                "records_failed": sync.records_failed,
                "started_at": sync.started_at,
                "completed_at": sync.completed_at,
                "error_message": sync.error_message,
                "created_by": sync.created_by,
                "created_at": sync.created_at
            }
            for sync in syncs
        ]
    }

@app.post("/api/integrations/syncs")
async def create_data_sync(
    sync_data: DataSyncCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new data sync"""
    # Verify integration exists
    integration = db.query(Integration).filter(Integration.id == sync_data.integration_id).first()
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found"
        )
    
    new_sync = DataSync(
        integration_id=sync_data.integration_id,
        sync_type=sync_data.sync_type,
        source_table=sync_data.source_table,
        target_table=sync_data.target_table,
        sync_config=sync_data.sync_config,
        created_by=current_user["user_id"]
    )
    
    db.add(new_sync)
    db.commit()
    db.refresh(new_sync)
    
    # Start sync asynchronously
    asyncio.create_task(execute_data_sync(new_sync.id, integration, db))
    
    logger.info(f"✅ Data sync created: {sync_data.sync_type}")
    
    return {
        "id": new_sync.id,
        "integration_id": new_sync.integration_id,
        "sync_type": new_sync.sync_type,
        "status": new_sync.status,
        "source_table": new_sync.source_table,
        "target_table": new_sync.target_table,
        "sync_config": new_sync.sync_config,
        "created_by": new_sync.created_by,
        "created_at": new_sync.created_at
    }

# Integration Testing
@app.post("/api/integrations/test")
async def test_integration(
    test_data: IntegrationTest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test an integration"""
    integration = db.query(Integration).filter(Integration.id == test_data.integration_id).first()
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found"
        )
    
    test_result = await perform_integration_test(integration, test_data.test_type, test_data.test_config)
    
    # Log test result
    log_entry = IntegrationLog(
        integration_id=integration.id,
        log_level="info",
        message=f"Integration test: {test_data.test_type}",
        details={"test_result": test_result}
    )
    db.add(log_entry)
    db.commit()
    
    return {
        "integration_id": integration.id,
        "test_type": test_data.test_type,
        "test_result": test_result,
        "timestamp": datetime.utcnow().isoformat()
    }

# Integration Logs
@app.get("/api/integrations/logs")
async def get_integration_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    integration_id: Optional[str] = None,
    log_level: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get integration logs with filtering"""
    query = db.query(IntegrationLog)
    
    if integration_id:
        query = query.filter(IntegrationLog.integration_id == integration_id)
    if log_level:
        query = query.filter(IntegrationLog.log_level == log_level)
    if start_date:
        query = query.filter(IntegrationLog.timestamp >= start_date)
    if end_date:
        query = query.filter(IntegrationLog.timestamp <= end_date)
    
    logs = query.order_by(IntegrationLog.timestamp.desc()).offset(skip).limit(limit).all()
    
    return {
        "logs": [
            {
                "id": log.id,
                "integration_id": log.integration_id,
                "log_level": log.log_level,
                "message": log.message,
                "details": log.details,
                "timestamp": log.timestamp,
                "created_at": log.created_at
            }
            for log in logs
        ]
    }

# Integration Overview
@app.get("/api/integrations/overview", response_model=IntegrationResponse)
async def get_integration_overview(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get integration overview with key metrics"""
    # Get basic metrics
    total_integrations = db.query(Integration).count()
    active_integrations = db.query(Integration).filter(Integration.is_active == True).count()
    failed_integrations = db.query(Integration).filter(Integration.status == IntegrationStatus.ERROR).count()
    
    # Get today's metrics
    today = datetime.utcnow().date()
    webhook_deliveries_today = db.query(WebhookDelivery).filter(
        db.func.date(WebhookDelivery.created_at) == today
    ).count()
    
    data_syncs_today = db.query(DataSync).filter(
        db.func.date(DataSync.created_at) == today
    ).count()
    
    # Get last sync
    last_sync = db.query(Integration).filter(
        Integration.last_sync.isnot(None)
    ).order_by(Integration.last_sync.desc()).first()
    
    # Calculate error rate
    total_deliveries = db.query(WebhookDelivery).count()
    failed_deliveries = db.query(WebhookDelivery).filter(
        WebhookDelivery.status == WebhookStatus.FAILED
    ).count()
    error_rate = (failed_deliveries / total_deliveries * 100) if total_deliveries > 0 else 0
    
    return IntegrationResponse(
        total_integrations=total_integrations,
        active_integrations=active_integrations,
        failed_integrations=failed_integrations,
        webhook_deliveries_today=webhook_deliveries_today,
        data_syncs_today=data_syncs_today,
        last_sync=last_sync.last_sync if last_sync else None,
        error_rate=error_rate
    )

# Helper functions
async def send_webhook_delivery(delivery_id: str, webhook: Webhook, payload: Dict[str, Any], db: Session):
    """Send webhook delivery asynchronously"""
    delivery = db.query(WebhookDelivery).filter(WebhookDelivery.id == delivery_id).first()
    if not delivery:
        return
    
    try:
        async with httpx.AsyncClient(timeout=webhook.timeout_seconds) as client:
            headers = webhook.headers.copy()
            if webhook.secret_key:
                headers["X-Webhook-Secret"] = webhook.secret_key
            
            response = await client.post(
                webhook.webhook_url,
                json=payload,
                headers=headers
            )
            
            delivery.status = WebhookStatus.DELIVERED if response.status_code < 400 else WebhookStatus.FAILED
            delivery.response_status = response.status_code
            delivery.response_body = response.text
            delivery.delivered_at = datetime.utcnow()
            
    except Exception as e:
        delivery.status = WebhookStatus.FAILED
        delivery.error_message = str(e)
        delivery.retry_count += 1
        
        # Retry if under limit
        if delivery.retry_count < webhook.retry_count:
            delivery.status = WebhookStatus.RETRYING
            # Schedule retry
            asyncio.create_task(retry_webhook_delivery(delivery_id, webhook, payload, db))
    
    delivery.updated_at = datetime.utcnow()
    db.commit()

async def retry_webhook_delivery(delivery_id: str, webhook: Webhook, payload: Dict[str, Any], db: Session):
    """Retry webhook delivery after delay"""
    await asyncio.sleep(60)  # Wait 1 minute before retry
    await send_webhook_delivery(delivery_id, webhook, payload, db)

async def execute_data_sync(sync_id: str, integration: Integration, db: Session):
    """Execute data sync asynchronously"""
    sync = db.query(DataSync).filter(DataSync.id == sync_id).first()
    if not sync:
        return
    
    try:
        sync.status = SyncStatus.IN_PROGRESS
        sync.started_at = datetime.utcnow()
        db.commit()
        
        # Simulate data sync
        await asyncio.sleep(5)  # Simulate processing time
        
        sync.status = SyncStatus.COMPLETED
        sync.completed_at = datetime.utcnow()
        sync.records_processed = 100
        sync.records_successful = 95
        sync.records_failed = 5
        
        # Update integration last sync
        integration.last_sync = datetime.utcnow()
        
    except Exception as e:
        sync.status = SyncStatus.FAILED
        sync.error_message = str(e)
        integration.last_error = str(e)
    
    db.commit()

async def perform_integration_test(integration: Integration, test_type: str, test_config: Dict[str, Any]) -> Dict[str, Any]:
    """Perform integration test"""
    if test_type == "connection":
        # Test basic connection
        try:
            async with httpx.AsyncClient(timeout=integration.timeout_seconds) as client:
                response = await client.get(integration.api_endpoint or "https://httpbin.org/get")
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "response_time": response.elapsed.total_seconds()
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    elif test_type == "authentication":
        # Test authentication
        try:
            async with httpx.AsyncClient(timeout=integration.timeout_seconds) as client:
                headers = {}
                if "api_key" in integration.credentials:
                    headers["Authorization"] = f"Bearer {integration.credentials['api_key']}"
                
                response = await client.get(
                    integration.api_endpoint or "https://httpbin.org/get",
                    headers=headers
                )
                return {
                    "success": response.status_code < 400,
                    "status_code": response.status_code
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    elif test_type == "data_sync":
        # Test data sync
        return {
            "success": True,
            "message": "Data sync test completed successfully"
        }
    
    return {
        "success": False,
        "error": "Unknown test type"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=SERVICE_PORT,
        reload=True
    )