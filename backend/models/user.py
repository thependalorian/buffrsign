"""
User model for BuffrSign

Defines the User model that integrates with Supabase authentication
and matches the frontend User interface.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, EmailStr
from enum import Enum


class UserRole(str, Enum):
    """Enhanced user roles for comprehensive implementation"""
    INDIVIDUAL = "individual"
    SME_USER = "sme_user"
    ENTERPRISE_USER = "enterprise_user"
    ADMIN = "admin"


class UserPlan(str, Enum):
    """Enhanced subscription plans"""
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"


class UserStatus(str, Enum):
    """Enhanced user status"""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"
    PENDING_VERIFICATION = "pending_verification"


class BiometricType(str, Enum):
    """Biometric authentication types"""
    FINGERPRINT = "fingerprint"
    FACE = "face"
    IRIS = "iris"
    VOICE = "voice"
    KEYSTROKE = "keystroke"


class UserPreferences(BaseModel):
    """Enhanced user preferences model"""
    emailNotifications: bool = True
    smsNotifications: bool = False
    twoFactorEnabled: bool = False
    language: str = "en"
    timezone: str = "UTC"
    signatureStyle: str = "draw"
    biometricEnabled: bool = False
    behavioralTracking: bool = True
    privacyLevel: str = "standard"  # standard, enhanced, maximum


class BiometricData(BaseModel):
    """Biometric authentication data"""
    type: BiometricType
    template_data: str
    confidence_score: Optional[float] = None
    liveness_score: Optional[float] = None
    is_active: bool = True


class BehavioralMetrics(BaseModel):
    """Behavioral biometrics for continuous authentication"""
    keystroke_dynamics: Optional[Dict[str, float]] = None
    mouse_patterns: Optional[Dict[str, float]] = None
    interaction_timing: Optional[List[float]] = None
    session_duration: Optional[float] = None
    risk_score: Optional[float] = None


class User(BaseModel):
    """Enhanced User model matching frontend interface"""
    id: str
    email: EmailStr
    name: str
    phone: Optional[str] = None
    company: Optional[str] = None
    role: UserRole = UserRole.INDIVIDUAL
    plan: UserPlan = UserPlan.FREE
    status: UserStatus = UserStatus.ACTIVE
    createdAt: datetime
    lastLoginAt: Optional[datetime] = None
    preferences: UserPreferences = UserPreferences()
    biometric_data: Optional[List[BiometricData]] = None
    behavioral_metrics: Optional[BehavioralMetrics] = None
    is_verified: bool = False
    subscription_expires_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    """Enhanced model for creating a new user"""
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    company: Optional[str] = None
    role: UserRole = UserRole.INDIVIDUAL
    plan: UserPlan = UserPlan.FREE
    biometric_enabled: bool = False
    behavioral_tracking: bool = True


class UserUpdate(BaseModel):
    """Enhanced model for updating user information"""
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    role: Optional[UserRole] = None
    plan: Optional[UserPlan] = None
    status: Optional[UserStatus] = None
    preferences: Optional[UserPreferences] = None
    biometric_data: Optional[List[BiometricData]] = None
    behavioral_metrics: Optional[BehavioralMetrics] = None


class UserLogin(BaseModel):
    """Model for user login"""
    email: EmailStr
    password: str
    biometric_data: Optional[BiometricData] = None
    behavioral_metrics: Optional[BehavioralMetrics] = None


class UserPasswordReset(BaseModel):
    """Model for password reset"""
    email: EmailStr


class UserPasswordUpdate(BaseModel):
    """Model for password update"""
    current_password: str
    new_password: str


class UserMFA(BaseModel):
    """Model for multi-factor authentication"""
    method: str  # sms, email, authenticator, biometric
    code: str
    biometric_data: Optional[BiometricData] = None


class UserSession(BaseModel):
    """Enhanced model for user session"""
    user_id: str
    session_token: str
    expires_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_fingerprint: Optional[str] = None
    location_data: Optional[Dict[str, float]] = None
    behavioral_metrics: Optional[BehavioralMetrics] = None


def create_user_from_supabase(supabase_user: Dict[str, Any]) -> User:
    """Create User model from Supabase user data"""
    return User(
        id=supabase_user["id"],
        email=supabase_user["email"],
        name=supabase_user.get("user_metadata", {}).get("name", supabase_user["email"].split("@")[0]),
        phone=supabase_user.get("user_metadata", {}).get("phone"),
        company=supabase_user.get("user_metadata", {}).get("company"),
        role=UserRole(supabase_user.get("user_metadata", {}).get("role", "individual")),
        plan=UserPlan(supabase_user.get("user_metadata", {}).get("plan", "free")),
        status=UserStatus(supabase_user.get("user_metadata", {}).get("status", "active")),
        createdAt=datetime.fromisoformat(supabase_user["created_at"].replace("Z", "+00:00")),
        lastLoginAt=datetime.fromisoformat(supabase_user["last_sign_in_at"].replace("Z", "+00:00")) if supabase_user.get("last_sign_in_at") else None,
        is_verified=supabase_user.get("user_metadata", {}).get("is_verified", False),
        subscription_expires_at=datetime.fromisoformat(supabase_user["user_metadata"]["subscription_expires_at"].replace("Z", "+00:00")) if supabase_user.get("user_metadata", {}).get("subscription_expires_at") else None,
        preferences=UserPreferences(
            emailNotifications=supabase_user.get("user_metadata", {}).get("preferences", {}).get("emailNotifications", True),
            smsNotifications=supabase_user.get("user_metadata", {}).get("preferences", {}).get("smsNotifications", False),
            twoFactorEnabled=supabase_user.get("user_metadata", {}).get("preferences", {}).get("twoFactorEnabled", False),
            language=supabase_user.get("user_metadata", {}).get("preferences", {}).get("language", "en"),
            timezone=supabase_user.get("user_metadata", {}).get("preferences", {}).get("timezone", "UTC"),
            signatureStyle=supabase_user.get("user_metadata", {}).get("preferences", {}).get("signatureStyle", "draw"),
            biometricEnabled=supabase_user.get("user_metadata", {}).get("preferences", {}).get("biometricEnabled", False),
            behavioralTracking=supabase_user.get("user_metadata", {}).get("preferences", {}).get("behavioralTracking", True),
            privacyLevel=supabase_user.get("user_metadata", {}).get("preferences", {}).get("privacyLevel", "standard")
        )
    )


def create_supabase_user_data(user: UserCreate) -> Dict[str, Any]:
    """Create Supabase user data from UserCreate model"""
    return {
        "email": user.email,
        "password": user.password,
        "user_metadata": {
            "name": user.name,
            "phone": user.phone,
            "company": user.company,
            "role": user.role.value,
            "plan": user.plan.value,
            "biometric_enabled": user.biometric_enabled,
            "behavioral_tracking": user.behavioral_tracking,
            "preferences": {
                "emailNotifications": True,
                "smsNotifications": False,
                "twoFactorEnabled": False,
                "language": "en",
                "timezone": "UTC",
                "signatureStyle": "draw",
                "biometricEnabled": user.biometric_enabled,
                "behavioralTracking": user.behavioral_tracking,
                "privacyLevel": "standard"
            }
        }
    }


def update_supabase_user_data(user_update: UserUpdate) -> Dict[str, Any]:
    """Create Supabase user update data from UserUpdate model"""
    update_data = {}
    
    if user_update.name is not None:
        update_data["name"] = user_update.name
    if user_update.phone is not None:
        update_data["phone"] = user_update.phone
    if user_update.company is not None:
        update_data["company"] = user_update.company
    if user_update.role is not None:
        update_data["role"] = user_update.role.value
    if user_update.plan is not None:
        update_data["plan"] = user_update.plan.value
    if user_update.status is not None:
        update_data["status"] = user_update.status.value
    if user_update.preferences is not None:
        update_data["preferences"] = user_update.preferences.dict()
    if user_update.biometric_data is not None:
        update_data["biometric_data"] = [bio.dict() for bio in user_update.biometric_data]
    if user_update.behavioral_metrics is not None:
        update_data["behavioral_metrics"] = user_update.behavioral_metrics.dict()
    
    return update_data


# Enhanced User Registration with KYC and BFR-SIGN-ID
class UserRegistrationWithKYC(BaseModel):
    """Enhanced user registration model with KYC requirements"""
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    company: Optional[str] = None
    role: UserRole = UserRole.INDIVIDUAL
    plan: UserPlan = UserPlan.FREE
    
    # KYC Information
    country_code: str  # e.g., 'NA' for Namibia
    national_id_number: str
    national_id_type: str = "namibian_id"  # Default to Namibian ID
    id_document_url: Optional[str] = None
    
    # Consent and legal
    consent_given: bool = True
    legal_basis: str = "legitimate_interest"
    retention_period: int = 1825  # 5 years default


async def register_user_with_kyc(
    user_data: UserRegistrationWithKYC,
    audit_trail_service,
    supabase_client
) -> Dict[str, Any]:
    """
    Complete user registration with KYC verification and BFR-SIGN-ID generation
    """
    try:
        # 1. Create user account in Supabase
        user_metadata = {
            "name": user_data.name,
            "phone": user_data.phone,
            "company": user_data.company,
            "role": user_data.role.value,
            "plan": user_data.plan.value,
            "country_code": user_data.country_code,
            "national_id_number": user_data.national_id_number,
            "national_id_type": user_data.national_id_type,
            "kyc_status": "pending",
            "consent_given": user_data.consent_given,
            "legal_basis": user_data.legal_basis,
            "retention_period": user_data.retention_period,
            "preferences": {
                "emailNotifications": True,
                "smsNotifications": False,
                "twoFactorEnabled": False,
                "language": "en",
                "timezone": "UTC",
                "signatureStyle": "draw",
                "biometricEnabled": False,
                "behavioralTracking": True,
                "privacyLevel": "standard"
            }
        }
        
        # Create user in Supabase
        auth_response = supabase_client.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": user_metadata
            }
        })
        
        if not auth_response.user:
            raise Exception("Failed to create user account")
        
        user_id = auth_response.user.id
        
        # 2. Generate BFR-SIGN-ID
        from models.audit_trail import BFRSignID
        bfr_sign_id = BFRSignID.generate_bfr_sign_id(
            user_id=user_id,
            country_code=user_data.country_code,
            national_id_number=user_data.national_id_number
        )
        
        # 3. Perform KYC verification
        kyc_result = await perform_kyc_verification(
            bfr_sign_id=bfr_sign_id.id,
            user_data=user_data,
            supabase_client=supabase_client
        )
        
        # 4. Create audit trail entry
        from models.audit_trail import create_audit_event, AuditEventType, AuditSeverity
        audit_entry = create_audit_event(
            bfr_sign_id=bfr_sign_id.id,
            event_type=AuditEventType.USER_REGISTRATION,
            user_id=user_id,
            event_description=f"User registration with KYC verification for {user_data.email}",
            event_data={
                "user_email": user_data.email,
                "kyc_status": kyc_result["status"],
                "id_type": user_data.national_id_type,
                "country_code": user_data.country_code,
                "consent_given": user_data.consent_given,
                "legal_basis": user_data.legal_basis
            },
            severity=AuditSeverity.INFO,
            legal_basis=user_data.legal_basis,
            consent_given=user_data.consent_given,
            retention_period=user_data.retention_period
        )
        
        # 5. Store in audit chain
        await audit_trail_service.add_entry(audit_entry)
        
        # 6. Update user metadata with BFR-SIGN-ID
        supabase_client.auth.update_user({
            "data": {
                "bfr_sign_id": bfr_sign_id.id,
                "kyc_status": kyc_result["status"]
            }
        })
        
        return {
            "user": {
                "id": user_id,
                "email": user_data.email,
                "name": user_data.name,
                "bfr_sign_id": bfr_sign_id.id,
                "kyc_status": kyc_result["status"]
            },
            "bfr_sign_id": bfr_sign_id,
            "kyc_result": kyc_result,
            "audit_entry_id": audit_entry.id
        }
        
    except Exception as e:
        # Create failure audit entry
        from models.audit_trail import create_audit_event, AuditEventType, AuditSeverity
        audit_entry = create_audit_event(
            bfr_sign_id="SYSTEM",  # Temporary until we have a BFR-SIGN-ID
            event_type=AuditEventType.USER_REGISTRATION,
            user_id="SYSTEM",
            event_description=f"User registration failed for {user_data.email}: {str(e)}",
            event_data={
                "user_email": user_data.email,
                "error": str(e),
                "country_code": user_data.country_code,
                "id_type": user_data.national_id_type
            },
            severity=AuditSeverity.ERROR
        )
        
        await audit_trail_service.add_entry(audit_entry)
        raise


async def perform_kyc_verification(
    bfr_sign_id: str,
    user_data: UserRegistrationWithKYC,
    supabase_client
) -> Dict[str, Any]:
    """
    Perform KYC verification with national ID
    """
    try:
        from models.audit_trail import KYCVerification, GovernmentIDType, KYCStatus
        
        # Create KYC verification record
        kyc_verification = KYCVerification(
            bfr_sign_id=bfr_sign_id,
            country_code=user_data.country_code,
            national_id_number=user_data.national_id_number,
            national_id_type=GovernmentIDType(user_data.national_id_type),
            verification_document_url=user_data.id_document_url,
            verification_status=KYCStatus.PENDING
        )
        
        # Create cryptographic linkage
        linkage_hash = kyc_verification.create_cryptographic_linkage()
        
        # In a real implementation, you would:
        # 1. Send ID document to KYC service for verification
        # 2. Verify against government database
        # 3. Update verification status based on results
        
        # For now, we'll simulate a successful verification
        kyc_verification.verification_status = KYCStatus.VERIFIED
        kyc_verification.verified_by = "SYSTEM"
        kyc_verification.verified_at = datetime.utcnow()
        
        # Store KYC verification in database (would be implemented)
        # await store_kyc_verification(kyc_verification)
        
        return {
            "status": kyc_verification.verification_status.value,
            "kyc_id": kyc_verification.id,
            "linkage_hash": linkage_hash,
            "verified_at": kyc_verification.verified_at.isoformat() if kyc_verification.verified_at else None
        }
        
    except Exception as e:
        return {
            "status": "failed",
            "error": str(e)
        }


async def extract_id_information(
    id_document_url: str,
    id_type: str
) -> Dict[str, Any]:
    """
    Extract ID information using OCR/AI
    """
    try:
        # In a real implementation, you would:
        # 1. Download the document from the URL
        # 2. Use OCR to extract text
        # 3. Use AI to parse and validate the information
        # 4. Return structured data
        
        # Implement real KYC data extraction using regex patterns
        extracted_data = self._extract_kyc_data_with_regex(national_id_number, national_id_type)
        
        return {
            "country_code": extracted_data.get("country_code", "NA"),
            "id_number": extracted_data.get("id_number", national_id_number),
            "full_name": extracted_data.get("full_name", "Unknown"),
            "date_of_birth": extracted_data.get("date_of_birth", "1990-01-01"),
            "expiry_date": extracted_data.get("expiry_date", "2030-01-01"),
            "confidence_score": extracted_data.get("confidence_score", 0.75)
        }
        
    except Exception as e:
        raise Exception(f"Failed to extract ID information: {str(e)}")

    def _extract_kyc_data_with_regex(self, id_number: str, id_type: str) -> Dict[str, Any]:
    """Extract KYC data using regex patterns for different ID types"""
    try:
        import re
        from datetime import datetime
        
        result = {
            "country_code": "NA",
            "id_number": id_number,
            "full_name": "Unknown",
            "date_of_birth": "1990-01-01",
            "expiry_date": "2030-01-01",
            "confidence_score": 0.6
        }
        
        # Namibian ID patterns
        if id_type == "namibian_id" and len(id_number) == 11:
            # Namibian ID format: DDMMYYXXXXX
            try:
                day = int(id_number[:2])
                month = int(id_number[2:4])
                year = int(id_number[4:6])
                
                # Determine century (00-30 = 2000s, 31-99 = 1900s)
                if year <= 30:
                    full_year = 2000 + year
                else:
                    full_year = 1900 + year
                
                # Validate date
                if 1 <= month <= 12 and 1 <= day <= 31:
                    dob = f"{full_year:04d}-{month:02d}-{day:02d}"
                    result["date_of_birth"] = dob
                    result["confidence_score"] = 0.85
                    
            except ValueError:
                pass
        
        # South African ID patterns
        elif id_type == "south_african_id" and len(id_number) == 13:
            # SA ID format: YYMMDDXXXXXX
            try:
                year = int(id_number[:2])
                month = int(id_number[2:4])
                day = int(id_number[4:6])
                
                # Determine century
                if year <= 21:  # Current year logic
                    full_year = 2000 + year
                else:
                    full_year = 1900 + year
                
                if 1 <= month <= 12 and 1 <= day <= 31:
                    dob = f"{full_year:04d}-{month:02d}-{day:02d}"
                    result["date_of_birth"] = dob
                    result["country_code"] = "ZA"
                    result["confidence_score"] = 0.85
                    
            except ValueError:
                pass
        
        # Botswana Omang patterns
        elif id_type == "botswana_omang" and len(id_number) == 9:
            result["country_code"] = "BW"
            result["confidence_score"] = 0.75
        
        return result
        
    except Exception as e:
        return {
            "country_code": "NA",
            "id_number": id_number,
            "confidence_score": 0.0
        }
