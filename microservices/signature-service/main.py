"""
BuffrSign Signature Service - Microservice
Handles digital signature generation, verification, and workflow management
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
from pydantic import BaseModel
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/buffrsign_signatures")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
security = HTTPBearer()

# External service URLs
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
DOCUMENT_SERVICE_URL = os.getenv("DOCUMENT_SERVICE_URL", "http://localhost:8002")
EMAIL_SERVICE_URL = os.getenv("EMAIL_SERVICE_URL", "http://localhost:8004")

# Enums
class SignatureStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REJECTED = "rejected"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class SignatureType(str, Enum):
    ELECTRONIC = "electronic"
    DIGITAL = "digital"
    BIOMETRIC = "biometric"
    HANDWRITTEN = "handwritten"

app = FastAPI(
    title="BuffrSign Signature Service",
    description="Digital signature management microservice for BuffrSign",
    version="1.0.0",
)

# Database Models
class SignatureRequest(Base):
    __tablename__ = "signature_requests"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, nullable=False, index=True)
    requester_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    signature_type = Column(String, default=SignatureType.ELECTRONIC)
    status = Column(String, default=SignatureStatus.DRAFT)
    expires_at = Column(DateTime)
    metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Signature(Base):
    __tablename__ = "signatures"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    signature_request_id = Column(String, nullable=False, index=True)
    signer_id = Column(String, nullable=False, index=True)
    signature_data = Column(JSON, nullable=False)
    signature_type = Column(String, nullable=False)
    signature_hash = Column(String, nullable=False, index=True)
    ip_address = Column(String)
    user_agent = Column(String)
    signed_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime)
    is_verified = Column(Boolean, default=False)

class SignatureWorkflow(Base):
    __tablename__ = "signature_workflows"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    signature_request_id = Column(String, nullable=False, index=True)
    step_number = Column(Integer, nullable=False)
    signer_id = Column(String, nullable=False, index=True)
    step_type = Column(String, nullable=False)  # review, sign, approve
    status = Column(String, default="pending")
    completed_at = Column(DateTime)
    comments = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
class SignatureRequestCreate(BaseModel):
    document_id: str
    title: str
    description: Optional[str] = None
    signature_type: SignatureType = SignatureType.ELECTRONIC
    expires_in_days: int = 30
    signers: List[Dict[str, Any]]

class SignatureRequestResponse(BaseModel):
    id: str
    document_id: str
    requester_id: str
    title: str
    description: Optional[str]
    signature_type: str
    status: str
    expires_at: Optional[datetime]
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class SignatureResponse(BaseModel):
    id: str
    signature_request_id: str
    signer_id: str
    signature_type: str
    signature_hash: str
    signed_at: datetime
    verified_at: Optional[datetime]
    is_verified: bool

class SignatureWorkflowResponse(BaseModel):
    id: str
    signature_request_id: str
    step_number: int
    signer_id: str
    step_type: str
    status: str
    completed_at: Optional[datetime]
    comments: Optional[str]
    created_at: datetime

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

# Signature Service
class SignatureService:
    def __init__(self):
        pass
    
    async def create_signature_request(
        self, 
        request_data: SignatureRequestCreate, 
        requester_id: str, 
        db: Session
    ) -> SignatureRequest:
        """Create a new signature request"""
        # Verify document exists
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{DOCUMENT_SERVICE_URL}/api/documents/{request_data.document_id}",
                headers={"Authorization": f"Bearer {os.getenv('INTERNAL_TOKEN', 'internal')}"}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Document not found")
        
        # Create signature request
        expires_at = datetime.utcnow() + timedelta(days=request_data.expires_in_days)
        signature_request = SignatureRequest(
            document_id=request_data.document_id,
            requester_id=requester_id,
            title=request_data.title,
            description=request_data.description,
            signature_type=request_data.signature_type,
            expires_at=expires_at,
            metadata={"signers": request_data.signers}
        )
        
        db.add(signature_request)
        db.commit()
        db.refresh(signature_request)
        
        # Create workflow steps
        for i, signer in enumerate(request_data.signers):
            workflow_step = SignatureWorkflow(
                signature_request_id=signature_request.id,
                step_number=i + 1,
                signer_id=signer["user_id"],
                step_type=signer.get("step_type", "sign"),
                status="pending"
            )
            db.add(workflow_step)
        
        db.commit()
        
        return signature_request
    
    async def sign_document(
        self, 
        signature_request_id: str, 
        signer_id: str, 
        signature_data: Dict[str, Any], 
        db: Session
    ) -> Signature:
        """Process document signature"""
        # Get signature request
        signature_request = db.query(SignatureRequest).filter(
            SignatureRequest.id == signature_request_id
        ).first()
        
        if not signature_request:
            raise HTTPException(status_code=404, detail="Signature request not found")
        
        if signature_request.status != SignatureStatus.PENDING:
            raise HTTPException(status_code=400, detail="Signature request not in pending status")
        
        # Check if signer is authorized
        workflow_step = db.query(SignatureWorkflow).filter(
            SignatureWorkflow.signature_request_id == signature_request_id,
            SignatureWorkflow.signer_id == signer_id,
            SignatureWorkflow.status == "pending"
        ).first()
        
        if not workflow_step:
            raise HTTPException(status_code=403, detail="Not authorized to sign this document")
        
        # Create signature
        signature_hash = str(uuid.uuid4())  # Simplified hash
        signature = Signature(
            signature_request_id=signature_request_id,
            signer_id=signer_id,
            signature_data=signature_data,
            signature_type=signature_request.signature_type,
            signature_hash=signature_hash,
            is_verified=True  # Simplified verification
        )
        
        db.add(signature)
        
        # Update workflow step
        workflow_step.status = "completed"
        workflow_step.completed_at = datetime.utcnow()
        
        # Check if all steps are completed
        remaining_steps = db.query(SignatureWorkflow).filter(
            SignatureWorkflow.signature_request_id == signature_request_id,
            SignatureWorkflow.status == "pending"
        ).count()
        
        if remaining_steps == 0:
            signature_request.status = SignatureStatus.COMPLETED
        
        db.commit()
        db.refresh(signature)
        
        return signature
    
    async def verify_signature(self, signature_id: str, db: Session) -> bool:
        """Verify signature authenticity"""
        signature = db.query(Signature).filter(Signature.id == signature_id).first()
        
        if not signature:
            return False
        
        # Simplified verification logic
        signature.is_verified = True
        signature.verified_at = datetime.utcnow()
        db.commit()
        
        return True

# Initialize signature service
signature_service = SignatureService()

# API Endpoints
@app.post("/api/signatures/requests", response_model=SignatureRequestResponse)
async def create_signature_request(
    request_data: SignatureRequestCreate,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Create a new signature request"""
    signature_request = await signature_service.create_signature_request(
        request_data, current_user["id"], db
    )
    
    return SignatureRequestResponse(
        id=signature_request.id,
        document_id=signature_request.document_id,
        requester_id=signature_request.requester_id,
        title=signature_request.title,
        description=signature_request.description,
        signature_type=signature_request.signature_type,
        status=signature_request.status,
        expires_at=signature_request.expires_at,
        metadata=signature_request.metadata,
        created_at=signature_request.created_at,
        updated_at=signature_request.updated_at
    )

@app.get("/api/signatures/requests", response_model=List[SignatureRequestResponse])
async def get_signature_requests(
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get user's signature requests"""
    signature_requests = db.query(SignatureRequest).filter(
        SignatureRequest.requester_id == current_user["id"]
    ).all()
    
    return [
        SignatureRequestResponse(
            id=sr.id,
            document_id=sr.document_id,
            requester_id=sr.requester_id,
            title=sr.title,
            description=sr.description,
            signature_type=sr.signature_type,
            status=sr.status,
            expires_at=sr.expires_at,
            metadata=sr.metadata,
            created_at=sr.created_at,
            updated_at=sr.updated_at
        )
        for sr in signature_requests
    ]

@app.get("/api/signatures/requests/{request_id}", response_model=SignatureRequestResponse)
async def get_signature_request(
    request_id: str,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get specific signature request"""
    signature_request = db.query(SignatureRequest).filter(
        SignatureRequest.id == request_id,
        SignatureRequest.requester_id == current_user["id"]
    ).first()
    
    if not signature_request:
        raise HTTPException(status_code=404, detail="Signature request not found")
    
    return SignatureRequestResponse(
        id=signature_request.id,
        document_id=signature_request.document_id,
        requester_id=signature_request.requester_id,
        title=signature_request.title,
        description=signature_request.description,
        signature_type=signature_request.signature_type,
        status=signature_request.status,
        expires_at=signature_request.expires_at,
        metadata=signature_request.metadata,
        created_at=signature_request.created_at,
        updated_at=signature_request.updated_at
    )

@app.post("/api/signatures/requests/{request_id}/sign", response_model=SignatureResponse)
async def sign_document(
    request_id: str,
    signature_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Sign a document"""
    signature = await signature_service.sign_document(
        request_id, current_user["id"], signature_data, db
    )
    
    return SignatureResponse(
        id=signature.id,
        signature_request_id=signature.signature_request_id,
        signer_id=signature.signer_id,
        signature_type=signature.signature_type,
        signature_hash=signature.signature_hash,
        signed_at=signature.signed_at,
        verified_at=signature.verified_at,
        is_verified=signature.is_verified
    )

@app.get("/api/signatures/requests/{request_id}/workflow", response_model=List[SignatureWorkflowResponse])
async def get_signature_workflow(
    request_id: str,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get signature workflow steps"""
    workflow_steps = db.query(SignatureWorkflow).filter(
        SignatureWorkflow.signature_request_id == request_id
    ).order_by(SignatureWorkflow.step_number).all()
    
    return [
        SignatureWorkflowResponse(
            id=step.id,
            signature_request_id=step.signature_request_id,
            step_number=step.step_number,
            signer_id=step.signer_id,
            step_type=step.step_type,
            status=step.status,
            completed_at=step.completed_at,
            comments=step.comments,
            created_at=step.created_at
        )
        for step in workflow_steps
    ]

@app.post("/api/signatures/{signature_id}/verify")
async def verify_signature(
    signature_id: str,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Verify signature authenticity"""
    is_verified = await signature_service.verify_signature(signature_id, db)
    
    return {
        "signature_id": signature_id,
        "is_verified": is_verified,
        "verified_at": datetime.utcnow().isoformat()
    }

@app.get("/api/signatures/pending", response_model=List[SignatureRequestResponse])
async def get_pending_signatures(
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get documents pending user's signature"""
    # Get workflow steps where user is the signer
    workflow_steps = db.query(SignatureWorkflow).filter(
        SignatureWorkflow.signer_id == current_user["id"],
        SignatureWorkflow.status == "pending"
    ).all()
    
    request_ids = [step.signature_request_id for step in workflow_steps]
    signature_requests = db.query(SignatureRequest).filter(
        SignatureRequest.id.in_(request_ids)
    ).all()
    
    return [
        SignatureRequestResponse(
            id=sr.id,
            document_id=sr.document_id,
            requester_id=sr.requester_id,
            title=sr.title,
            description=sr.description,
            signature_type=sr.signature_type,
            status=sr.status,
            expires_at=sr.expires_at,
            metadata=sr.metadata,
            created_at=sr.created_at,
            updated_at=sr.updated_at
        )
        for sr in signature_requests
    ]

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "signature-service",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)