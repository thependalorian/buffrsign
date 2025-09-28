"""
Document and File Management Models for BuffrSign (Unified Schema)

Defines models for documents, file versions, and access control, aligning with the unified schema.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum
import uuid

# Enum from the unified schema
class DocumentStatus(str, Enum):
    DRAFT = 'draft'
    ACTIVE = 'active'
    ARCHIVED = 'archived'
    DELETED = 'deleted'

# Unified Document and File Models
class Document(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    organization_id: Optional[uuid.UUID] = None
    name: str
    description: Optional[str] = None
    status: DocumentStatus = DocumentStatus.DRAFT
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FileStorageProvider(BaseModel):
    id: int
    name: str
    config: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class FileVersion(BaseModel):
    id: uuid.UUID
    document_id: uuid.UUID
    version_number: int
    file_path: str
    file_size_bytes: Optional[int] = None
    mime_type: Optional[str] = None
    storage_provider_id: int
    storage_metadata: Optional[Dict[str, Any]] = None
    created_by: Optional[uuid.UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentAccess(BaseModel):
    document_id: uuid.UUID
    user_id: uuid.UUID
    permission: str

    class Config:
        from_attributes = True

# Simplified Signature Models (to be expanded later)
class Signature(BaseModel):
    id: uuid.UUID
    document_id: uuid.UUID
    signer_id: uuid.UUID
    signature_data: str # This could be a path to a signature image or a digital signature string
    signed_at: datetime

    class Config:
        from_attributes = True

class SignatureRequest(BaseModel):
    document_id: uuid.UUID
    signer_email: str
    message: Optional[str] = None
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True
