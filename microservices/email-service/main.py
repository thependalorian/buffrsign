"""
BuffrSign Email Service - Microservice
Handles email notifications, templates, and delivery for BuffrSign
"""

import os
import logging
import uuid
import httpx
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from enum import Enum

from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/buffrsign_emails")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
security = HTTPBearer()

# External service URLs
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")

# Email configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@buffrsign.com")

# Enums
class EmailStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    BOUNCED = "bounced"

class EmailType(str, Enum):
    SIGNATURE_REQUEST = "signature_request"
    SIGNATURE_COMPLETED = "signature_completed"
    DOCUMENT_SHARED = "document_shared"
    REMINDER = "reminder"
    NOTIFICATION = "notification"

app = FastAPI(
    title="BuffrSign Email Service",
    description="Email notification microservice for BuffrSign",
    version="1.0.0",
)

# Database Models
class EmailTemplate(Base):
    __tablename__ = "email_templates"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False, index=True)
    subject_template = Column(String, nullable=False)
    body_template = Column(Text, nullable=False)
    email_type = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    variables = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EmailQueue(Base):
    __tablename__ = "email_queue"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recipient_email = Column(String, nullable=False, index=True)
    recipient_name = Column(String)
    subject = Column(String, nullable=False)
    body_html = Column(Text)
    body_text = Column(Text)
    email_type = Column(String, nullable=False)
    status = Column(String, default=EmailStatus.PENDING)
    priority = Column(Integer, default=1)  # 1=normal, 2=high, 3=urgent
    scheduled_at = Column(DateTime, default=datetime.utcnow)
    sent_at = Column(DateTime)
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class EmailAnalytics(Base):
    __tablename__ = "email_analytics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email_id = Column(String, nullable=False, index=True)
    event_type = Column(String, nullable=False)  # sent, delivered, opened, clicked, bounced
    timestamp = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON, default=dict)

# Pydantic Models
class EmailSendRequest(BaseModel):
    recipient_email: EmailStr
    recipient_name: Optional[str] = None
    subject: str
    body_html: Optional[str] = None
    body_text: Optional[str] = None
    email_type: EmailType = EmailType.NOTIFICATION
    priority: int = 1
    scheduled_at: Optional[datetime] = None
    metadata: Dict[str, Any] = {}

class EmailTemplateCreate(BaseModel):
    name: str
    subject_template: str
    body_template: str
    email_type: EmailType
    variables: List[str] = []

class EmailTemplateResponse(BaseModel):
    id: str
    name: str
    subject_template: str
    body_template: str
    email_type: str
    is_active: bool
    variables: List[str]
    created_at: datetime
    updated_at: datetime

class EmailQueueResponse(BaseModel):
    id: str
    recipient_email: str
    recipient_name: Optional[str]
    subject: str
    email_type: str
    status: str
    priority: int
    scheduled_at: datetime
    sent_at: Optional[datetime]
    retry_count: int
    created_at: datetime

class EmailAnalyticsResponse(BaseModel):
    total_sent: int
    total_delivered: int
    total_failed: int
    total_bounced: int
    delivery_rate: float
    bounce_rate: float
    period_start: datetime
    period_end: datetime

# Authentication helper
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Verify JWT token with auth service"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/api/auth/me",
                headers={"Authorization": f"Bearer {credentials.credentials}"}
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=401, detail="Invalid token")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Auth service unavailable")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Email Service
class EmailService:
    def __init__(self):
        self.smtp_host = SMTP_HOST
        self.smtp_port = SMTP_PORT
        self.smtp_username = SMTP_USERNAME
        self.smtp_password = SMTP_PASSWORD
        self.from_email = FROM_EMAIL
    
    async def send_email(self, email_data: EmailQueue, db: Session) -> bool:
        """Send email via SMTP"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = email_data.recipient_email
            msg['Subject'] = email_data.subject
            
            # Add body
            if email_data.body_text:
                text_part = MIMEText(email_data.body_text, 'plain')
                msg.attach(text_part)
            
            if email_data.body_html:
                html_part = MIMEText(email_data.body_html, 'html')
                msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                if self.smtp_username and self.smtp_password:
                    server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            # Update status
            email_data.status = EmailStatus.SENT
            email_data.sent_at = datetime.utcnow()
            db.commit()
            
            # Log analytics
            analytics = EmailAnalytics(
                email_id=email_data.id,
                event_type="sent",
                metadata={"recipient": email_data.recipient_email}
            )
            db.add(analytics)
            db.commit()
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending email {email_data.id}: {e}")
            email_data.status = EmailStatus.FAILED
            email_data.error_message = str(e)
            email_data.retry_count += 1
            db.commit()
            return False
    
    def render_template(self, template: EmailTemplate, variables: Dict[str, Any]) -> Dict[str, str]:
        """Render email template with variables"""
        try:
            subject = template.subject_template.format(**variables)
            body = template.body_template.format(**variables)
            return {"subject": subject, "body": body}
        except KeyError as e:
            raise HTTPException(status_code=400, detail=f"Missing template variable: {e}")
    
    async def queue_email(self, email_request: EmailSendRequest, db: Session) -> EmailQueue:
        """Queue email for sending"""
        email_queue = EmailQueue(
            recipient_email=email_request.recipient_email,
            recipient_name=email_request.recipient_name,
            subject=email_request.subject,
            body_html=email_request.body_html,
            body_text=email_request.body_text,
            email_type=email_request.email_type,
            priority=email_request.priority,
            scheduled_at=email_request.scheduled_at or datetime.utcnow(),
            metadata=email_request.metadata
        )
        
        db.add(email_queue)
        db.commit()
        db.refresh(email_queue)
        
        return email_queue

# Initialize email service
email_service = EmailService()

# API Endpoints
@app.post("/api/emails/send", response_model=EmailQueueResponse)
async def send_email(
    email_request: EmailSendRequest,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Send email immediately"""
    email_queue = await email_service.queue_email(email_request, db)
    
    # Send immediately
    success = await email_service.send_email(email_queue, db)
    
    if not success and email_queue.retry_count < email_queue.max_retries:
        # Schedule retry
        email_queue.scheduled_at = datetime.utcnow() + timedelta(minutes=5 * email_queue.retry_count)
        db.commit()
    
    return EmailQueueResponse(
        id=email_queue.id,
        recipient_email=email_queue.recipient_email,
        recipient_name=email_queue.recipient_name,
        subject=email_queue.subject,
        email_type=email_queue.email_type,
        status=email_queue.status,
        priority=email_queue.priority,
        scheduled_at=email_queue.scheduled_at,
        sent_at=email_queue.sent_at,
        retry_count=email_queue.retry_count,
        created_at=email_queue.created_at
    )

@app.post("/api/emails/queue", response_model=EmailQueueResponse)
async def queue_email(
    email_request: EmailSendRequest,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Queue email for later sending"""
    email_queue = await email_service.queue_email(email_request, db)
    
    return EmailQueueResponse(
        id=email_queue.id,
        recipient_email=email_queue.recipient_email,
        recipient_name=email_queue.recipient_name,
        subject=email_queue.subject,
        email_type=email_queue.email_type,
        status=email_queue.status,
        priority=email_queue.priority,
        scheduled_at=email_queue.scheduled_at,
        sent_at=email_queue.sent_at,
        retry_count=email_queue.retry_count,
        created_at=email_queue.created_at
    )

@app.post("/api/emails/templates", response_model=EmailTemplateResponse)
async def create_email_template(
    template_data: EmailTemplateCreate,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Create email template"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    template = EmailTemplate(
        name=template_data.name,
        subject_template=template_data.subject_template,
        body_template=template_data.body_template,
        email_type=template_data.email_type,
        variables=template_data.variables
    )
    
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return EmailTemplateResponse(
        id=template.id,
        name=template.name,
        subject_template=template.subject_template,
        body_template=template.body_template,
        email_type=template.email_type,
        is_active=template.is_active,
        variables=template.variables,
        created_at=template.created_at,
        updated_at=template.updated_at
    )

@app.get("/api/emails/templates", response_model=List[EmailTemplateResponse])
async def get_email_templates(
    email_type: Optional[EmailType] = None,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get email templates"""
    query = db.query(EmailTemplate).filter(EmailTemplate.is_active == True)
    
    if email_type:
        query = query.filter(EmailTemplate.email_type == email_type)
    
    templates = query.all()
    
    return [
        EmailTemplateResponse(
            id=template.id,
            name=template.name,
            subject_template=template.subject_template,
            body_template=template.body_template,
            email_type=template.email_type,
            is_active=template.is_active,
            variables=template.variables,
            created_at=template.created_at,
            updated_at=template.updated_at
        )
        for template in templates
    ]

@app.post("/api/emails/templates/{template_id}/send")
async def send_template_email(
    template_id: str,
    recipient_email: EmailStr,
    variables: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Send email using template"""
    template = db.query(EmailTemplate).filter(
        EmailTemplate.id == template_id,
        EmailTemplate.is_active == True
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Render template
    rendered = email_service.render_template(template, variables)
    
    # Create email request
    email_request = EmailSendRequest(
        recipient_email=recipient_email,
        subject=rendered["subject"],
        body_html=rendered["body"],
        email_type=template.email_type,
        metadata={"template_id": template_id, "template_name": template.name}
    )
    
    # Send email
    email_queue = await email_service.queue_email(email_request, db)
    success = await email_service.send_email(email_queue, db)
    
    return {
        "email_id": email_queue.id,
        "success": success,
        "message": "Email sent successfully" if success else "Email queued for retry"
    }

@app.get("/api/emails/queue", response_model=List[EmailQueueResponse])
async def get_email_queue(
    status: Optional[EmailStatus] = None,
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get email queue (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = db.query(EmailQueue)
    
    if status:
        query = query.filter(EmailQueue.status == status)
    
    emails = query.order_by(EmailQueue.created_at.desc()).limit(limit).all()
    
    return [
        EmailQueueResponse(
            id=email.id,
            recipient_email=email.recipient_email,
            recipient_name=email.recipient_name,
            subject=email.subject,
            email_type=email.email_type,
            status=email.status,
            priority=email.priority,
            scheduled_at=email.scheduled_at,
            sent_at=email.sent_at,
            retry_count=email.retry_count,
            created_at=email.created_at
        )
        for email in emails
    ]

@app.get("/api/emails/analytics", response_model=EmailAnalyticsResponse)
async def get_email_analytics(
    days: int = 30,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get email analytics"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get analytics data
    total_sent = db.query(EmailAnalytics).filter(
        EmailAnalytics.event_type == "sent",
        EmailAnalytics.timestamp >= start_date
    ).count()
    
    total_delivered = db.query(EmailAnalytics).filter(
        EmailAnalytics.event_type == "delivered",
        EmailAnalytics.timestamp >= start_date
    ).count()
    
    total_failed = db.query(EmailAnalytics).filter(
        EmailAnalytics.event_type == "failed",
        EmailAnalytics.timestamp >= start_date
    ).count()
    
    total_bounced = db.query(EmailAnalytics).filter(
        EmailAnalytics.event_type == "bounced",
        EmailAnalytics.timestamp >= start_date
    ).count()
    
    delivery_rate = (total_delivered / total_sent * 100) if total_sent > 0 else 0
    bounce_rate = (total_bounced / total_sent * 100) if total_sent > 0 else 0
    
    return EmailAnalyticsResponse(
        total_sent=total_sent,
        total_delivered=total_delivered,
        total_failed=total_failed,
        total_bounced=total_bounced,
        delivery_rate=round(delivery_rate, 2),
        bounce_rate=round(bounce_rate, 2),
        period_start=start_date,
        period_end=end_date
    )

@app.post("/api/emails/process-queue")
async def process_email_queue(
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Process pending emails in queue"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get pending emails
    pending_emails = db.query(EmailQueue).filter(
        EmailQueue.status == EmailStatus.PENDING,
        EmailQueue.scheduled_at <= datetime.utcnow(),
        EmailQueue.retry_count < EmailQueue.max_retries
    ).limit(10).all()
    
    processed = 0
    for email in pending_emails:
        success = await email_service.send_email(email, db)
        processed += 1
        
        if not success and email.retry_count >= email.max_retries:
            email.status = EmailStatus.FAILED
    
    db.commit()
    
    return {
        "processed": processed,
        "message": f"Processed {processed} emails from queue"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "email-service",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)