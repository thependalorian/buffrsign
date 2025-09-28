"""
Audit Log Models for BuffrSign (Unified Schema)

Defines models for audit logs and BFR-SIGN-IDs, aligning with the unified schema.
"""

from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum
import uuid

# Enums from the unified schema
class AuditEventType(str, Enum):
    USER_REGISTRATION = 'user_registration'
    USER_LOGIN = 'user_login'
    USER_LOGOUT = 'user_logout'
    PASSWORD_CHANGE = 'password_change'
    PROFILE_UPDATE = 'profile_update'
    KYC_VERIFICATION = 'kyc_verification'
    DOCUMENT_UPLOAD = 'document_upload'
    DOCUMENT_VIEW = 'document_view'
    DOCUMENT_DELETE = 'document_delete'
    SIGNATURE_CREATED = 'signature_created'
    SIGNATURE_VERIFIED = 'signature_verified'
    WORKFLOW_CREATED = 'workflow_created'
    WORKFLOW_COMPLETED = 'workflow_completed'
    WORKFLOW_CANCELED = 'workflow_canceled'
    SECURITY_EVENT = 'security_event'
    COMPLIANCE_CHECK = 'compliance_check'
    API_KEY_CREATED = 'api_key_created'
    API_KEY_DELETED = 'api_key_deleted'
    SYSTEM_CONFIG_CHANGE = 'system_config_change'
    DATA_EXPORT = 'data_export'
    REPORT_GENERATED = 'report_generated'

class AuditSeverity(str, Enum):
    INFO = 'info'
    WARNING = 'warning'
    ERROR = 'error'
    CRITICAL = 'critical'
    SECURITY = 'security'


# Unified Audit Log and BFR-SIGN-ID Models
class BFRSignID(BaseModel):
    id: str
    user_id: uuid.UUID
    country_code: str
    national_id_hash: str
    kyc_status: str = 'pending'
    created_at: datetime
    verified_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AuditLog(BaseModel):
    id: int
    bfr_sign_id: Optional[str] = None
    user_id: Optional[uuid.UUID] = None
    organization_id: Optional[uuid.UUID] = None
    event_type: AuditEventType
    severity: AuditSeverity = AuditSeverity.INFO
    event_time: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_fingerprint: Optional[str] = None
    correlation_id: Optional[str] = None
    event_description: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    previous_hash: Optional[str] = None
    current_hash: str

    class Config:
        from_attributes = True
