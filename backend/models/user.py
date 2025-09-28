"""
User model for BuffrSign (Unified Schema)

Defines the User model that aligns with the unified database schema.
"""

from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr
from enum import Enum
import uuid

# Enums from the unified schema
class UserRole(str, Enum):
    INDIVIDUAL = 'individual'
    SME_USER = 'sme_user'
    ENTERPRISE_USER = 'enterprise_user'
    ADMIN = 'admin'
    SYSTEM_USER = 'system_user'

class UserStatus(str, Enum):
    ACTIVE = 'active'
    INACTIVE = 'inactive'
    SUSPENDED = 'suspended'
    PENDING_VERIFICATION = 'pending_verification'
    ARCHIVED = 'archived'

class SubscriptionPlan(str, Enum):
    FREE = 'free'
    BASIC = 'basic'
    PREMIUM = 'premium'
    ENTERPRISE = 'enterprise'
    CUSTOM = 'custom'


# Core User and Profile Models
class User(BaseModel):
    id: uuid.UUID
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole = UserRole.INDIVIDUAL
    status: UserStatus = UserStatus.PENDING_VERIFICATION
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Profile(BaseModel):
    id: uuid.UUID
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    website: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    timezone: str = 'UTC'
    language: str = 'en'
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserPreferences(BaseModel):
    user_id: uuid.UUID
    email_notifications: bool = True
    sms_notifications: bool = False
    push_notifications: bool = True
    two_factor_enabled: bool = False
    privacy_level: str = 'standard'
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

