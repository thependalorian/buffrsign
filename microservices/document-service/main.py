"""
BuffrSign Document Service - Microservice
Handles document upload, processing, storage, and management
"""

import os
import logging
import uuid
import httpx
from datetime import datetime
from typing import Optional, Dict, Any, List
from pathlib import Path

from fastapi import FastAPI, HTTPException, status, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import aiofiles

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/buffrsign_documents")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
security = HTTPBearer()

# External service URLs
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")

app = FastAPI(
    title="BuffrSign Document Service",
    description="Document management microservice for BuffrSign",
    version="1.0.0",
)

# Database Models
class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)
    file_hash = Column(String, nullable=False, index=True)
    status = Column(String, default="uploaded")  # uploaded, processing, processed, error
    metadata = Column(JSON, default=dict)
    processing_results = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DocumentVersion(Base):
    __tablename__ = "document_versions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    file_path = Column(String, nullable=False)
    file_hash = Column(String, nullable=False)
    change_description = Column(Text)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class DocumentAccess(Base):
    __tablename__ = "document_access"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    access_type = Column(String, nullable=False)  # read, write, admin
    granted_by = Column(String, nullable=False)
    granted_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)

# Pydantic Models
class DocumentResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    status: str
    metadata: Dict[str, Any]
    processing_results: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    file_size: int
    status: str
    message: str

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int
    page: int
    page_size: int

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

# Document Service
class DocumentService:
    def __init__(self):
        self.upload_dir = Path(os.getenv("UPLOAD_DIR", "/app/uploads"))
        self.upload_dir.mkdir(exist_ok=True)
    
    async def save_file(self, file: UploadFile, user_id: str) -> Dict[str, Any]:
        """Save uploaded file to disk"""
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = self.upload_dir / unique_filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        return {
            "filename": unique_filename,
            "file_path": str(file_path),
            "file_size": len(content),
            "mime_type": file.content_type or "application/octet-stream",
            "file_hash": str(hash(content))  # Simple hash for demo
        }
    
    async def process_document(self, document_id: str, db: Session):
        """Process document for signature preparation"""
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            return
        
        try:
            # Update status to processing
            document.status = "processing"
            db.commit()
            
            # Simulate document processing
            processing_results = {
                "pages_count": 1,
                "text_extracted": True,
                "signature_fields_detected": ["signature_1", "date_1"],
                "compliance_checked": True,
                "processed_at": datetime.utcnow().isoformat()
            }
            
            document.processing_results = processing_results
            document.status = "processed"
            db.commit()
            
        except Exception as e:
            logger.error(f"Error processing document {document_id}: {e}")
            document.status = "error"
            document.processing_results = {"error": str(e)}
            db.commit()

# Initialize document service
document_service = DocumentService()

# API Endpoints
@app.post("/api/documents/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Upload a new document"""
    try:
        # Save file
        file_info = await document_service.save_file(file, current_user["id"])
        
        # Create document record
        document = Document(
            user_id=current_user["id"],
            filename=file_info["filename"],
            original_filename=file.filename,
            file_path=file_info["file_path"],
            file_size=file_info["file_size"],
            mime_type=file_info["mime_type"],
            file_hash=file_info["file_hash"],
            metadata={"description": description} if description else {}
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        # Start processing
        await document_service.process_document(document.id, db)
        
        return DocumentUploadResponse(
            document_id=document.id,
            filename=document.filename,
            file_size=document.file_size,
            status=document.status,
            message="Document uploaded successfully"
        )
        
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload document")

@app.get("/api/documents", response_model=DocumentListResponse)
async def get_documents(
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get user's documents"""
    query = db.query(Document).filter(Document.user_id == current_user["id"])
    
    if status_filter:
        query = query.filter(Document.status == status_filter)
    
    total = query.count()
    documents = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return DocumentListResponse(
        documents=[
            DocumentResponse(
                id=doc.id,
                user_id=doc.user_id,
                filename=doc.filename,
                original_filename=doc.original_filename,
                file_size=doc.file_size,
                mime_type=doc.mime_type,
                status=doc.status,
                metadata=doc.metadata,
                processing_results=doc.processing_results,
                created_at=doc.created_at,
                updated_at=doc.updated_at
            )
            for doc in documents
        ],
        total=total,
        page=page,
        page_size=page_size
    )

@app.get("/api/documents/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get specific document"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user["id"]
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return DocumentResponse(
        id=document.id,
        user_id=document.user_id,
        filename=document.filename,
        original_filename=document.original_filename,
        file_size=document.file_size,
        mime_type=document.mime_type,
        status=document.status,
        metadata=document.metadata,
        processing_results=document.processing_results,
        created_at=document.created_at,
        updated_at=document.updated_at
    )

@app.get("/api/documents/{document_id}/download")
async def download_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Download document file"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user["id"]
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    file_path = Path(document.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return {
        "file_path": str(file_path),
        "filename": document.original_filename,
        "mime_type": document.mime_type
    }

@app.delete("/api/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Delete document"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user["id"]
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete file from disk
    file_path = Path(document.file_path)
    if file_path.exists():
        file_path.unlink()
    
    # Delete from database
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}

@app.post("/api/documents/{document_id}/process")
async def reprocess_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Reprocess document"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user["id"]
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    await document_service.process_document(document_id, db)
    
    return {"message": "Document reprocessing started"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "document-service",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)