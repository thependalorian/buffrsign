"""
BuffrSign Admin Service - Microservice
Handles administrative functions, user management, and system configuration
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
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON, create_engine, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
import jwt
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/buffrsign_admin")
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
SERVICE_NAME = "admin-service"
SERVICE_VERSION = "1.0.0"
SERVICE_PORT = int(os.getenv("SERVICE_PORT", 8006))

# Enums
class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"

class SystemStatus(str, Enum):
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    MAINTENANCE = "maintenance"

# Database Models
class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(String, default=UserRole.ADMIN)
    status = Column(String, default=UserStatus.ACTIVE)
    permissions = Column(JSON, default=list)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SystemConfiguration(Base):
    __tablename__ = "system_configurations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(JSON, nullable=False)
    description = Column(Text)
    category = Column(String, default="general")
    is_encrypted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False, index=True)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=False)
    details = Column(JSON)
    ip_address = Column(String)
    user_agent = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

class SupportTicket(Base):
    __tablename__ = "support_tickets"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, default="medium")
    status = Column(String, default="open")
    assigned_to = Column(String)
    resolution = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SystemMetrics(Base):
    __tablename__ = "system_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    metric_name = Column(String, nullable=False, index=True)
    metric_value = Column(String, nullable=False)
    metric_type = Column(String, default="gauge")
    tags = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
class AdminUserCreate(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    role: UserRole = UserRole.ADMIN
    permissions: List[str] = []

class AdminUserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    permissions: Optional[List[str]] = None

class AdminUserResponse(BaseModel):
    id: str
    email: str
    username: str
    first_name: str
    last_name: str
    role: str
    status: str
    permissions: List[str]
    last_login: Optional[datetime]
    created_at: datetime

class SystemConfigCreate(BaseModel):
    key: str
    value: Any
    description: Optional[str] = None
    category: str = "general"
    is_encrypted: bool = False

class SystemConfigUpdate(BaseModel):
    value: Optional[Any] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_encrypted: Optional[bool] = None

class SupportTicketCreate(BaseModel):
    user_id: str
    subject: str
    description: str
    priority: str = "medium"

class SupportTicketUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None

class SystemMetricsResponse(BaseModel):
    total_users: int
    active_sessions: int
    documents_processed: int
    signatures_completed: int
    system_status: SystemStatus
    uptime: str
    last_backup: Optional[datetime]

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
        logger.info("✅ Redis connected for admin service")
    except Exception as e:
        logger.warning(f"⚠️ Redis not available: {e}")
        redis_client = None

# Authentication dependency
async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> dict:
    """Get current admin user from JWT token"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
        admin_user = db.query(AdminUser).filter(AdminUser.id == user_id).first()
        if not admin_user or admin_user.status != UserStatus.ACTIVE:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin user not found or inactive")
        
        return {
            "user_id": admin_user.id,
            "email": admin_user.email,
            "role": admin_user.role,
            "permissions": admin_user.permissions
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Permission check
def require_permission(permission: str):
    def permission_checker(current_admin: dict = Depends(get_current_admin)):
        if permission not in current_admin.get("permissions", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' required"
            )
        return current_admin
    return permission_checker

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
    description="Administrative functions and system management microservice",
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
        "description": "Administrative functions and system management",
        "endpoints": {
            "health": "/health",
            "admin_users": "/api/admin/users",
            "system_config": "/api/admin/config",
            "audit_logs": "/api/admin/audit",
            "support_tickets": "/api/admin/support",
            "system_metrics": "/api/admin/metrics"
        }
    }

# Admin User Management
@app.get("/api/admin/users", response_model=List[AdminUserResponse])
async def get_admin_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[UserRole] = None,
    status: Optional[UserStatus] = None,
    current_admin: dict = Depends(require_permission("admin.users.read")),
    db: Session = Depends(get_db)
):
    """Get all admin users with filtering"""
    query = db.query(AdminUser)
    
    if role:
        query = query.filter(AdminUser.role == role)
    if status:
        query = query.filter(AdminUser.status == status)
    
    users = query.offset(skip).limit(limit).all()
    
    return [
        AdminUserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            status=user.status,
            permissions=user.permissions,
            last_login=user.last_login,
            created_at=user.created_at
        )
        for user in users
    ]

@app.post("/api/admin/users", response_model=AdminUserResponse)
async def create_admin_user(
    user_data: AdminUserCreate,
    current_admin: dict = Depends(require_permission("admin.users.create")),
    db: Session = Depends(get_db)
):
    """Create a new admin user"""
    # Check if email already exists
    existing_user = db.query(AdminUser).filter(AdminUser.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = db.query(AdminUser).filter(AdminUser.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    new_user = AdminUser(
        email=user_data.email,
        username=user_data.username,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        role=user_data.role,
        permissions=user_data.permissions
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log admin action
    audit_log = AuditLog(
        user_id=current_admin["user_id"],
        action="create_admin_user",
        resource_type="admin_user",
        resource_id=new_user.id,
        details={"email": new_user.email, "role": new_user.role}
    )
    db.add(audit_log)
    db.commit()
    
    logger.info(f"✅ Admin user created: {new_user.email}")
    
    return AdminUserResponse(
        id=new_user.id,
        email=new_user.email,
        username=new_user.username,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        role=new_user.role,
        status=new_user.status,
        permissions=new_user.permissions,
        last_login=new_user.last_login,
        created_at=new_user.created_at
    )

@app.put("/api/admin/users/{user_id}", response_model=AdminUserResponse)
async def update_admin_user(
    user_id: str,
    user_data: AdminUserUpdate,
    current_admin: dict = Depends(require_permission("admin.users.update")),
    db: Session = Depends(get_db)
):
    """Update an admin user"""
    user = db.query(AdminUser).filter(AdminUser.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found"
        )
    
    # Update fields
    if user_data.first_name is not None:
        user.first_name = user_data.first_name
    if user_data.last_name is not None:
        user.last_name = user_data.last_name
    if user_data.role is not None:
        user.role = user_data.role
    if user_data.status is not None:
        user.status = user_data.status
    if user_data.permissions is not None:
        user.permissions = user_data.permissions
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    # Log admin action
    audit_log = AuditLog(
        user_id=current_admin["user_id"],
        action="update_admin_user",
        resource_type="admin_user",
        resource_id=user.id,
        details={"changes": user_data.dict(exclude_unset=True)}
    )
    db.add(audit_log)
    db.commit()
    
    logger.info(f"✅ Admin user updated: {user.email}")
    
    return AdminUserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        status=user.status,
        permissions=user.permissions,
        last_login=user.last_login,
        created_at=user.created_at
    )

# System Configuration Management
@app.get("/api/admin/config")
async def get_system_config(
    category: Optional[str] = None,
    current_admin: dict = Depends(require_permission("admin.config.read")),
    db: Session = Depends(get_db)
):
    """Get system configuration"""
    query = db.query(SystemConfiguration)
    
    if category:
        query = query.filter(SystemConfiguration.category == category)
    
    configs = query.all()
    
    return {
        "configurations": [
            {
                "id": config.id,
                "key": config.key,
                "value": config.value,
                "description": config.description,
                "category": config.category,
                "is_encrypted": config.is_encrypted,
                "updated_at": config.updated_at
            }
            for config in configs
        ]
    }

@app.post("/api/admin/config")
async def create_system_config(
    config_data: SystemConfigCreate,
    current_admin: dict = Depends(require_permission("admin.config.create")),
    db: Session = Depends(get_db)
):
    """Create or update system configuration"""
    existing_config = db.query(SystemConfiguration).filter(
        SystemConfiguration.key == config_data.key
    ).first()
    
    if existing_config:
        # Update existing configuration
        existing_config.value = config_data.value
        existing_config.description = config_data.description
        existing_config.category = config_data.category
        existing_config.is_encrypted = config_data.is_encrypted
        existing_config.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_config)
        config = existing_config
    else:
        # Create new configuration
        new_config = SystemConfiguration(
            key=config_data.key,
            value=config_data.value,
            description=config_data.description,
            category=config_data.category,
            is_encrypted=config_data.is_encrypted
        )
        db.add(new_config)
        db.commit()
        db.refresh(new_config)
        config = new_config
    
    # Log admin action
    audit_log = AuditLog(
        user_id=current_admin["user_id"],
        action="update_system_config",
        resource_type="system_config",
        resource_id=config.id,
        details={"key": config.key, "category": config.category}
    )
    db.add(audit_log)
    db.commit()
    
    logger.info(f"✅ System configuration updated: {config.key}")
    
    return {
        "id": config.id,
        "key": config.key,
        "value": config.value,
        "description": config.description,
        "category": config.category,
        "is_encrypted": config.is_encrypted,
        "updated_at": config.updated_at
    }

# Audit Logs
@app.get("/api/admin/audit")
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    current_admin: dict = Depends(require_permission("admin.audit.read")),
    db: Session = Depends(get_db)
):
    """Get audit logs with filtering"""
    query = db.query(AuditLog)
    
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if action:
        query = query.filter(AuditLog.action == action)
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    
    logs = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    
    return {
        "audit_logs": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "details": log.details,
                "ip_address": log.ip_address,
                "user_agent": log.user_agent,
                "timestamp": log.timestamp
            }
            for log in logs
        ]
    }

# Support Tickets
@app.get("/api/admin/support")
async def get_support_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    current_admin: dict = Depends(require_permission("admin.support.read")),
    db: Session = Depends(get_db)
):
    """Get support tickets with filtering"""
    query = db.query(SupportTicket)
    
    if status:
        query = query.filter(SupportTicket.status == status)
    if priority:
        query = query.filter(SupportTicket.priority == priority)
    
    tickets = query.order_by(SupportTicket.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "support_tickets": [
            {
                "id": ticket.id,
                "user_id": ticket.user_id,
                "subject": ticket.subject,
                "description": ticket.description,
                "priority": ticket.priority,
                "status": ticket.status,
                "assigned_to": ticket.assigned_to,
                "resolution": ticket.resolution,
                "created_at": ticket.created_at,
                "updated_at": ticket.updated_at
            }
            for ticket in tickets
        ]
    }

@app.post("/api/admin/support")
async def create_support_ticket(
    ticket_data: SupportTicketCreate,
    current_admin: dict = Depends(require_permission("admin.support.create")),
    db: Session = Depends(get_db)
):
    """Create a new support ticket"""
    new_ticket = SupportTicket(
        user_id=ticket_data.user_id,
        subject=ticket_data.subject,
        description=ticket_data.description,
        priority=ticket_data.priority
    )
    
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    
    logger.info(f"✅ Support ticket created: {new_ticket.id}")
    
    return {
        "id": new_ticket.id,
        "user_id": new_ticket.user_id,
        "subject": new_ticket.subject,
        "description": new_ticket.description,
        "priority": new_ticket.priority,
        "status": new_ticket.status,
        "created_at": new_ticket.created_at
    }

# System Metrics
@app.get("/api/admin/metrics", response_model=SystemMetricsResponse)
async def get_system_metrics(
    current_admin: dict = Depends(require_permission("admin.metrics.read")),
    db: Session = Depends(get_db)
):
    """Get system metrics and health status"""
    # Get basic metrics from database
    total_users = db.query(AdminUser).count()
    
    # Get recent metrics
    recent_metrics = db.query(SystemMetrics).filter(
        SystemMetrics.timestamp >= datetime.utcnow() - timedelta(hours=1)
    ).all()
    
    # Calculate system status
    system_status = SystemStatus.HEALTHY
    if recent_metrics:
        error_metrics = [m for m in recent_metrics if "error" in m.metric_name.lower()]
        if len(error_metrics) > 10:
            system_status = SystemStatus.CRITICAL
        elif len(error_metrics) > 5:
            system_status = SystemStatus.WARNING
    
    return SystemMetricsResponse(
        total_users=total_users,
        active_sessions=len(recent_metrics) if recent_metrics else 0,
        documents_processed=0,  # Would be fetched from document service
        signatures_completed=0,  # Would be fetched from signature service
        system_status=system_status,
        uptime="99.9%",  # Would be calculated from actual uptime
        last_backup=datetime.utcnow() - timedelta(hours=6)  # Would be fetched from backup service
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=SERVICE_PORT,
        reload=True
    )