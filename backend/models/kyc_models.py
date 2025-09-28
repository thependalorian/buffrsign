"""
KYC System Models for BuffrSign (Unified Schema)

Defines models for KYC workflows, SADC countries, and related entities, aligning with the unified schema.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum
import uuid

# Enums from the unified schema
class KYCWorkflowState(str, Enum):
    INITIALIZED = 'initialized'
    DOCUMENT_UPLOADED = 'document_uploaded'
    OCR_EXTRACTION_COMPLETE = 'ocr_extraction_complete'
    AI_COUNTRY_DETECTION = 'ai_country_detection'
    AI_FIELD_EXTRACTION = 'ai_field_extraction'
    SADC_VALIDATION = 'sadc_validation'
    COMPLIANCE_CHECKED = 'compliance_checked'
    AUTO_APPROVED = 'auto_approved'
    AUTO_REJECTED = 'auto_rejected'
    MANUAL_REVIEW = 'manual_review'
    COMPLETED = 'completed'
    FAILED = 'failed'
    EXPIRED = 'expired'

class KYCDecision(str, Enum):
    APPROVED = 'approved'
    REJECTED = 'rejected'
    PENDING = 'pending'
    REQUIRES_REVIEW = 'requires_review'


# Unified KYC Models
class SADCCountry(BaseModel):
    id: int
    country_code: str
    country_name: str
    id_format_type: Optional[str] = None
    id_regex_patterns: Optional[List[str]] = None
    date_format: Optional[str] = None
    keywords: Optional[List[str]] = None
    validation_rules: Optional[Dict[str, Any]] = None
    is_active: bool = True

    class Config:
        from_attributes = True

class KYCWorkflow(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    bfr_sign_id: Optional[str] = None
    workflow_state: KYCWorkflowState = KYCWorkflowState.INITIALIZED
    detected_country_code: Optional[str] = None
    final_decision: Optional[KYCDecision] = None
    decision_confidence: Optional[float] = None
    rejection_reasons: Optional[List[str]] = None
    processing_time_ms: Optional[int] = None
    total_confidence: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class KYCDocument(BaseModel):
    id: uuid.UUID
    workflow_id: uuid.UUID
    user_id: uuid.UUID
    document_type: str
    file_url: str
    storage_provider: str = 'supabase'
    upload_timestamp: datetime
    is_primary: bool = False

    class Config:
        from_attributes = True

class KYCAnalysisStep(BaseModel):
    id: int
    workflow_id: uuid.UUID
    step_name: str
    step_order: int
    status: str = 'pending'
    ai_method: Optional[str] = None
    confidence_score: Optional[float] = None
    processing_time_ms: Optional[int] = None
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    error_details: Optional[Dict[str, Any]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ExtractedIDFields(BaseModel):
    workflow_id: uuid.UUID
    id_number: Optional[str] = None
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    place_of_birth: Optional[str] = None
    address: Optional[str] = None
    confidence_score: Optional[float] = None

    class Config:
        from_attributes = True
