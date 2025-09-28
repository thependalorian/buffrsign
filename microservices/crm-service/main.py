"""
BuffrSign CRM Service - Microservice
Handles customer relationship management, contacts, and sales pipeline for BuffrSign
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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/buffrsign_crm")
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
SERVICE_NAME = "crm-service"
SERVICE_VERSION = "1.0.0"
SERVICE_PORT = int(os.getenv("SERVICE_PORT", 8010))

# Enums
class ContactType(str, Enum):
    INDIVIDUAL = "individual"
    COMPANY = "company"
    PARTNER = "partner"

class DealStage(str, Enum):
    LEAD = "lead"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class CommunicationType(str, Enum):
    EMAIL = "email"
    PHONE = "phone"
    MEETING = "meeting"
    WHATSAPP = "whatsapp"
    SMS = "sms"

# Database Models
class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True, index=True)
    company = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    contact_type = Column(String, default=ContactType.INDIVIDUAL)
    status = Column(String, default="active")
    source = Column(String, default="website")
    tags = Column(JSON, default=list)
    custom_fields = Column(JSON, default=dict)
    last_contacted = Column(DateTime)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Deal(Base):
    __tablename__ = "deals"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text)
    contact_id = Column(String, ForeignKey("contacts.id"), nullable=False)
    stage = Column(String, default=DealStage.LEAD)
    value = Column(Float, default=0.0)
    probability = Column(Integer, default=0)
    expected_close_date = Column(DateTime)
    actual_close_date = Column(DateTime)
    source = Column(String, default="website")
    tags = Column(JSON, default=list)
    custom_fields = Column(JSON, default=dict)
    assigned_to = Column(String, nullable=False)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)
    contact_id = Column(String, ForeignKey("contacts.id"), nullable=True)
    deal_id = Column(String, ForeignKey("deals.id"), nullable=True)
    assigned_to = Column(String, nullable=False)
    status = Column(String, default=TaskStatus.PENDING)
    priority = Column(String, default=TaskPriority.MEDIUM)
    due_date = Column(DateTime)
    completed_date = Column(DateTime)
    tags = Column(JSON, default=list)
    custom_fields = Column(JSON, default=dict)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Communication(Base):
    __tablename__ = "communications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    contact_id = Column(String, ForeignKey("contacts.id"), nullable=False)
    deal_id = Column(String, ForeignKey("deals.id"), nullable=True)
    communication_type = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    direction = Column(String, default="outbound")  # inbound, outbound
    status = Column(String, default="sent")  # sent, delivered, read, failed
    metadata = Column(JSON, default=dict)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    contact_id = Column(String, ForeignKey("contacts.id"), nullable=True)
    deal_id = Column(String, ForeignKey("deals.id"), nullable=True)
    activity_type = Column(String, nullable=False)  # call, email, meeting, note, task
    title = Column(String, nullable=False)
    description = Column(Text)
    duration_minutes = Column(Integer, default=0)
    outcome = Column(String, nullable=True)
    metadata = Column(JSON, default=dict)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Pipeline(Base):
    __tablename__ = "pipelines"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text)
    stages = Column(JSON, nullable=False)  # Array of stage configurations
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic Models
class ContactCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    contact_type: ContactType = ContactType.INDIVIDUAL
    source: str = "website"
    tags: Optional[List[str]] = []
    custom_fields: Optional[Dict[str, Any]] = {}

class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    contact_type: Optional[ContactType] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None
    custom_fields: Optional[Dict[str, Any]] = None

class DealCreate(BaseModel):
    name: str
    description: Optional[str] = None
    contact_id: str
    stage: DealStage = DealStage.LEAD
    value: float = 0.0
    probability: int = 0
    expected_close_date: Optional[datetime] = None
    source: str = "website"
    tags: Optional[List[str]] = []
    custom_fields: Optional[Dict[str, Any]] = {}

class DealUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    stage: Optional[DealStage] = None
    value: Optional[float] = None
    probability: Optional[int] = None
    expected_close_date: Optional[datetime] = None
    actual_close_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    custom_fields: Optional[Dict[str, Any]] = None

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    contact_id: Optional[str] = None
    deal_id: Optional[str] = None
    assigned_to: str
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = []
    custom_fields: Optional[Dict[str, Any]] = {}

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    custom_fields: Optional[Dict[str, Any]] = None

class CommunicationCreate(BaseModel):
    contact_id: str
    deal_id: Optional[str] = None
    communication_type: CommunicationType
    subject: Optional[str] = None
    content: str
    direction: str = "outbound"
    metadata: Optional[Dict[str, Any]] = {}

class ActivityCreate(BaseModel):
    contact_id: Optional[str] = None
    deal_id: Optional[str] = None
    activity_type: str
    title: str
    description: Optional[str] = None
    duration_minutes: int = 0
    outcome: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}

class CRMResponse(BaseModel):
    total_contacts: int
    total_deals: int
    total_tasks: int
    active_deals: int
    closed_won_deals: int
    pipeline_value: float
    conversion_rate: float
    average_deal_size: float

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
        logger.info("✅ Redis connected for CRM service")
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
    description="Customer relationship management microservice",
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
        "description": "Customer relationship management",
        "endpoints": {
            "health": "/health",
            "contacts": "/api/crm/contacts",
            "deals": "/api/crm/deals",
            "tasks": "/api/crm/tasks",
            "communications": "/api/crm/communications",
            "activities": "/api/crm/activities",
            "pipelines": "/api/crm/pipelines",
            "overview": "/api/crm/overview"
        }
    }

# Contact Management
@app.get("/api/crm/contacts")
async def get_contacts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    contact_type: Optional[ContactType] = None,
    status: Optional[str] = None,
    source: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get contacts with filtering and search"""
    query = db.query(Contact)
    
    if contact_type:
        query = query.filter(Contact.contact_type == contact_type)
    if status:
        query = query.filter(Contact.status == status)
    if source:
        query = query.filter(Contact.source == source)
    if search:
        query = query.filter(
            (Contact.first_name.ilike(f"%{search}%")) |
            (Contact.last_name.ilike(f"%{search}%")) |
            (Contact.email.ilike(f"%{search}%")) |
            (Contact.company.ilike(f"%{search}%"))
        )
    
    contacts = query.order_by(Contact.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "contacts": [
            {
                "id": contact.id,
                "first_name": contact.first_name,
                "last_name": contact.last_name,
                "email": contact.email,
                "phone": contact.phone,
                "company": contact.company,
                "job_title": contact.job_title,
                "contact_type": contact.contact_type,
                "status": contact.status,
                "source": contact.source,
                "tags": contact.tags,
                "custom_fields": contact.custom_fields,
                "last_contacted": contact.last_contacted,
                "created_by": contact.created_by,
                "created_at": contact.created_at,
                "updated_at": contact.updated_at
            }
            for contact in contacts
        ]
    }

@app.post("/api/crm/contacts")
async def create_contact(
    contact_data: ContactCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new contact"""
    # Check if email already exists
    existing_contact = db.query(Contact).filter(Contact.email == contact_data.email).first()
    if existing_contact:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact with this email already exists"
        )
    
    new_contact = Contact(
        first_name=contact_data.first_name,
        last_name=contact_data.last_name,
        email=contact_data.email,
        phone=contact_data.phone,
        company=contact_data.company,
        job_title=contact_data.job_title,
        contact_type=contact_data.contact_type,
        source=contact_data.source,
        tags=contact_data.tags,
        custom_fields=contact_data.custom_fields,
        created_by=current_user["user_id"]
    )
    
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    
    logger.info(f"✅ Contact created: {new_contact.email}")
    
    return {
        "id": new_contact.id,
        "first_name": new_contact.first_name,
        "last_name": new_contact.last_name,
        "email": new_contact.email,
        "phone": new_contact.phone,
        "company": new_contact.company,
        "job_title": new_contact.job_title,
        "contact_type": new_contact.contact_type,
        "status": new_contact.status,
        "source": new_contact.source,
        "tags": new_contact.tags,
        "custom_fields": new_contact.custom_fields,
        "created_by": new_contact.created_by,
        "created_at": new_contact.created_at
    }

@app.put("/api/crm/contacts/{contact_id}")
async def update_contact(
    contact_id: str,
    contact_data: ContactUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a contact"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Update fields
    if contact_data.first_name is not None:
        contact.first_name = contact_data.first_name
    if contact_data.last_name is not None:
        contact.last_name = contact_data.last_name
    if contact_data.phone is not None:
        contact.phone = contact_data.phone
    if contact_data.company is not None:
        contact.company = contact_data.company
    if contact_data.job_title is not None:
        contact.job_title = contact_data.job_title
    if contact_data.contact_type is not None:
        contact.contact_type = contact_data.contact_type
    if contact_data.status is not None:
        contact.status = contact_data.status
    if contact_data.tags is not None:
        contact.tags = contact_data.tags
    if contact_data.custom_fields is not None:
        contact.custom_fields = contact_data.custom_fields
    
    contact.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(contact)
    
    logger.info(f"✅ Contact updated: {contact.email}")
    
    return {
        "id": contact.id,
        "first_name": contact.first_name,
        "last_name": contact.last_name,
        "email": contact.email,
        "phone": contact.phone,
        "company": contact.company,
        "job_title": contact.job_title,
        "contact_type": contact.contact_type,
        "status": contact.status,
        "source": contact.source,
        "tags": contact.tags,
        "custom_fields": contact.custom_fields,
        "last_contacted": contact.last_contacted,
        "updated_at": contact.updated_at
    }

# Deal Management
@app.get("/api/crm/deals")
async def get_deals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    stage: Optional[DealStage] = None,
    assigned_to: Optional[str] = None,
    contact_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get deals with filtering"""
    query = db.query(Deal)
    
    if stage:
        query = query.filter(Deal.stage == stage)
    if assigned_to:
        query = query.filter(Deal.assigned_to == assigned_to)
    if contact_id:
        query = query.filter(Deal.contact_id == contact_id)
    
    deals = query.order_by(Deal.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "deals": [
            {
                "id": deal.id,
                "name": deal.name,
                "description": deal.description,
                "contact_id": deal.contact_id,
                "stage": deal.stage,
                "value": deal.value,
                "probability": deal.probability,
                "expected_close_date": deal.expected_close_date,
                "actual_close_date": deal.actual_close_date,
                "source": deal.source,
                "tags": deal.tags,
                "custom_fields": deal.custom_fields,
                "assigned_to": deal.assigned_to,
                "created_by": deal.created_by,
                "created_at": deal.created_at,
                "updated_at": deal.updated_at
            }
            for deal in deals
        ]
    }

@app.post("/api/crm/deals")
async def create_deal(
    deal_data: DealCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new deal"""
    # Verify contact exists
    contact = db.query(Contact).filter(Contact.id == deal_data.contact_id).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    new_deal = Deal(
        name=deal_data.name,
        description=deal_data.description,
        contact_id=deal_data.contact_id,
        stage=deal_data.stage,
        value=deal_data.value,
        probability=deal_data.probability,
        expected_close_date=deal_data.expected_close_date,
        source=deal_data.source,
        tags=deal_data.tags,
        custom_fields=deal_data.custom_fields,
        assigned_to=current_user["user_id"],
        created_by=current_user["user_id"]
    )
    
    db.add(new_deal)
    db.commit()
    db.refresh(new_deal)
    
    logger.info(f"✅ Deal created: {new_deal.name}")
    
    return {
        "id": new_deal.id,
        "name": new_deal.name,
        "description": new_deal.description,
        "contact_id": new_deal.contact_id,
        "stage": new_deal.stage,
        "value": new_deal.value,
        "probability": new_deal.probability,
        "expected_close_date": new_deal.expected_close_date,
        "source": new_deal.source,
        "tags": new_deal.tags,
        "custom_fields": new_deal.custom_fields,
        "assigned_to": new_deal.assigned_to,
        "created_by": new_deal.created_by,
        "created_at": new_deal.created_at
    }

@app.put("/api/crm/deals/{deal_id}")
async def update_deal(
    deal_id: str,
    deal_data: DealUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a deal"""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    
    # Update fields
    if deal_data.name is not None:
        deal.name = deal_data.name
    if deal_data.description is not None:
        deal.description = deal_data.description
    if deal_data.stage is not None:
        deal.stage = deal_data.stage
    if deal_data.value is not None:
        deal.value = deal_data.value
    if deal_data.probability is not None:
        deal.probability = deal_data.probability
    if deal_data.expected_close_date is not None:
        deal.expected_close_date = deal_data.expected_close_date
    if deal_data.actual_close_date is not None:
        deal.actual_close_date = deal_data.actual_close_date
    if deal_data.tags is not None:
        deal.tags = deal_data.tags
    if deal_data.custom_fields is not None:
        deal.custom_fields = deal_data.custom_fields
    
    deal.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(deal)
    
    logger.info(f"✅ Deal updated: {deal.name}")
    
    return {
        "id": deal.id,
        "name": deal.name,
        "description": deal.description,
        "contact_id": deal.contact_id,
        "stage": deal.stage,
        "value": deal.value,
        "probability": deal.probability,
        "expected_close_date": deal.expected_close_date,
        "actual_close_date": deal.actual_close_date,
        "source": deal.source,
        "tags": deal.tags,
        "custom_fields": deal.custom_fields,
        "assigned_to": deal.assigned_to,
        "updated_at": deal.updated_at
    }

# Task Management
@app.get("/api/crm/tasks")
async def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    assigned_to: Optional[str] = None,
    contact_id: Optional[str] = None,
    deal_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks with filtering"""
    query = db.query(Task)
    
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if assigned_to:
        query = query.filter(Task.assigned_to == assigned_to)
    if contact_id:
        query = query.filter(Task.contact_id == contact_id)
    if deal_id:
        query = query.filter(Task.deal_id == deal_id)
    
    tasks = query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "tasks": [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "contact_id": task.contact_id,
                "deal_id": task.deal_id,
                "assigned_to": task.assigned_to,
                "status": task.status,
                "priority": task.priority,
                "due_date": task.due_date,
                "completed_date": task.completed_date,
                "tags": task.tags,
                "custom_fields": task.custom_fields,
                "created_by": task.created_by,
                "created_at": task.created_at,
                "updated_at": task.updated_at
            }
            for task in tasks
        ]
    }

@app.post("/api/crm/tasks")
async def create_task(
    task_data: TaskCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task"""
    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        contact_id=task_data.contact_id,
        deal_id=task_data.deal_id,
        assigned_to=task_data.assigned_to,
        priority=task_data.priority,
        due_date=task_data.due_date,
        tags=task_data.tags,
        custom_fields=task_data.custom_fields,
        created_by=current_user["user_id"]
    )
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    logger.info(f"✅ Task created: {new_task.title}")
    
    return {
        "id": new_task.id,
        "title": new_task.title,
        "description": new_task.description,
        "contact_id": new_task.contact_id,
        "deal_id": new_task.deal_id,
        "assigned_to": new_task.assigned_to,
        "status": new_task.status,
        "priority": new_task.priority,
        "due_date": new_task.due_date,
        "tags": new_task.tags,
        "custom_fields": new_task.custom_fields,
        "created_by": new_task.created_by,
        "created_at": new_task.created_at
    }

@app.put("/api/crm/tasks/{task_id}")
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update fields
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.status is not None:
        task.status = task_data.status
        if task_data.status == TaskStatus.COMPLETED:
            task.completed_date = datetime.utcnow()
    if task_data.priority is not None:
        task.priority = task_data.priority
    if task_data.due_date is not None:
        task.due_date = task_data.due_date
    if task_data.completed_date is not None:
        task.completed_date = task_data.completed_date
    if task_data.tags is not None:
        task.tags = task_data.tags
    if task_data.custom_fields is not None:
        task.custom_fields = task_data.custom_fields
    
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    
    logger.info(f"✅ Task updated: {task.title}")
    
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "contact_id": task.contact_id,
        "deal_id": task.deal_id,
        "assigned_to": task.assigned_to,
        "status": task.status,
        "priority": task.priority,
        "due_date": task.due_date,
        "completed_date": task.completed_date,
        "tags": task.tags,
        "custom_fields": task.custom_fields,
        "updated_at": task.updated_at
    }

# Communication Management
@app.post("/api/crm/communications")
async def create_communication(
    communication_data: CommunicationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new communication record"""
    new_communication = Communication(
        contact_id=communication_data.contact_id,
        deal_id=communication_data.deal_id,
        communication_type=communication_data.communication_type,
        subject=communication_data.subject,
        content=communication_data.content,
        direction=communication_data.direction,
        metadata=communication_data.metadata,
        created_by=current_user["user_id"]
    )
    
    db.add(new_communication)
    db.commit()
    db.refresh(new_communication)
    
    # Update last contacted for contact
    contact = db.query(Contact).filter(Contact.id == communication_data.contact_id).first()
    if contact:
        contact.last_contacted = datetime.utcnow()
        db.commit()
    
    logger.info(f"✅ Communication created: {communication_data.communication_type}")
    
    return {
        "id": new_communication.id,
        "contact_id": new_communication.contact_id,
        "deal_id": new_communication.deal_id,
        "communication_type": new_communication.communication_type,
        "subject": new_communication.subject,
        "content": new_communication.content,
        "direction": new_communication.direction,
        "status": new_communication.status,
        "metadata": new_communication.metadata,
        "created_by": new_communication.created_by,
        "created_at": new_communication.created_at
    }

# Activity Management
@app.post("/api/crm/activities")
async def create_activity(
    activity_data: ActivityCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new activity record"""
    new_activity = Activity(
        contact_id=activity_data.contact_id,
        deal_id=activity_data.deal_id,
        activity_type=activity_data.activity_type,
        title=activity_data.title,
        description=activity_data.description,
        duration_minutes=activity_data.duration_minutes,
        outcome=activity_data.outcome,
        metadata=activity_data.metadata,
        created_by=current_user["user_id"]
    )
    
    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)
    
    logger.info(f"✅ Activity created: {activity_data.activity_type}")
    
    return {
        "id": new_activity.id,
        "contact_id": new_activity.contact_id,
        "deal_id": new_activity.deal_id,
        "activity_type": new_activity.activity_type,
        "title": new_activity.title,
        "description": new_activity.description,
        "duration_minutes": new_activity.duration_minutes,
        "outcome": new_activity.outcome,
        "metadata": new_activity.metadata,
        "created_by": new_activity.created_by,
        "created_at": new_activity.created_at
    }

# CRM Overview
@app.get("/api/crm/overview", response_model=CRMResponse)
async def get_crm_overview(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get CRM overview with key metrics"""
    # Get basic metrics
    total_contacts = db.query(Contact).count()
    total_deals = db.query(Deal).count()
    total_tasks = db.query(Task).count()
    
    active_deals = db.query(Deal).filter(
        Deal.stage.in_([DealStage.LEAD, DealStage.QUALIFIED, DealStage.PROPOSAL, DealStage.NEGOTIATION])
    ).count()
    
    closed_won_deals = db.query(Deal).filter(Deal.stage == DealStage.CLOSED_WON).count()
    
    # Calculate pipeline value
    pipeline_value = db.query(Deal).filter(
        Deal.stage.in_([DealStage.LEAD, DealStage.QUALIFIED, DealStage.PROPOSAL, DealStage.NEGOTIATION])
    ).with_entities(Deal.value).all()
    pipeline_value = sum([deal.value for deal in pipeline_value])
    
    # Calculate conversion rate
    total_closed_deals = db.query(Deal).filter(
        Deal.stage.in_([DealStage.CLOSED_WON, DealStage.CLOSED_LOST])
    ).count()
    conversion_rate = (closed_won_deals / total_closed_deals * 100) if total_closed_deals > 0 else 0
    
    # Calculate average deal size
    won_deals = db.query(Deal).filter(Deal.stage == DealStage.CLOSED_WON).with_entities(Deal.value).all()
    average_deal_size = sum([deal.value for deal in won_deals]) / len(won_deals) if won_deals else 0
    
    return CRMResponse(
        total_contacts=total_contacts,
        total_deals=total_deals,
        total_tasks=total_tasks,
        active_deals=active_deals,
        closed_won_deals=closed_won_deals,
        pipeline_value=pipeline_value,
        conversion_rate=conversion_rate,
        average_deal_size=average_deal_size
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=SERVICE_PORT,
        reload=True
    )