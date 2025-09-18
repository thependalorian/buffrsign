"""
Document and Signature Models for BuffrSign

Defines comprehensive models for documents, signatures, audit trails,
and related entities for the backend implementation.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum
import uuid


class DocumentType(str, Enum):
    """Document types"""
    CONTRACT = "contract"
    AGREEMENT = "agreement"
    FORM = "form"
    CERTIFICATE = "certificate"
    REPORT = "report"
    TEMPLATE = "template"


class DocumentStatus(str, Enum):
    """Document status"""
    DRAFT = "draft"
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class SignatureType(str, Enum):
    """Electronic signature types as defined in ETA 2019 and eIDAS"""
    SIMPLE = "simple"

    QUALIFIED = "qualified"


class SignatureStatus(str, Enum):
            """Signature status tracking"""
    PENDING = "pending"
    SIGNED = "signed"
    VERIFIED = "verified"
    REVOKED = "revoked"
    EXPIRED = "expired"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"


class FieldType(str, Enum):
    """Document field types"""
    SIGNATURE = "signature"
    TEXT = "text"
    DATE = "date"
    CHECKBOX = "checkbox"
    DROPDOWN = "dropdown"


class RiskLevel(str, Enum):
    """Risk assessment levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ComplianceStandard(str, Enum):
    """International compliance standards"""
    ETA_2019 = "eta_2019"
    EIDAS = "eidas"
    ESIGN_ACT = "esign_act"
    UETA = "ueta"
    POPIA = "popia"
    GDPR = "gdpr"


class DocumentField(BaseModel):
    """Document field model"""
    id: Optional[str] = None
    name: str
    field_type: FieldType
    position_x: Optional[int] = None
    position_y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    page_number: int = 1
    is_required: bool = True
    default_value: Optional[str] = None
    validation_rules: Optional[Dict[str, Any]] = None


class DocumentCreate(BaseModel):
    """Model for creating a new document"""
    title: str
    content: Optional[str] = None
    document_type: DocumentType
    category: Optional[str] = None
    description: Optional[str] = None
    fields: Optional[List[DocumentField]] = None
    expires_at: Optional[datetime] = None


class DocumentUpdate(BaseModel):
    """Model for updating document information"""
    title: Optional[str] = None
    content: Optional[str] = None
    document_type: Optional[DocumentType] = None
    category: Optional[str] = None
    description: Optional[str] = None
    status: Optional[DocumentStatus] = None
    fields: Optional[List[DocumentField]] = None
    expires_at: Optional[datetime] = None


class Document(BaseModel):
            """Document model"""
    id: str
    title: str
    content: Optional[str] = None
    document_type: DocumentType
    file_path: Optional[str] = None
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    initiator_id: str
    status: DocumentStatus = DocumentStatus.DRAFT
    compliance_score: float = 0.0
    risk_level: RiskLevel = RiskLevel.LOW
    eta_compliant: bool = False
    cran_accredited: bool = False
    category: Optional[str] = None
    description: Optional[str] = None
    ai_analysis: Optional[Dict[str, Any]] = None
    analysis_status: str = "pending"
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class SignatureRequest(BaseModel):
    """Model for signature request"""
    document_id: str
    signer_email: str
    signature_type: SignatureType = SignatureType.SIMPLE
    message: Optional[str] = None
    redirect_url: Optional[str] = None
    expires_at: Optional[datetime] = None


class SignatureRequestCreate(SignatureRequest):
    """Model for creating signature request"""
    pass


class SignatureRequestUpdate(BaseModel):
    """Model for updating signature request"""
    status: Optional[SignatureStatus] = None
    signature_data: Optional[str] = None
    message: Optional[str] = None
    redirect_url: Optional[str] = None
    expires_at: Optional[datetime] = None


class SignatureRequestResponse(BaseModel):
            """Signature request response model"""
    id: str
    document_id: str
    requester_id: str
    signer_email: str
    signature_type: SignatureType
    message: Optional[str] = None
    redirect_url: Optional[str] = None
    status: SignatureStatus = SignatureStatus.PENDING
    signature_data: Optional[str] = None
    signed_at: Optional[datetime] = None
    notification_sent: bool = False
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class Signature(BaseModel):
            """Signature model"""
    id: str
    document_id: str
    field_id: str
    signer_id: str
    signature_data: str
    signature_type: SignatureType = SignatureType.SIMPLE
    signature_method: str = "draw"
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    location_data: Optional[Dict[str, Any]] = None
    device_info: Optional[Dict[str, Any]] = None
    verification_status: str = "pending"
    verification_score: float = 0.0
    signed_at: datetime
    verified_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class DocumentRecipient(BaseModel):
    """Document recipient model"""
    id: str
    document_id: str
    email: str
    name: Optional[str] = None
    role: str = "signer"
    signing_order: int = 1
    status: str = "pending"
    invitation_sent_at: Optional[datetime] = None
    viewed_at: Optional[datetime] = None
    signed_at: Optional[datetime] = None
    declined_at: Optional[datetime] = None
    decline_reason: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class AuditTrailEntry(BaseModel):
    """Audit trail entry model"""
    id: str
    signature_id: Optional[str] = None
    document_id: Optional[str] = None
    action: str
    user_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime
    audit_hash: Optional[str] = None
    previous_hash: Optional[str] = None
    merkle_root: Optional[str] = None
    
    class Config:
        from_attributes = True


class Template(BaseModel):
    """Document template model"""
    id: str
    user_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    content: str
    ai_generated: bool = False
    public: bool = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TemplateCreate(BaseModel):
    """Model for creating a template"""
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    content: str
    public: bool = False


class ComplianceReport(BaseModel):
    """Compliance report model"""
    id: str
    document_id: str
    signature_id: Optional[str] = None
    report_type: ComplianceStandard
    compliance_data: Dict[str, Any]
    generated_by: str
    generated_at: datetime
    valid_until: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class AIAnalysis(BaseModel):
    """AI analysis result model"""
    signature_fields: Optional[List[Dict[str, Any]]] = None
    compliance_issues: Optional[List[str]] = None
    summary: Optional[str] = None
    risk_assessment: Optional[Dict[str, Any]] = None
    recommendations: Optional[List[str]] = None
    analyzed_at: datetime


class DocumentUpload(BaseModel):
    """Document upload model"""
    name: str
    description: Optional[str] = None
    category: Optional[str] = None


class AIAnalysisRequest(BaseModel):
    """AI analysis request model"""
    document_id: str
    analysis_type: str = "full"  # full, compliance, fields


class DocumentResponse(BaseModel):
    """Document response model with related data"""
    document: Document
    fields: Optional[List[DocumentField]] = None
    signatures: Optional[List[Signature]] = None
    recipients: Optional[List[DocumentRecipient]] = None
    audit_trail: Optional[List[AuditTrailEntry]] = None
    compliance_report: Optional[ComplianceReport] = None
    ai_analysis: Optional[AIAnalysis] = None
