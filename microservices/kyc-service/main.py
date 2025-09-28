"""
BuffrSign KYC Service - Microservice
Handles Know Your Customer verification, document validation, and compliance checks for BuffrSign
"""

import os
import logging
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from enum import Enum

import redis.asyncio as redis
from fastapi import FastAPI, HTTPException, status, Depends, Query, UploadFile, File
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
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/buffrsign_kyc")
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
SERVICE_NAME = "kyc-service"
SERVICE_VERSION = "1.0.0"
SERVICE_PORT = int(os.getenv("SERVICE_PORT", 8012))

# Enums
class DocumentType(str, Enum):
    PASSPORT = "passport"
    NATIONAL_ID = "national_id"
    DRIVERS_LICENSE = "drivers_license"
    UTILITY_BILL = "utility_bill"
    BANK_STATEMENT = "bank_statement"
    EMPLOYMENT_CERTIFICATE = "employment_certificate"
    PAYSLIP = "payslip"
    TAX_CERTIFICATE = "tax_certificate"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"
    REQUIRES_REVIEW = "requires_review"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class VerificationMethod(str, Enum):
    AUTOMATED = "automated"
    MANUAL = "manual"
    HYBRID = "hybrid"

class ComplianceCheck(str, Enum):
    SANCTIONS = "sanctions"
    PEP = "pep"  # Politically Exposed Person
    AML = "aml"  # Anti-Money Laundering
    FRAUD = "fraud"
    IDENTITY = "identity"

# Database Models
class KYCDocument(Base):
    __tablename__ = "kyc_documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    document_type = Column(String, nullable=False)
    document_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)
    checksum = Column(String, nullable=False)
    status = Column(String, default=VerificationStatus.PENDING)
    verification_method = Column(String, default=VerificationMethod.AUTOMATED)
    confidence_score = Column(Float, default=0.0)
    extracted_data = Column(JSON, default=dict)
    validation_results = Column(JSON, default=dict)
    error_message = Column(Text)
    verified_by = Column(String)
    verified_at = Column(DateTime)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class KYCVerification(Base):
    __tablename__ = "kyc_verifications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    verification_type = Column(String, nullable=False)  # identity, address, employment, etc.
    status = Column(String, default=VerificationStatus.PENDING)
    risk_level = Column(String, default=RiskLevel.LOW)
    risk_score = Column(Float, default=0.0)
    compliance_checks = Column(JSON, default=list)
    verification_data = Column(JSON, default=dict)
    verification_results = Column(JSON, default=dict)
    notes = Column(Text)
    verified_by = Column(String)
    verified_at = Column(DateTime)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    check_type = Column(String, nullable=False)
    status = Column(String, default=VerificationStatus.PENDING)
    risk_level = Column(String, default=RiskLevel.LOW)
    check_data = Column(JSON, default=dict)
    check_results = Column(JSON, default=dict)
    match_found = Column(Boolean, default=False)
    match_details = Column(JSON, default=dict)
    notes = Column(Text)
    checked_by = Column(String)
    checked_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class IdentityVerification(Base):
    __tablename__ = "identity_verifications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(DateTime, nullable=False)
    nationality = Column(String, nullable=False)
    document_number = Column(String, nullable=False)
    document_type = Column(String, nullable=False)
    document_issuer = Column(String, nullable=False)
    document_expiry = Column(DateTime, nullable=True)
    address = Column(JSON, default=dict)
    phone_number = Column(String, nullable=True)
    email = Column(String, nullable=True)
    status = Column(String, default=VerificationStatus.PENDING)
    verification_score = Column(Float, default=0.0)
    verification_data = Column(JSON, default=dict)
    verified_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class KYCAuditLog(Base):
    __tablename__ = "kyc_audit_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    details = Column(JSON, default=dict)
    ip_address = Column(String)
    user_agent = Column(Text)
    performed_by = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
class DocumentUpload(BaseModel):
    user_id: str
    document_type: DocumentType
    document_name: str

class DocumentVerification(BaseModel):
    document_id: str
    verification_method: VerificationMethod = VerificationMethod.AUTOMATED

class IdentityVerificationCreate(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    date_of_birth: datetime
    nationality: str
    document_number: str
    document_type: DocumentType
    document_issuer: str
    document_expiry: Optional[datetime] = None
    address: Optional[Dict[str, Any]] = {}
    phone_number: Optional[str] = None
    email: Optional[str] = None

class ComplianceCheckCreate(BaseModel):
    user_id: str
    check_type: ComplianceCheck
    check_data: Optional[Dict[str, Any]] = {}

class KYCVerificationCreate(BaseModel):
    user_id: str
    verification_type: str
    verification_data: Optional[Dict[str, Any]] = {}

class KYCDocumentResponse(BaseModel):
    id: str
    user_id: str
    document_type: str
    document_name: str
    status: str
    verification_method: str
    confidence_score: float
    extracted_data: Dict[str, Any]
    validation_results: Dict[str, Any]
    error_message: Optional[str]
    verified_at: Optional[datetime]
    expires_at: Optional[datetime]
    created_at: datetime

class KYCVerificationResponse(BaseModel):
    id: str
    user_id: str
    verification_type: str
    status: str
    risk_level: str
    risk_score: float
    compliance_checks: List[str]
    verification_results: Dict[str, Any]
    notes: Optional[str]
    verified_at: Optional[datetime]
    expires_at: Optional[datetime]
    created_at: datetime

class KYCResponse(BaseModel):
    total_documents: int
    verified_documents: int
    pending_documents: int
    rejected_documents: int
    total_verifications: int
    completed_verifications: int
    pending_verifications: int
    compliance_checks_today: int
    average_verification_time: float

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
        logger.info("✅ Redis connected for KYC service")
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
    description="Know Your Customer verification and compliance microservice",
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
        "description": "Know Your Customer verification and compliance",
        "endpoints": {
            "health": "/health",
            "documents": "/api/kyc/documents",
            "verifications": "/api/kyc/verifications",
            "identity": "/api/kyc/identity",
            "compliance": "/api/kyc/compliance",
            "audit": "/api/kyc/audit",
            "overview": "/api/kyc/overview"
        }
    }

# Document Management
@app.get("/api/kyc/documents")
async def get_kyc_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[str] = None,
    document_type: Optional[DocumentType] = None,
    status: Optional[VerificationStatus] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get KYC documents with filtering"""
    query = db.query(KYCDocument)
    
    if user_id:
        query = query.filter(KYCDocument.user_id == user_id)
    if document_type:
        query = query.filter(KYCDocument.document_type == document_type)
    if status:
        query = query.filter(KYCDocument.status == status)
    
    documents = query.order_by(KYCDocument.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "documents": [
            {
                "id": doc.id,
                "user_id": doc.user_id,
                "document_type": doc.document_type,
                "document_name": doc.document_name,
                "file_size": doc.file_size,
                "mime_type": doc.mime_type,
                "status": doc.status,
                "verification_method": doc.verification_method,
                "confidence_score": doc.confidence_score,
                "extracted_data": doc.extracted_data,
                "validation_results": doc.validation_results,
                "error_message": doc.error_message,
                "verified_at": doc.verified_at,
                "expires_at": doc.expires_at,
                "created_at": doc.created_at,
                "updated_at": doc.updated_at
            }
            for doc in documents
        ]
    }

@app.post("/api/kyc/documents/upload")
async def upload_kyc_document(
    file: UploadFile = File(...),
    user_id: str = Query(...),
    document_type: DocumentType = Query(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a KYC document"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, and PDF files are allowed."
        )
    
    # Validate file size (max 10MB)
    if file.size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size too large. Maximum size is 10MB."
        )
    
    # Generate file path and save file
    file_extension = file.filename.split('.')[-1]
    file_name = f"{user_id}_{document_type}_{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/kyc/{file_name}"
    
    # In a real implementation, you would save the file to storage
    # For now, we'll just create the database record
    
    # Calculate checksum (simplified)
    checksum = f"sha256_{uuid.uuid4().hex[:16]}"
    
    new_document = KYCDocument(
        user_id=user_id,
        document_type=document_type,
        document_name=file.filename,
        file_path=file_path,
        file_size=file.size,
        mime_type=file.content_type,
        checksum=checksum,
        expires_at=datetime.utcnow() + timedelta(days=90)
    )
    
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    
    # Start document verification asynchronously
    asyncio.create_task(verify_document(new_document.id, db))
    
    # Log audit trail
    audit_log = KYCAuditLog(
        user_id=user_id,
        action="document_upload",
        entity_type="kyc_document",
        entity_id=new_document.id,
        details={"document_type": document_type, "file_name": file.filename},
        ip_address="127.0.0.1",  # Would be extracted from request
        performed_by=current_user["user_id"]
    )
    db.add(audit_log)
    db.commit()
    
    logger.info(f"✅ KYC document uploaded: {file.filename}")
    
    return {
        "id": new_document.id,
        "user_id": new_document.user_id,
        "document_type": new_document.document_type,
        "document_name": new_document.document_name,
        "status": new_document.status,
        "verification_method": new_document.verification_method,
        "expires_at": new_document.expires_at,
        "created_at": new_document.created_at
    }

@app.post("/api/kyc/documents/{document_id}/verify")
async def verify_document_endpoint(
    document_id: str,
    verification_data: DocumentVerification,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually trigger document verification"""
    document = db.query(KYCDocument).filter(KYCDocument.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Update verification method
    document.verification_method = verification_data.verification_method
    document.status = VerificationStatus.IN_PROGRESS
    document.updated_at = datetime.utcnow()
    db.commit()
    
    # Start verification
    asyncio.create_task(verify_document(document_id, db))
    
    logger.info(f"✅ Document verification triggered: {document_id}")
    
    return {
        "document_id": document_id,
        "status": document.status,
        "verification_method": document.verification_method,
        "message": "Verification started"
    }

# Identity Verification Management
@app.get("/api/kyc/identity")
async def get_identity_verifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[str] = None,
    status: Optional[VerificationStatus] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get identity verifications with filtering"""
    query = db.query(IdentityVerification)
    
    if user_id:
        query = query.filter(IdentityVerification.user_id == user_id)
    if status:
        query = query.filter(IdentityVerification.status == status)
    
    verifications = query.order_by(IdentityVerification.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "verifications": [
            {
                "id": verification.id,
                "user_id": verification.user_id,
                "first_name": verification.first_name,
                "last_name": verification.last_name,
                "date_of_birth": verification.date_of_birth,
                "nationality": verification.nationality,
                "document_number": verification.document_number,
                "document_type": verification.document_type,
                "document_issuer": verification.document_issuer,
                "document_expiry": verification.document_expiry,
                "address": verification.address,
                "phone_number": verification.phone_number,
                "email": verification.email,
                "status": verification.status,
                "verification_score": verification.verification_score,
                "verification_data": verification.verification_data,
                "verified_at": verification.verified_at,
                "created_at": verification.created_at,
                "updated_at": verification.updated_at
            }
            for verification in verifications
        ]
    }

@app.post("/api/kyc/identity")
async def create_identity_verification(
    verification_data: IdentityVerificationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new identity verification"""
    new_verification = IdentityVerification(
        user_id=verification_data.user_id,
        first_name=verification_data.first_name,
        last_name=verification_data.last_name,
        date_of_birth=verification_data.date_of_birth,
        nationality=verification_data.nationality,
        document_number=verification_data.document_number,
        document_type=verification_data.document_type,
        document_issuer=verification_data.document_issuer,
        document_expiry=verification_data.document_expiry,
        address=verification_data.address,
        phone_number=verification_data.phone_number,
        email=verification_data.email
    )
    
    db.add(new_verification)
    db.commit()
    db.refresh(new_verification)
    
    # Start identity verification asynchronously
    asyncio.create_task(verify_identity(new_verification.id, db))
    
    # Log audit trail
    audit_log = KYCAuditLog(
        user_id=verification_data.user_id,
        action="identity_verification_create",
        entity_type="identity_verification",
        entity_id=new_verification.id,
        details={"verification_type": "identity"},
        performed_by=current_user["user_id"]
    )
    db.add(audit_log)
    db.commit()
    
    logger.info(f"✅ Identity verification created: {new_verification.id}")
    
    return {
        "id": new_verification.id,
        "user_id": new_verification.user_id,
        "first_name": new_verification.first_name,
        "last_name": new_verification.last_name,
        "status": new_verification.status,
        "verification_score": new_verification.verification_score,
        "created_at": new_verification.created_at
    }

# Compliance Check Management
@app.get("/api/kyc/compliance")
async def get_compliance_checks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[str] = None,
    check_type: Optional[ComplianceCheck] = None,
    status: Optional[VerificationStatus] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get compliance checks with filtering"""
    query = db.query(ComplianceCheck)
    
    if user_id:
        query = query.filter(ComplianceCheck.user_id == user_id)
    if check_type:
        query = query.filter(ComplianceCheck.check_type == check_type)
    if status:
        query = query.filter(ComplianceCheck.status == status)
    
    checks = query.order_by(ComplianceCheck.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "checks": [
            {
                "id": check.id,
                "user_id": check.user_id,
                "check_type": check.check_type,
                "status": check.status,
                "risk_level": check.risk_level,
                "check_data": check.check_data,
                "check_results": check.check_results,
                "match_found": check.match_found,
                "match_details": check.match_details,
                "notes": check.notes,
                "checked_at": check.checked_at,
                "created_at": check.created_at
            }
            for check in checks
        ]
    }

@app.post("/api/kyc/compliance")
async def create_compliance_check(
    check_data: ComplianceCheckCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new compliance check"""
    new_check = ComplianceCheck(
        user_id=check_data.user_id,
        check_type=check_data.check_type,
        check_data=check_data.check_data
    )
    
    db.add(new_check)
    db.commit()
    db.refresh(new_check)
    
    # Start compliance check asynchronously
    asyncio.create_task(perform_compliance_check(new_check.id, db))
    
    # Log audit trail
    audit_log = KYCAuditLog(
        user_id=check_data.user_id,
        action="compliance_check_create",
        entity_type="compliance_check",
        entity_id=new_check.id,
        details={"check_type": check_data.check_type},
        performed_by=current_user["user_id"]
    )
    db.add(audit_log)
    db.commit()
    
    logger.info(f"✅ Compliance check created: {new_check.id}")
    
    return {
        "id": new_check.id,
        "user_id": new_check.user_id,
        "check_type": new_check.check_type,
        "status": new_check.status,
        "risk_level": new_check.risk_level,
        "check_data": new_check.check_data,
        "created_at": new_check.created_at
    }

# KYC Verification Management
@app.get("/api/kyc/verifications")
async def get_kyc_verifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[str] = None,
    verification_type: Optional[str] = None,
    status: Optional[VerificationStatus] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get KYC verifications with filtering"""
    query = db.query(KYCVerification)
    
    if user_id:
        query = query.filter(KYCVerification.user_id == user_id)
    if verification_type:
        query = query.filter(KYCVerification.verification_type == verification_type)
    if status:
        query = query.filter(KYCVerification.status == status)
    
    verifications = query.order_by(KYCVerification.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "verifications": [
            {
                "id": verification.id,
                "user_id": verification.user_id,
                "verification_type": verification.verification_type,
                "status": verification.status,
                "risk_level": verification.risk_level,
                "risk_score": verification.risk_score,
                "compliance_checks": verification.compliance_checks,
                "verification_data": verification.verification_data,
                "verification_results": verification.verification_results,
                "notes": verification.notes,
                "verified_at": verification.verified_at,
                "expires_at": verification.expires_at,
                "created_at": verification.created_at,
                "updated_at": verification.updated_at
            }
            for verification in verifications
        ]
    }

@app.post("/api/kyc/verifications")
async def create_kyc_verification(
    verification_data: KYCVerificationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new KYC verification"""
    new_verification = KYCVerification(
        user_id=verification_data.user_id,
        verification_type=verification_data.verification_type,
        verification_data=verification_data.verification_data,
        expires_at=datetime.utcnow() + timedelta(days=365)
    )
    
    db.add(new_verification)
    db.commit()
    db.refresh(new_verification)
    
    # Start verification asynchronously
    asyncio.create_task(perform_kyc_verification(new_verification.id, db))
    
    # Log audit trail
    audit_log = KYCAuditLog(
        user_id=verification_data.user_id,
        action="kyc_verification_create",
        entity_type="kyc_verification",
        entity_id=new_verification.id,
        details={"verification_type": verification_data.verification_type},
        performed_by=current_user["user_id"]
    )
    db.add(audit_log)
    db.commit()
    
    logger.info(f"✅ KYC verification created: {new_verification.id}")
    
    return {
        "id": new_verification.id,
        "user_id": new_verification.user_id,
        "verification_type": new_verification.verification_type,
        "status": new_verification.status,
        "risk_level": new_verification.risk_level,
        "risk_score": new_verification.risk_score,
        "compliance_checks": new_verification.compliance_checks,
        "expires_at": new_verification.expires_at,
        "created_at": new_verification.created_at
    }

# Audit Logs
@app.get("/api/kyc/audit")
async def get_kyc_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get KYC audit logs with filtering"""
    query = db.query(KYCAuditLog)
    
    if user_id:
        query = query.filter(KYCAuditLog.user_id == user_id)
    if action:
        query = query.filter(KYCAuditLog.action == action)
    if start_date:
        query = query.filter(KYCAuditLog.timestamp >= start_date)
    if end_date:
        query = query.filter(KYCAuditLog.timestamp <= end_date)
    
    logs = query.order_by(KYCAuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    
    return {
        "audit_logs": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "details": log.details,
                "ip_address": log.ip_address,
                "user_agent": log.user_agent,
                "performed_by": log.performed_by,
                "timestamp": log.timestamp,
                "created_at": log.created_at
            }
            for log in logs
        ]
    }

# KYC Overview
@app.get("/api/kyc/overview", response_model=KYCResponse)
async def get_kyc_overview(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get KYC overview with key metrics"""
    # Get document metrics
    total_documents = db.query(KYCDocument).count()
    verified_documents = db.query(KYCDocument).filter(KYCDocument.status == VerificationStatus.VERIFIED).count()
    pending_documents = db.query(KYCDocument).filter(KYCDocument.status == VerificationStatus.PENDING).count()
    rejected_documents = db.query(KYCDocument).filter(KYCDocument.status == VerificationStatus.REJECTED).count()
    
    # Get verification metrics
    total_verifications = db.query(KYCVerification).count()
    completed_verifications = db.query(KYCVerification).filter(KYCVerification.status == VerificationStatus.VERIFIED).count()
    pending_verifications = db.query(KYCVerification).filter(KYCVerification.status == VerificationStatus.PENDING).count()
    
    # Get today's compliance checks
    today = datetime.utcnow().date()
    compliance_checks_today = db.query(ComplianceCheck).filter(
        db.func.date(ComplianceCheck.created_at) == today
    ).count()
    
    # Calculate average verification time (simplified)
    average_verification_time = 2.5  # hours
    
    return KYCResponse(
        total_documents=total_documents,
        verified_documents=verified_documents,
        pending_documents=pending_documents,
        rejected_documents=rejected_documents,
        total_verifications=total_verifications,
        completed_verifications=completed_verifications,
        pending_verifications=pending_verifications,
        compliance_checks_today=compliance_checks_today,
        average_verification_time=average_verification_time
    )

# Helper functions
async def verify_document(document_id: str, db: Session):
    """Verify document asynchronously"""
    document = db.query(KYCDocument).filter(KYCDocument.id == document_id).first()
    if not document:
        return
    
    try:
        document.status = VerificationStatus.IN_PROGRESS
        db.commit()
        
        # Simulate document verification process
        await asyncio.sleep(5)  # Simulate processing time
        
        # Mock verification results
        confidence_score = 0.85
        extracted_data = {
            "document_number": "123456789",
            "name": "John Doe",
            "date_of_birth": "1990-01-01",
            "expiry_date": "2030-01-01"
        }
        validation_results = {
            "document_valid": True,
            "face_match": True,
            "text_extraction": True,
            "security_features": True
        }
        
        document.confidence_score = confidence_score
        document.extracted_data = extracted_data
        document.validation_results = validation_results
        document.status = VerificationStatus.VERIFIED if confidence_score > 0.8 else VerificationStatus.REJECTED
        document.verified_at = datetime.utcnow()
        
        if document.status == VerificationStatus.REJECTED:
            document.error_message = "Document verification failed - low confidence score"
        
    except Exception as e:
        document.status = VerificationStatus.REJECTED
        document.error_message = str(e)
    
    document.updated_at = datetime.utcnow()
    db.commit()

async def verify_identity(verification_id: str, db: Session):
    """Verify identity asynchronously"""
    verification = db.query(IdentityVerification).filter(IdentityVerification.id == verification_id).first()
    if not verification:
        return
    
    try:
        verification.status = VerificationStatus.IN_PROGRESS
        db.commit()
        
        # Simulate identity verification process
        await asyncio.sleep(3)  # Simulate processing time
        
        # Mock verification results
        verification_score = 0.92
        verification_data = {
            "identity_match": True,
            "document_valid": True,
            "age_verification": True,
            "address_verification": True
        }
        
        verification.verification_score = verification_score
        verification.verification_data = verification_data
        verification.status = VerificationStatus.VERIFIED if verification_score > 0.8 else VerificationStatus.REJECTED
        verification.verified_at = datetime.utcnow()
        
    except Exception as e:
        verification.status = VerificationStatus.REJECTED
    
    verification.updated_at = datetime.utcnow()
    db.commit()

async def perform_compliance_check(check_id: str, db: Session):
    """Perform compliance check asynchronously"""
    check = db.query(ComplianceCheck).filter(ComplianceCheck.id == check_id).first()
    if not check:
        return
    
    try:
        check.status = VerificationStatus.IN_PROGRESS
        db.commit()
        
        # Simulate compliance check process
        await asyncio.sleep(2)  # Simulate processing time
        
        # Mock compliance check results
        check_results = {
            "sanctions_check": "clear",
            "pep_check": "clear",
            "aml_check": "clear",
            "fraud_check": "clear"
        }
        
        check.check_results = check_results
        check.status = VerificationStatus.VERIFIED
        check.risk_level = RiskLevel.LOW
        check.checked_at = datetime.utcnow()
        
    except Exception as e:
        check.status = VerificationStatus.REJECTED
        check.risk_level = RiskLevel.HIGH
    
    db.commit()

async def perform_kyc_verification(verification_id: str, db: Session):
    """Perform KYC verification asynchronously"""
    verification = db.query(KYCVerification).filter(KYCVerification.id == verification_id).first()
    if not verification:
        return
    
    try:
        verification.status = VerificationStatus.IN_PROGRESS
        db.commit()
        
        # Simulate KYC verification process
        await asyncio.sleep(4)  # Simulate processing time
        
        # Mock verification results
        verification_results = {
            "identity_verified": True,
            "address_verified": True,
            "employment_verified": True,
            "compliance_checks_passed": True
        }
        
        verification.verification_results = verification_results
        verification.status = VerificationStatus.VERIFIED
        verification.risk_level = RiskLevel.LOW
        verification.risk_score = 0.15
        verification.verified_at = datetime.utcnow()
        
    except Exception as e:
        verification.status = VerificationStatus.REJECTED
        verification.risk_level = RiskLevel.HIGH
        verification.risk_score = 0.85
    
    verification.updated_at = datetime.utcnow()
    db.commit()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=SERVICE_PORT,
        reload=True
    )