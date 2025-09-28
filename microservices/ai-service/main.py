"""
BuffrSign AI Service - Microservice
Handles AI/ML operations, document analysis, compliance checking, and intelligent workflows
"""

import os
import logging
import uuid
import httpx
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum

from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import openai
from groq import Groq
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/buffrsign_ai")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
security = HTTPBearer()

# External service URLs
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
DOCUMENT_SERVICE_URL = os.getenv("DOCUMENT_SERVICE_URL", "http://localhost:8002")

# AI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize AI clients
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)

# Enums
class AnalysisType(str, Enum):
    DOCUMENT_ANALYSIS = "document_analysis"
    COMPLIANCE_CHECK = "compliance_check"
    SIGNATURE_DETECTION = "signature_detection"
    TEXT_EXTRACTION = "text_extraction"
    CLASSIFICATION = "classification"

class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

app = FastAPI(
    title="BuffrSign AI Service",
    description="AI/ML operations microservice for BuffrSign",
    version="1.0.0",
)

# Database Models
class AIAnalysis(Base):
    __tablename__ = "ai_analyses"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, nullable=False, index=True)
    analysis_type = Column(String, nullable=False)
    status = Column(String, default=AnalysisStatus.PENDING)
    input_data = Column(JSON, default=dict)
    results = Column(JSON, default=dict)
    confidence_score = Column(Integer)  # 0-100
    processing_time_ms = Column(Integer)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

class AIWorkflow(Base):
    __tablename__ = "ai_workflows"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text)
    workflow_steps = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AIWorkflowExecution(Base):
    __tablename__ = "ai_workflow_executions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String, nullable=False, index=True)
    document_id = Column(String, nullable=False, index=True)
    status = Column(String, default=AnalysisStatus.PENDING)
    execution_data = Column(JSON, default=dict)
    results = Column(JSON, default=dict)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

# Pydantic Models
class AnalysisRequest(BaseModel):
    document_id: str
    analysis_type: AnalysisType
    parameters: Dict[str, Any] = {}

class AnalysisResponse(BaseModel):
    id: str
    document_id: str
    analysis_type: str
    status: str
    results: Dict[str, Any]
    confidence_score: Optional[int]
    processing_time_ms: Optional[int]
    created_at: datetime
    completed_at: Optional[datetime]

class ChatRequest(BaseModel):
    message: str
    context: Dict[str, Any] = {}
    model: str = "gpt-3.5-turbo"

class ChatResponse(BaseModel):
    response: str
    model: str
    usage: Dict[str, Any]
    timestamp: datetime

class ComplianceCheckRequest(BaseModel):
    document_id: str
    compliance_standard: str = "ETA-2019"
    check_types: List[str] = ["signature_requirements", "data_protection", "legal_validity"]

class ComplianceCheckResponse(BaseModel):
    document_id: str
    compliance_standard: str
    overall_compliant: bool
    compliance_score: int
    checks: List[Dict[str, Any]]
    recommendations: List[str]
    timestamp: datetime

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

# AI Service
class AIService:
    def __init__(self):
        self.openai_client = openai if OPENAI_API_KEY else None
        self.groq_client = groq_client if GROQ_API_KEY else None
    
    async def analyze_document(self, document_id: str, analysis_type: AnalysisType, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze document using AI"""
        try:
            # Get document from document service
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{DOCUMENT_SERVICE_URL}/api/documents/{document_id}",
                    headers={"Authorization": f"Bearer {os.getenv('INTERNAL_TOKEN', 'internal')}"}
                )
                if response.status_code != 200:
                    raise HTTPException(status_code=404, detail="Document not found")
                
                document_data = response.json()
            
            # Perform analysis based on type
            if analysis_type == AnalysisType.DOCUMENT_ANALYSIS:
                return await self._analyze_document_content(document_data)
            elif analysis_type == AnalysisType.COMPLIANCE_CHECK:
                return await self._check_compliance(document_data, parameters)
            elif analysis_type == AnalysisType.SIGNATURE_DETECTION:
                return await self._detect_signature_fields(document_data)
            elif analysis_type == AnalysisType.TEXT_EXTRACTION:
                return await self._extract_text(document_data)
            elif analysis_type == AnalysisType.CLASSIFICATION:
                return await self._classify_document(document_data, parameters)
            else:
                raise HTTPException(status_code=400, detail="Unsupported analysis type")
                
        except Exception as e:
            logger.error(f"Error analyzing document {document_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    
    async def _analyze_document_content(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze document content using AI"""
        # Simulate AI analysis
        return {
            "document_type": "contract",
            "language": "english",
            "key_entities": ["signature", "date", "amount"],
            "sentiment": "neutral",
            "complexity_score": 75,
            "recommended_actions": ["review_signature_fields", "verify_dates"]
        }
    
    async def _check_compliance(self, document_data: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Check document compliance"""
        compliance_standard = parameters.get("compliance_standard", "ETA-2019")
        
        # Simulate compliance check
        return {
            "compliance_standard": compliance_standard,
            "overall_compliant": True,
            "compliance_score": 85,
            "checks": [
                {"check": "signature_requirements", "passed": True, "score": 90},
                {"check": "data_protection", "passed": True, "score": 80},
                {"check": "legal_validity", "passed": True, "score": 85}
            ],
            "recommendations": [
                "Ensure all required signatures are present",
                "Verify document retention policies"
            ]
        }
    
    async def _detect_signature_fields(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect signature fields in document"""
        # Simulate signature detection
        return {
            "signature_fields": [
                {"field": "signature_1", "location": {"x": 100, "y": 200}, "confidence": 95},
                {"field": "date_1", "location": {"x": 150, "y": 250}, "confidence": 90}
            ],
            "total_fields": 2,
            "detection_confidence": 92
        }
    
    async def _extract_text(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract text from document"""
        # Simulate text extraction
        return {
            "extracted_text": "This is a sample document text extracted using AI...",
            "text_length": 150,
            "language": "english",
            "confidence": 88
        }
    
    async def _classify_document(self, document_data: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Classify document type"""
        # Simulate document classification
        return {
            "document_type": "contract",
            "subtype": "service_agreement",
            "confidence": 92,
            "categories": ["legal", "business", "contract"],
            "risk_level": "medium"
        }
    
    async def chat_completion(self, message: str, context: Dict[str, Any], model: str = "gpt-3.5-turbo") -> Dict[str, Any]:
        """Generate chat completion using AI"""
        try:
            if model.startswith("gpt") and self.openai_client:
                response = await self.openai_client.ChatCompletion.acreate(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are a helpful AI assistant for BuffrSign, a digital signature platform."},
                        {"role": "user", "content": message}
                    ],
                    max_tokens=500
                )
                
                return {
                    "response": response.choices[0].message.content,
                    "model": model,
                    "usage": response.usage,
                    "timestamp": datetime.utcnow()
                }
            
            elif model.startswith("llama") and self.groq_client:
                response = self.groq_client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are a helpful AI assistant for BuffrSign, a digital signature platform."},
                        {"role": "user", "content": message}
                    ],
                    max_tokens=500
                )
                
                return {
                    "response": response.choices[0].message.content,
                    "model": model,
                    "usage": response.usage,
                    "timestamp": datetime.utcnow()
                }
            
            else:
                # Fallback response
                return {
                    "response": "I'm a BuffrSign AI assistant. How can I help you with digital signatures today?",
                    "model": "fallback",
                    "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
                    "timestamp": datetime.utcnow()
                }
                
        except Exception as e:
            logger.error(f"Error in chat completion: {e}")
            raise HTTPException(status_code=500, detail=f"Chat completion failed: {str(e)}")

# Initialize AI service
ai_service = AIService()

# API Endpoints
@app.post("/api/ai/analyze", response_model=AnalysisResponse)
async def analyze_document(
    analysis_request: AnalysisRequest,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Analyze document using AI"""
    start_time = datetime.utcnow()
    
    # Create analysis record
    analysis = AIAnalysis(
        document_id=analysis_request.document_id,
        analysis_type=analysis_request.analysis_type,
        status=AnalysisStatus.PROCESSING,
        input_data=analysis_request.parameters
    )
    
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    try:
        # Perform analysis
        results = await ai_service.analyze_document(
            analysis_request.document_id,
            analysis_request.analysis_type,
            analysis_request.parameters
        )
        
        # Update analysis record
        analysis.status = AnalysisStatus.COMPLETED
        analysis.results = results
        analysis.confidence_score = results.get("confidence", 0)
        analysis.completed_at = datetime.utcnow()
        analysis.processing_time_ms = int((analysis.completed_at - start_time).total_seconds() * 1000)
        
        db.commit()
        
        return AnalysisResponse(
            id=analysis.id,
            document_id=analysis.document_id,
            analysis_type=analysis.analysis_type,
            status=analysis.status,
            results=analysis.results,
            confidence_score=analysis.confidence_score,
            processing_time_ms=analysis.processing_time_ms,
            created_at=analysis.created_at,
            completed_at=analysis.completed_at
        )
        
    except Exception as e:
        # Update analysis record with error
        analysis.status = AnalysisStatus.FAILED
        analysis.error_message = str(e)
        analysis.completed_at = datetime.utcnow()
        analysis.processing_time_ms = int((analysis.completed_at - start_time).total_seconds() * 1000)
        
        db.commit()
        
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/ai/chat", response_model=ChatResponse)
async def chat_completion(
    chat_request: ChatRequest,
    current_user: Dict[str, Any] = Depends(verify_token)
):
    """Generate AI chat completion"""
    result = await ai_service.chat_completion(
        chat_request.message,
        chat_request.context,
        chat_request.model
    )
    
    return ChatResponse(
        response=result["response"],
        model=result["model"],
        usage=result["usage"],
        timestamp=result["timestamp"]
    )

@app.post("/api/ai/compliance/check", response_model=ComplianceCheckResponse)
async def check_compliance(
    compliance_request: ComplianceCheckRequest,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Check document compliance"""
    # Create analysis record
    analysis = AIAnalysis(
        document_id=compliance_request.document_id,
        analysis_type=AnalysisType.COMPLIANCE_CHECK,
        status=AnalysisStatus.PROCESSING,
        input_data={
            "compliance_standard": compliance_request.compliance_standard,
            "check_types": compliance_request.check_types
        }
    )
    
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    try:
        # Perform compliance check
        results = await ai_service.analyze_document(
            compliance_request.document_id,
            AnalysisType.COMPLIANCE_CHECK,
            {
                "compliance_standard": compliance_request.compliance_standard,
                "check_types": compliance_request.check_types
            }
        )
        
        # Update analysis record
        analysis.status = AnalysisStatus.COMPLETED
        analysis.results = results
        analysis.confidence_score = results.get("compliance_score", 0)
        analysis.completed_at = datetime.utcnow()
        
        db.commit()
        
        return ComplianceCheckResponse(
            document_id=compliance_request.document_id,
            compliance_standard=results["compliance_standard"],
            overall_compliant=results["overall_compliant"],
            compliance_score=results["compliance_score"],
            checks=results["checks"],
            recommendations=results["recommendations"],
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        # Update analysis record with error
        analysis.status = AnalysisStatus.FAILED
        analysis.error_message = str(e)
        analysis.completed_at = datetime.utcnow()
        
        db.commit()
        
        raise HTTPException(status_code=500, detail=f"Compliance check failed: {str(e)}")

@app.get("/api/ai/analyses", response_model=List[AnalysisResponse])
async def get_analyses(
    document_id: Optional[str] = None,
    analysis_type: Optional[AnalysisType] = None,
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get AI analyses"""
    query = db.query(AIAnalysis)
    
    if document_id:
        query = query.filter(AIAnalysis.document_id == document_id)
    
    if analysis_type:
        query = query.filter(AIAnalysis.analysis_type == analysis_type)
    
    analyses = query.order_by(AIAnalysis.created_at.desc()).limit(limit).all()
    
    return [
        AnalysisResponse(
            id=analysis.id,
            document_id=analysis.document_id,
            analysis_type=analysis.analysis_type,
            status=analysis.status,
            results=analysis.results,
            confidence_score=analysis.confidence_score,
            processing_time_ms=analysis.processing_time_ms,
            created_at=analysis.created_at,
            completed_at=analysis.completed_at
        )
        for analysis in analyses
    ]

@app.get("/api/ai/models")
async def get_available_models(
    current_user: Dict[str, Any] = Depends(verify_token)
):
    """Get available AI models"""
    models = []
    
    if OPENAI_API_KEY:
        models.extend([
            {"name": "gpt-3.5-turbo", "provider": "openai", "type": "chat"},
            {"name": "gpt-4", "provider": "openai", "type": "chat"},
            {"name": "gpt-4-turbo", "provider": "openai", "type": "chat"}
        ])
    
    if GROQ_API_KEY:
        models.extend([
            {"name": "llama-3-8b-8192", "provider": "groq", "type": "chat"},
            {"name": "llama-3-70b-8192", "provider": "groq", "type": "chat"},
            {"name": "mixtral-8x7b-32768", "provider": "groq", "type": "chat"}
        ])
    
    return {
        "models": models,
        "default_model": "gpt-3.5-turbo" if OPENAI_API_KEY else "llama-3-8b-8192"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-service",
        "timestamp": datetime.utcnow().isoformat(),
        "ai_providers": {
            "openai": OPENAI_API_KEY is not None,
            "groq": GROQ_API_KEY is not None
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)