"""
Comprehensive Audit Trail System for BuffrSign

This module implements a research-grade audit trail system that:
- Generates unique BFR-SIGN-IDs for user identification
- Links government IDs during KYC verification
- Creates cryptographic linkages between user identity, documents, and signatures
- Stores audit records in tamper-evident format with timestamping
- Provides complete audit trail visibility for compliance reporting
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum
import hashlib
import hmac
import json
import uuid


class AuditEventType(str, Enum):
    """Types of audit events for comprehensive tracking"""
    USER_REGISTRATION = "user_registration"
    KYC_VERIFICATION = "kyc_verification"
    DOCUMENT_UPLOAD = "document_upload"
    SIGNATURE_CREATION = "signature_creation"
    SIGNATURE_VERIFICATION = "signature_verification"
    DOCUMENT_VIEW = "document_view"
    CONSENT_GIVEN = "consent_given"
    ACCESS_ATTEMPT = "access_attempt"
    SECURITY_EVENT = "security_event"
    COMPLIANCE_CHECK = "compliance_check"
    SYSTEM_CONFIGURATION = "system_configuration"
    DATA_EXPORT = "data_export"
    AUDIT_REPORT_GENERATION = "audit_report_generation"


class AuditSeverity(str, Enum):
    """Audit event severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"
    SECURITY = "security"


class KYCStatus(str, Enum):
    """KYC verification status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"


class GovernmentIDType(str, Enum):
    """Types of government-issued identification"""
    NAMIBIAN_ID = "namibian_id"
    PASSPORT = "passport"
    DRIVERS_LICENSE = "drivers_license"
    NATIONAL_ID = "national_id"
    RESIDENCE_PERMIT = "residence_permit"


class CryptographicHash(BaseModel):
    """Cryptographic hash for tamper-evident storage"""
    algorithm: str = "sha-256"
    hash_value: str
    salt: Optional[str] = None
    timestamp: datetime
    previous_hash: Optional[str] = None


class MerkleTreeProof(BaseModel):
    """Merkle tree proof for blockchain-style verification"""
    root_hash: str
    leaf_hash: str
    path: List[str]
    siblings: List[str]
    verified: bool = False


class BFRSignID(BaseModel):
    """Unique BFR-SIGN-ID for user identification with jurisdiction linkage"""
    id: str = Field(..., description="Unique BFR-SIGN-ID format: BFS-{COUNTRY_CODE}-{UUID}-{TIMESTAMP}")
    user_id: str
    country_code: str  # e.g., 'NA' for Namibia
    national_id_number: str  # Stored securely for compliance
    national_id_uuid: str  # Deterministic UUID derived from national ID
    national_id_hash: Optional[str] = None  # Hash for verification
    kyc_status: KYCStatus = KYCStatus.PENDING
    created_at: datetime
    verified_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    @classmethod
    def generate_bfr_sign_id(
        cls, 
        user_id: str, 
        country_code: str, 
        national_id_number: str
    ) -> "BFRSignID":
        """Generate a unique BFR-SIGN-ID with jurisdiction and national ID linkage"""
        # Create deterministic UUID linked to national ID (not shared publicly)
        national_id_uuid = cls._generate_national_id_uuid(country_code, national_id_number)
        
        # Format: BFS-{COUNTRY_CODE}-{UUID}-{TIMESTAMP}
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        bfr_sign_id = f"BFS-{country_code.upper()}-{national_id_uuid}-{timestamp}"
        
        # Create hash of national ID for verification
        national_id_hash = hashlib.sha256(
            f"{national_id_number}:{bfr_sign_id}".encode()
        ).hexdigest()
        
        return cls(
            id=bfr_sign_id,
            user_id=user_id,
            country_code=country_code.upper(),
            national_id_number=national_id_number,
            national_id_uuid=national_id_uuid,
            national_id_hash=national_id_hash,
            created_at=datetime.utcnow()
        )
    
    @classmethod
    def _generate_national_id_uuid(cls, country_code: str, national_id_number: str) -> str:
        """Generate deterministic UUID from national ID (not shared publicly)"""
        # Create deterministic seed from country code and national ID
        seed = f"{country_code.upper()}:{national_id_number}"
        seed_hash = hashlib.sha256(seed.encode()).hexdigest()
        
        # Use first 32 characters of hash to create UUID
        uuid_hex = seed_hash[:32]
        return f"{uuid_hex[:8]}-{uuid_hex[8:12]}-{uuid_hex[12:16]}-{uuid_hex[16:20]}-{uuid_hex[20:32]}"
    
    @classmethod
    def parse_bfr_sign_id(cls, bfr_sign_id: str) -> Dict[str, Any]:
        """Parse a BFR-SIGN-ID to extract components"""
        try:
            # Format: BFS-{COUNTRY_CODE}-{UUID}-{TIMESTAMP}
            parts = bfr_sign_id.split("-")
            if len(parts) != 5 or parts[0] != "BFS":
                raise ValueError("Invalid BFR-SIGN-ID format")
            
            return {
                "country_code": parts[1],
                "uuid": parts[2],
                "timestamp": parts[3] + "-" + parts[4] if len(parts) > 4 else parts[3]
            }
        except Exception as e:
            raise ValueError(f"Failed to parse BFR-SIGN-ID {bfr_sign_id}: {str(e)}")
    
    def get_jurisdiction_info(self) -> Dict[str, str]:
        """Get jurisdiction information from the BFR-SIGN-ID"""
        return {
            "country_code": self.country_code,
            "national_id_number": self.national_id_number,
            "national_id_uuid": self.national_id_uuid,
            "full_id": self.id
        }


class KYCVerification(BaseModel):
    """KYC verification record with national ID linkage"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bfr_sign_id: str
    country_code: str  # e.g., 'NA' for Namibia
    national_id_number: str  # National ID number for KYC
    national_id_type: GovernmentIDType  # Type of national ID
    national_id_hash: str  # Hash of national ID for verification
    verification_document_url: Optional[str] = None  # URL to verification document
    verification_status: KYCStatus = KYCStatus.PENDING
    verified_by: Optional[str] = None  # Admin who verified
    verified_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    def create_cryptographic_linkage(self) -> str:
        """Create cryptographic linkage between BFR-SIGN-ID and national ID"""
        linkage_data = f"{self.bfr_sign_id}:{self.country_code}:{self.national_id_number}"
        return hashlib.sha256(linkage_data.encode()).hexdigest()


class AuditTrailEntry(BaseModel):
    """Comprehensive audit trail entry with tamper-evident features and jurisdiction tracking"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bfr_sign_id: str
    event_type: AuditEventType
    severity: AuditSeverity = AuditSeverity.INFO
    user_id: str
    session_id: Optional[str] = None
    document_id: Optional[str] = None
    signature_id: Optional[str] = None
    
    # Jurisdiction and timestamping
    country_code: Optional[str] = None
    national_id_number: Optional[str] = None
    issue_number: Optional[int] = None
    event_timestamp: datetime = Field(default_factory=datetime.utcnow)
    system_timestamp: datetime = Field(default_factory=datetime.utcnow)
    utc_offset: Optional[int] = None  # Timezone offset in minutes
    
    # Event details
    event_description: str
    event_data: Dict[str, Any] = Field(default_factory=dict)
    
    # Cryptographic verification
    cryptographic_hash: CryptographicHash
    merkle_proof: Optional[MerkleTreeProof] = None
    
    # Tamper-evident features
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    location_data: Optional[Dict[str, float]] = None
    device_fingerprint: Optional[str] = None
    
    # Compliance and legal
    legal_basis: Optional[str] = None
    consent_given: bool = False
    retention_period: Optional[int] = None  # Days
    
    # System metadata
    system_version: Optional[str] = None
    api_version: Optional[str] = None
    correlation_id: Optional[str] = None
    
    def create_cryptographic_hash(self, previous_hash: Optional[str] = None) -> str:
        """Create tamper-evident cryptographic hash with jurisdiction and timestamp data"""
        # Create data to hash
        data_to_hash = {
            "id": self.id,
            "bfr_sign_id": self.bfr_sign_id,
            "country_code": self.country_code,
            "national_id_number": self.national_id_number,
            "issue_number": self.issue_number,
            "event_type": self.event_type,
            "user_id": self.user_id,
            "event_timestamp": self.event_timestamp.isoformat(),
            "system_timestamp": self.system_timestamp.isoformat(),
            "utc_offset": self.utc_offset,
            "timestamp": self.timestamp.isoformat(),
            "event_description": self.event_description,
            "event_data": json.dumps(self.event_data, sort_keys=True),
            "previous_hash": previous_hash or ""
        }
        
        # Create hash
        data_string = json.dumps(data_to_hash, sort_keys=True)
        hash_value = hashlib.sha256(data_string.encode()).hexdigest()
        
        # Update cryptographic hash
        self.cryptographic_hash = CryptographicHash(
            hash_value=hash_value,
            timestamp=self.timestamp,
            previous_hash=previous_hash
        )
        
        return hash_value
    
    def verify_integrity(self) -> bool:
        """Verify the integrity of the audit trail entry"""
        if not self.cryptographic_hash:
            return False
        
        # Recreate hash to verify
        data_to_hash = {
            "id": self.id,
            "bfr_sign_id": self.bfr_sign_id,
            "event_type": self.event_type,
            "user_id": self.user_id,
            "timestamp": self.timestamp.isoformat(),
            "event_description": self.event_description,
            "event_data": json.dumps(self.event_data, sort_keys=True),
            "previous_hash": self.cryptographic_hash.previous_hash or ""
        }
        
        data_string = json.dumps(data_to_hash, sort_keys=True)
        expected_hash = hashlib.sha256(data_string.encode()).hexdigest()
        
        return expected_hash == self.cryptographic_hash.hash_value


class AuditTrailChain(BaseModel):
    """Chain of audit trail entries for blockchain-style verification"""
    chain_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bfr_sign_id: str
    entries: List[AuditTrailEntry] = Field(default_factory=list)
    merkle_root: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    def add_entry(self, entry: AuditTrailEntry) -> str:
        """Add entry to the chain and create cryptographic linkage"""
        # Get previous hash
        previous_hash = None
        if self.entries:
            previous_hash = self.entries[-1].cryptographic_hash.hash_value
        
        # Create hash for new entry
        entry_hash = entry.create_cryptographic_hash(previous_hash)
        
        # Add to chain
        self.entries.append(entry)
        self.updated_at = datetime.utcnow()
        
        return entry_hash
    
    def verify_chain_integrity(self) -> bool:
        """Verify the integrity of the entire audit chain"""
        if not self.entries:
            return True
        
        for i, entry in enumerate(self.entries):
            # Verify individual entry integrity
            if not entry.verify_integrity():
                return False
            
            # Verify chain linkage
            if i > 0:
                expected_previous = self.entries[i-1].cryptographic_hash.hash_value
                actual_previous = entry.cryptographic_hash.previous_hash
                if expected_previous != actual_previous:
                    return False
        
        return True
    
    def create_merkle_tree(self) -> str:
        """Create Merkle tree for efficient verification"""
        if not self.entries:
            return ""
        
        # Create leaf hashes
        leaf_hashes = [entry.cryptographic_hash.hash_value for entry in self.entries]
        
        # Build Merkle tree
        while len(leaf_hashes) > 1:
            new_level = []
            for i in range(0, len(leaf_hashes), 2):
                if i + 1 < len(leaf_hashes):
                    combined = leaf_hashes[i] + leaf_hashes[i + 1]
                    new_level.append(hashlib.sha256(combined.encode()).hexdigest())
                else:
                    new_level.append(leaf_hashes[i])
            leaf_hashes = new_level
        
        self.merkle_root = leaf_hashes[0] if leaf_hashes else ""
        return self.merkle_root


class ComplianceReport(BaseModel):
    """Comprehensive compliance report for audit trail"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bfr_sign_id: str
    report_type: str  # ETA_2019, eIDAS, ESIGN_ACT, etc.
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    valid_until: Optional[datetime] = None
    
    # Audit trail summary
    total_events: int
    events_by_type: Dict[str, int]
    events_by_severity: Dict[str, int]
    
    # Cryptographic verification
    merkle_root: str
    chain_integrity_verified: bool
    tamper_evident: bool
    
    # Compliance checks
    eta_2019_compliant: bool
    eidas_compliant: bool
    esign_act_compliant: bool
    kyc_verified: bool
    
    # Legal and regulatory
    legal_basis_verified: bool
    consent_tracking_complete: bool
    retention_policy_compliant: bool
    
    # Report data
    audit_chain: AuditTrailChain
    kyc_verification: Optional[KYCVerification] = None
    compliance_details: Dict[str, Any] = Field(default_factory=dict)
    
    def generate_report_hash(self) -> str:
        """Generate cryptographic hash of the compliance report"""
        report_data = {
            "id": self.id,
            "bfr_sign_id": self.bfr_sign_id,
            "report_type": self.report_type,
            "generated_at": self.generated_at.isoformat(),
            "merkle_root": self.merkle_root,
            "chain_integrity_verified": self.chain_integrity_verified,
            "total_events": self.total_events
        }
        
        return hashlib.sha256(json.dumps(report_data, sort_keys=True).encode()).hexdigest()


# Utility functions for audit trail management
def create_audit_event(
    bfr_sign_id: str,
    event_type: AuditEventType,
    user_id: str,
    event_description: str,
    event_data: Dict[str, Any] = None,
    severity: AuditSeverity = AuditSeverity.INFO,
    **kwargs
) -> AuditTrailEntry:
    """Create a new audit trail entry"""
    entry = AuditTrailEntry(
        bfr_sign_id=bfr_sign_id,
        event_type=event_type,
        severity=severity,
        user_id=user_id,
        event_description=event_description,
        event_data=event_data or {},
        **kwargs
    )
    
    return entry


def verify_audit_trail_integrity(audit_chain: AuditTrailChain) -> Dict[str, Any]:
    """Verify the integrity of an audit trail chain"""
    verification_result = {
        "chain_integrity": audit_chain.verify_chain_integrity(),
        "total_entries": len(audit_chain.entries),
        "merkle_root": audit_chain.create_merkle_tree(),
        "first_entry": audit_chain.entries[0].timestamp if audit_chain.entries else None,
        "last_entry": audit_chain.entries[-1].timestamp if audit_chain.entries else None,
        "entry_verification": []
    }
    
    # Verify each entry individually
    for entry in audit_chain.entries:
        verification_result["entry_verification"].append({
            "entry_id": entry.id,
            "integrity_verified": entry.verify_integrity(),
            "timestamp": entry.timestamp.isoformat(),
            "event_type": entry.event_type
        })
    
    return verification_result
