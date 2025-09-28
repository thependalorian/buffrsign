"""
BuffrSign Notification Service - Microservice
Handles multi-channel notifications, templates, and delivery tracking for BuffrSign
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
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/buffrsign_notifications")
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
SERVICE_NAME = "notification-service"
SERVICE_VERSION = "1.0.0"
SERVICE_PORT = int(os.getenv("SERVICE_PORT", 8013))

# Enums
class NotificationChannel(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"
    WHATSAPP = "whatsapp"
    WEBHOOK = "webhook"

class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    BOUNCED = "bounced"
    OPENED = "opened"
    CLICKED = "clicked"

class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TemplateType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"

# Database Models
class NotificationTemplate(Base):
    __tablename__ = "notification_templates"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    template_type = Column(String, nullable=False)
    channel = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    html_content = Column(Text, nullable=True)
    variables = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    channel = Column(String, nullable=False)
    template_id = Column(String, ForeignKey("notification_templates.id"), nullable=True)
    subject = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    html_content = Column(Text, nullable=True)
    recipient = Column(String, nullable=False)  # email, phone, etc.
    status = Column(String, default=NotificationStatus.PENDING)
    priority = Column(String, default=NotificationPriority.MEDIUM)
    scheduled_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    opened_at = Column(DateTime, nullable=True)
    clicked_at = Column(DateTime, nullable=True)
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    metadata = Column(JSON, default=dict)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    channel = Column(String, nullable=False)
    is_enabled = Column(Boolean, default=True)
    preferences = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NotificationDelivery(Base):
    __tablename__ = "notification_deliveries"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    notification_id = Column(String, ForeignKey("notifications.id"), nullable=False)
    channel = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    provider_message_id = Column(String, nullable=True)
    status = Column(String, default=NotificationStatus.PENDING)
    response_data = Column(JSON, default=dict)
    error_message = Column(Text)
    delivered_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class NotificationAnalytics(Base):
    __tablename__ = "notification_analytics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    date = Column(DateTime, nullable=False, index=True)
    channel = Column(String, nullable=False, index=True)
    template_id = Column(String, ForeignKey("notification_templates.id"), nullable=True)
    sent_count = Column(Integer, default=0)
    delivered_count = Column(Integer, default=0)
    opened_count = Column(Integer, default=0)
    clicked_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    bounce_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class NotificationWebhook(Base):
    __tablename__ = "notification_webhooks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    events = Column(JSON, default=list)  # List of events to trigger webhook
    secret_key = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    retry_count = Column(Integer, default=3)
    timeout_seconds = Column(Integer, default=30)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic Models
class NotificationTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    template_type: TemplateType
    channel: NotificationChannel
    subject: Optional[str] = None
    content: str
    html_content: Optional[str] = None
    variables: Optional[List[str]] = []

class NotificationTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    content: Optional[str] = None
    html_content: Optional[str] = None
    variables: Optional[List[str]] = None
    is_active: Optional[bool] = None

class NotificationCreate(BaseModel):
    user_id: str
    channel: NotificationChannel
    template_id: Optional[str] = None
    subject: Optional[str] = None
    content: str
    html_content: Optional[str] = None
    recipient: str
    priority: NotificationPriority = NotificationPriority.MEDIUM
    scheduled_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = {}

class NotificationPreferenceCreate(BaseModel):
    user_id: str
    channel: NotificationChannel
    is_enabled: bool = True
    preferences: Optional[Dict[str, Any]] = {}

class NotificationWebhookCreate(BaseModel):
    name: str
    url: str
    events: Optional[List[str]] = []
    secret_key: Optional[str] = None
    retry_count: int = 3
    timeout_seconds: int = 30

class NotificationResponse(BaseModel):
    total_notifications: int
    sent_today: int
    delivered_today: int
    failed_today: int
    open_rate: float
    click_rate: float
    bounce_rate: float
    average_delivery_time: float

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
        logger.info("✅ Redis connected for notification service")
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
    description="Multi-channel notification and delivery management microservice",
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
        "description": "Multi-channel notification and delivery management",
        "endpoints": {
            "health": "/health",
            "templates": "/api/notifications/templates",
            "notifications": "/api/notifications",
            "preferences": "/api/notifications/preferences",
            "webhooks": "/api/notifications/webhooks",
            "analytics": "/api/notifications/analytics",
            "overview": "/api/notifications/overview"
        }
    }

# Template Management
@app.get("/api/notifications/templates")
async def get_notification_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    template_type: Optional[TemplateType] = None,
    channel: Optional[NotificationChannel] = None,
    is_active: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notification templates with filtering"""
    query = db.query(NotificationTemplate)
    
    if template_type:
        query = query.filter(NotificationTemplate.template_type == template_type)
    if channel:
        query = query.filter(NotificationTemplate.channel == channel)
    if is_active is not None:
        query = query.filter(NotificationTemplate.is_active == is_active)
    
    templates = query.order_by(NotificationTemplate.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "templates": [
            {
                "id": template.id,
                "name": template.name,
                "description": template.description,
                "template_type": template.template_type,
                "channel": template.channel,
                "subject": template.subject,
                "content": template.content,
                "html_content": template.html_content,
                "variables": template.variables,
                "is_active": template.is_active,
                "created_by": template.created_by,
                "created_at": template.created_at,
                "updated_at": template.updated_at
            }
            for template in templates
        ]
    }

@app.post("/api/notifications/templates")
async def create_notification_template(
    template_data: NotificationTemplateCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new notification template"""
    new_template = NotificationTemplate(
        name=template_data.name,
        description=template_data.description,
        template_type=template_data.template_type,
        channel=template_data.channel,
        subject=template_data.subject,
        content=template_data.content,
        html_content=template_data.html_content,
        variables=template_data.variables,
        created_by=current_user["user_id"]
    )
    
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    
    logger.info(f"✅ Notification template created: {template_data.name}")
    
    return {
        "id": new_template.id,
        "name": new_template.name,
        "description": new_template.description,
        "template_type": new_template.template_type,
        "channel": new_template.channel,
        "subject": new_template.subject,
        "content": new_template.content,
        "html_content": new_template.html_content,
        "variables": new_template.variables,
        "is_active": new_template.is_active,
        "created_by": new_template.created_by,
        "created_at": new_template.created_at
    }

@app.put("/api/notifications/templates/{template_id}")
async def update_notification_template(
    template_id: str,
    template_data: NotificationTemplateUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a notification template"""
    template = db.query(NotificationTemplate).filter(NotificationTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification template not found"
        )
    
    # Update fields
    if template_data.name is not None:
        template.name = template_data.name
    if template_data.description is not None:
        template.description = template_data.description
    if template_data.subject is not None:
        template.subject = template_data.subject
    if template_data.content is not None:
        template.content = template_data.content
    if template_data.html_content is not None:
        template.html_content = template_data.html_content
    if template_data.variables is not None:
        template.variables = template_data.variables
    if template_data.is_active is not None:
        template.is_active = template_data.is_active
    
    template.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(template)
    
    logger.info(f"✅ Notification template updated: {template.name}")
    
    return {
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "template_type": template.template_type,
        "channel": template.channel,
        "subject": template.subject,
        "content": template.content,
        "html_content": template.html_content,
        "variables": template.variables,
        "is_active": template.is_active,
        "updated_at": template.updated_at
    }

# Notification Management
@app.get("/api/notifications")
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[str] = None,
    channel: Optional[NotificationChannel] = None,
    status: Optional[NotificationStatus] = None,
    priority: Optional[NotificationPriority] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notifications with filtering"""
    query = db.query(Notification)
    
    if user_id:
        query = query.filter(Notification.user_id == user_id)
    if channel:
        query = query.filter(Notification.channel == channel)
    if status:
        query = query.filter(Notification.status == status)
    if priority:
        query = query.filter(Notification.priority == priority)
    
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "notifications": [
            {
                "id": notification.id,
                "user_id": notification.user_id,
                "channel": notification.channel,
                "template_id": notification.template_id,
                "subject": notification.subject,
                "content": notification.content,
                "html_content": notification.html_content,
                "recipient": notification.recipient,
                "status": notification.status,
                "priority": notification.priority,
                "scheduled_at": notification.scheduled_at,
                "sent_at": notification.sent_at,
                "delivered_at": notification.delivered_at,
                "opened_at": notification.opened_at,
                "clicked_at": notification.clicked_at,
                "error_message": notification.error_message,
                "retry_count": notification.retry_count,
                "max_retries": notification.max_retries,
                "metadata": notification.metadata,
                "created_by": notification.created_by,
                "created_at": notification.created_at,
                "updated_at": notification.updated_at
            }
            for notification in notifications
        ]
    }

@app.post("/api/notifications")
async def create_notification(
    notification_data: NotificationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new notification"""
    # Check user preferences
    preference = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == notification_data.user_id,
        NotificationPreference.channel == notification_data.channel
    ).first()
    
    if preference and not preference.is_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User has disabled {notification_data.channel} notifications"
        )
    
    new_notification = Notification(
        user_id=notification_data.user_id,
        channel=notification_data.channel,
        template_id=notification_data.template_id,
        subject=notification_data.subject,
        content=notification_data.content,
        html_content=notification_data.html_content,
        recipient=notification_data.recipient,
        priority=notification_data.priority,
        scheduled_at=notification_data.scheduled_at,
        metadata=notification_data.metadata,
        created_by=current_user["user_id"]
    )
    
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    
    # Send notification asynchronously
    asyncio.create_task(send_notification(new_notification.id, db))
    
    logger.info(f"✅ Notification created: {new_notification.id}")
    
    return {
        "id": new_notification.id,
        "user_id": new_notification.user_id,
        "channel": new_notification.channel,
        "template_id": new_notification.template_id,
        "subject": new_notification.subject,
        "content": new_notification.content,
        "recipient": new_notification.recipient,
        "status": new_notification.status,
        "priority": new_notification.priority,
        "scheduled_at": new_notification.scheduled_at,
        "metadata": new_notification.metadata,
        "created_by": new_notification.created_by,
        "created_at": new_notification.created_at
    }

# Notification Preferences Management
@app.get("/api/notifications/preferences")
async def get_notification_preferences(
    user_id: Optional[str] = None,
    channel: Optional[NotificationChannel] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notification preferences with filtering"""
    query = db.query(NotificationPreference)
    
    if user_id:
        query = query.filter(NotificationPreference.user_id == user_id)
    if channel:
        query = query.filter(NotificationPreference.channel == channel)
    
    preferences = query.all()
    
    return {
        "preferences": [
            {
                "id": preference.id,
                "user_id": preference.user_id,
                "channel": preference.channel,
                "is_enabled": preference.is_enabled,
                "preferences": preference.preferences,
                "created_at": preference.created_at,
                "updated_at": preference.updated_at
            }
            for preference in preferences
        ]
    }

@app.post("/api/notifications/preferences")
async def create_notification_preference(
    preference_data: NotificationPreferenceCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update notification preference"""
    existing_preference = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == preference_data.user_id,
        NotificationPreference.channel == preference_data.channel
    ).first()
    
    if existing_preference:
        # Update existing preference
        existing_preference.is_enabled = preference_data.is_enabled
        existing_preference.preferences = preference_data.preferences
        existing_preference.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_preference)
        preference = existing_preference
    else:
        # Create new preference
        new_preference = NotificationPreference(
            user_id=preference_data.user_id,
            channel=preference_data.channel,
            is_enabled=preference_data.is_enabled,
            preferences=preference_data.preferences
        )
        db.add(new_preference)
        db.commit()
        db.refresh(new_preference)
        preference = new_preference
    
    logger.info(f"✅ Notification preference updated: {preference_data.channel}")
    
    return {
        "id": preference.id,
        "user_id": preference.user_id,
        "channel": preference.channel,
        "is_enabled": preference.is_enabled,
        "preferences": preference.preferences,
        "created_at": preference.created_at,
        "updated_at": preference.updated_at
    }

# Webhook Management
@app.get("/api/notifications/webhooks")
async def get_notification_webhooks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notification webhooks with filtering"""
    query = db.query(NotificationWebhook)
    
    if is_active is not None:
        query = query.filter(NotificationWebhook.is_active == is_active)
    
    webhooks = query.order_by(NotificationWebhook.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "webhooks": [
            {
                "id": webhook.id,
                "name": webhook.name,
                "url": webhook.url,
                "events": webhook.events,
                "secret_key": webhook.secret_key,
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

@app.post("/api/notifications/webhooks")
async def create_notification_webhook(
    webhook_data: NotificationWebhookCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new notification webhook"""
    new_webhook = NotificationWebhook(
        name=webhook_data.name,
        url=webhook_data.url,
        events=webhook_data.events,
        secret_key=webhook_data.secret_key,
        retry_count=webhook_data.retry_count,
        timeout_seconds=webhook_data.timeout_seconds,
        created_by=current_user["user_id"]
    )
    
    db.add(new_webhook)
    db.commit()
    db.refresh(new_webhook)
    
    logger.info(f"✅ Notification webhook created: {webhook_data.name}")
    
    return {
        "id": new_webhook.id,
        "name": new_webhook.name,
        "url": new_webhook.url,
        "events": new_webhook.events,
        "secret_key": new_webhook.secret_key,
        "is_active": new_webhook.is_active,
        "retry_count": new_webhook.retry_count,
        "timeout_seconds": new_webhook.timeout_seconds,
        "created_by": new_webhook.created_by,
        "created_at": new_webhook.created_at
    }

# Analytics Management
@app.get("/api/notifications/analytics")
async def get_notification_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    channel: Optional[NotificationChannel] = None,
    template_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notification analytics with filtering"""
    query = db.query(NotificationAnalytics)
    
    if start_date:
        query = query.filter(NotificationAnalytics.date >= start_date)
    if end_date:
        query = query.filter(NotificationAnalytics.date <= end_date)
    if channel:
        query = query.filter(NotificationAnalytics.channel == channel)
    if template_id:
        query = query.filter(NotificationAnalytics.template_id == template_id)
    
    analytics = query.order_by(NotificationAnalytics.date.desc()).all()
    
    return {
        "analytics": [
            {
                "id": analytic.id,
                "date": analytic.date,
                "channel": analytic.channel,
                "template_id": analytic.template_id,
                "sent_count": analytic.sent_count,
                "delivered_count": analytic.delivered_count,
                "opened_count": analytic.opened_count,
                "clicked_count": analytic.clicked_count,
                "failed_count": analytic.failed_count,
                "bounce_count": analytic.bounce_count,
                "created_at": analytic.created_at
            }
            for analytic in analytics
        ]
    }

# Notification Overview
@app.get("/api/notifications/overview", response_model=NotificationResponse)
async def get_notification_overview(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notification overview with key metrics"""
    # Get basic metrics
    total_notifications = db.query(Notification).count()
    
    # Get today's metrics
    today = datetime.utcnow().date()
    sent_today = db.query(Notification).filter(
        db.func.date(Notification.sent_at) == today
    ).count()
    
    delivered_today = db.query(Notification).filter(
        db.func.date(Notification.delivered_at) == today
    ).count()
    
    failed_today = db.query(Notification).filter(
        Notification.status == NotificationStatus.FAILED,
        db.func.date(Notification.created_at) == today
    ).count()
    
    # Calculate rates
    total_delivered = db.query(Notification).filter(
        Notification.status == NotificationStatus.DELIVERED
    ).count()
    
    total_opened = db.query(Notification).filter(
        Notification.opened_at.isnot(None)
    ).count()
    
    total_clicked = db.query(Notification).filter(
        Notification.clicked_at.isnot(None)
    ).count()
    
    total_bounced = db.query(Notification).filter(
        Notification.status == NotificationStatus.BOUNCED
    ).count()
    
    open_rate = (total_opened / total_delivered * 100) if total_delivered > 0 else 0
    click_rate = (total_clicked / total_delivered * 100) if total_delivered > 0 else 0
    bounce_rate = (total_bounced / total_notifications * 100) if total_notifications > 0 else 0
    
    # Calculate average delivery time (simplified)
    average_delivery_time = 1.5  # minutes
    
    return NotificationResponse(
        total_notifications=total_notifications,
        sent_today=sent_today,
        delivered_today=delivered_today,
        failed_today=failed_today,
        open_rate=open_rate,
        click_rate=click_rate,
        bounce_rate=bounce_rate,
        average_delivery_time=average_delivery_time
    )

# Helper functions
async def send_notification(notification_id: str, db: Session):
    """Send notification asynchronously"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        return
    
    try:
        notification.status = NotificationStatus.SENT
        notification.sent_at = datetime.utcnow()
        db.commit()
        
        # Send based on channel
        if notification.channel == NotificationChannel.EMAIL:
            await send_email_notification(notification, db)
        elif notification.channel == NotificationChannel.SMS:
            await send_sms_notification(notification, db)
        elif notification.channel == NotificationChannel.PUSH:
            await send_push_notification(notification, db)
        elif notification.channel == NotificationChannel.IN_APP:
            await send_in_app_notification(notification, db)
        elif notification.channel == NotificationChannel.WHATSAPP:
            await send_whatsapp_notification(notification, db)
        
        # Update analytics
        await update_notification_analytics(notification, db)
        
        # Trigger webhooks
        await trigger_notification_webhooks(notification, db)
        
    except Exception as e:
        notification.status = NotificationStatus.FAILED
        notification.error_message = str(e)
        notification.retry_count += 1
        
        # Retry if under limit
        if notification.retry_count < notification.max_retries:
            notification.status = NotificationStatus.PENDING
            # Schedule retry
            asyncio.create_task(retry_notification(notification_id, db))
    
    notification.updated_at = datetime.utcnow()
    db.commit()

async def send_email_notification(notification: Notification, db: Session):
    """Send email notification"""
    try:
        # Simulate email sending
        await asyncio.sleep(1)
        
        # Create delivery record
        delivery = NotificationDelivery(
            notification_id=notification.id,
            channel=notification.channel,
            provider="smtp",
            provider_message_id=f"msg_{uuid.uuid4().hex[:16]}",
            status=NotificationStatus.DELIVERED,
            delivered_at=datetime.utcnow()
        )
        db.add(delivery)
        
        notification.status = NotificationStatus.DELIVERED
        notification.delivered_at = datetime.utcnow()
        
    except Exception as e:
        raise e

async def send_sms_notification(notification: Notification, db: Session):
    """Send SMS notification"""
    try:
        # Simulate SMS sending
        await asyncio.sleep(0.5)
        
        # Create delivery record
        delivery = NotificationDelivery(
            notification_id=notification.id,
            channel=notification.channel,
            provider="twilio",
            provider_message_id=f"sms_{uuid.uuid4().hex[:16]}",
            status=NotificationStatus.DELIVERED,
            delivered_at=datetime.utcnow()
        )
        db.add(delivery)
        
        notification.status = NotificationStatus.DELIVERED
        notification.delivered_at = datetime.utcnow()
        
    except Exception as e:
        raise e

async def send_push_notification(notification: Notification, db: Session):
    """Send push notification"""
    try:
        # Simulate push notification sending
        await asyncio.sleep(0.3)
        
        # Create delivery record
        delivery = NotificationDelivery(
            notification_id=notification.id,
            channel=notification.channel,
            provider="fcm",
            provider_message_id=f"push_{uuid.uuid4().hex[:16]}",
            status=NotificationStatus.DELIVERED,
            delivered_at=datetime.utcnow()
        )
        db.add(delivery)
        
        notification.status = NotificationStatus.DELIVERED
        notification.delivered_at = datetime.utcnow()
        
    except Exception as e:
        raise e

async def send_in_app_notification(notification: Notification, db: Session):
    """Send in-app notification"""
    try:
        # Simulate in-app notification
        await asyncio.sleep(0.1)
        
        notification.status = NotificationStatus.DELIVERED
        notification.delivered_at = datetime.utcnow()
        
    except Exception as e:
        raise e

async def send_whatsapp_notification(notification: Notification, db: Session):
    """Send WhatsApp notification"""
    try:
        # Simulate WhatsApp sending
        await asyncio.sleep(1)
        
        # Create delivery record
        delivery = NotificationDelivery(
            notification_id=notification.id,
            channel=notification.channel,
            provider="whatsapp_business",
            provider_message_id=f"wa_{uuid.uuid4().hex[:16]}",
            status=NotificationStatus.DELIVERED,
            delivered_at=datetime.utcnow()
        )
        db.add(delivery)
        
        notification.status = NotificationStatus.DELIVERED
        notification.delivered_at = datetime.utcnow()
        
    except Exception as e:
        raise e

async def update_notification_analytics(notification: Notification, db: Session):
    """Update notification analytics"""
    today = datetime.utcnow().date()
    
    analytic = db.query(NotificationAnalytics).filter(
        NotificationAnalytics.date == today,
        NotificationAnalytics.channel == notification.channel,
        NotificationAnalytics.template_id == notification.template_id
    ).first()
    
    if not analytic:
        analytic = NotificationAnalytics(
            date=today,
            channel=notification.channel,
            template_id=notification.template_id
        )
        db.add(analytic)
    
    if notification.status == NotificationStatus.SENT:
        analytic.sent_count += 1
    elif notification.status == NotificationStatus.DELIVERED:
        analytic.delivered_count += 1
    elif notification.status == NotificationStatus.FAILED:
        analytic.failed_count += 1
    elif notification.status == NotificationStatus.BOUNCED:
        analytic.bounce_count += 1
    
    if notification.opened_at:
        analytic.opened_count += 1
    
    if notification.clicked_at:
        analytic.clicked_count += 1
    
    db.commit()

async def trigger_notification_webhooks(notification: Notification, db: Session):
    """Trigger notification webhooks"""
    webhooks = db.query(NotificationWebhook).filter(
        NotificationWebhook.is_active == True,
        NotificationWebhook.events.contains([notification.status])
    ).all()
    
    for webhook in webhooks:
        asyncio.create_task(send_webhook(webhook, notification, db))

async def send_webhook(webhook: NotificationWebhook, notification: Notification, db: Session):
    """Send webhook notification"""
    try:
        async with httpx.AsyncClient(timeout=webhook.timeout_seconds) as client:
            headers = {"Content-Type": "application/json"}
            if webhook.secret_key:
                headers["X-Webhook-Secret"] = webhook.secret_key
            
            payload = {
                "event": notification.status,
                "notification_id": notification.id,
                "user_id": notification.user_id,
                "channel": notification.channel,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            response = await client.post(webhook.url, json=payload, headers=headers)
            
    except Exception as e:
        logger.error(f"Webhook failed: {e}")

async def retry_notification(notification_id: str, db: Session):
    """Retry notification after delay"""
    await asyncio.sleep(60)  # Wait 1 minute before retry
    await send_notification(notification_id, db)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=SERVICE_PORT,
        reload=True
    )