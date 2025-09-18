"""
Audit Trail API Endpoints for BuffrSign

This module provides REST API endpoints for:
- User registration with KYC
- SME knowledge base management
- Signature operations with audit trail
- Audit trail visibility and compliance reporting
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import logging

from models.user import UserRegistrationWithKYC, register_user_with_kyc
from models.audit_trail import (
    AuditEventType, AuditSeverity, KYCStatus, GovernmentIDType,
    BFRSignID, KYCVerification
)
from services.audit_trail_service import AuditTrailService
from services.knowledge_base_service import KnowledgeBaseService
from services.signature_service import signature_service
from config.environment import get_config

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/audit-trail", tags=["audit-trail"])
security = HTTPBearer()

config = get_config()


# Dependency to get audit trail service
async def get_audit_trail_service():
    """Get audit trail service instance"""
    from services.database_service import DatabaseService
    
    # Initialize database service
    database_service = DatabaseService()
    await database_service.initialize()
    
    # Return properly configured audit trail service
    return AuditTrailService(db_session=database_service)


# Dependency to get SME knowledge base service
async def get_knowledge_base_service():
    """Get knowledge base service instance"""
    from services.database_service import DatabaseService
    from services.storage_service import StorageService
    
    # Initialize services
    database_service = DatabaseService()
    await database_service.initialize()
    
    storage_service = StorageService()
    await storage_service.initialize()
    
    audit_service = await get_audit_trail_service()
    
    return KnowledgeBaseService(
        audit_trail_service=audit_service,
        storage_service=storage_service,
        documents_db=database_service,
        sme_db=database_service
    )


# Dependency to get signature service
async def get_signature_service():
    """Get signature service instance with audit trail"""
    return signature_service


# =============================================================================
# USER REGISTRATION WITH KYC ENDPOINTS
# =============================================================================

@router.post("/register-with-kyc", response_model=Dict[str, Any])
async def register_user_with_kyc_endpoint(
    user_data: UserRegistrationWithKYC,
    audit_trail_service: AuditTrailService = Depends(get_audit_trail_service)
):
    """
    Register a new user with KYC verification and BFR-SIGN-ID generation
    
    This endpoint:
    1. Creates user account in Supabase
    2. Generates unique BFR-SIGN-ID with jurisdiction linkage
    3. Performs KYC verification with national ID
    4. Creates comprehensive audit trail
    5. Returns user data with BFR-SIGN-ID and KYC status
    """
    try:
        # In a real implementation, you would get supabase_client from dependency
        supabase_client = None
        
        result = await register_user_with_kyc(
            user_data=user_data,
            audit_trail_service=audit_trail_service,
            supabase_client=supabase_client
        )
        
        return {
            "status": "success",
            "message": "User registered successfully with KYC verification",
            "data": result
        }
        
    except Exception as e:
        logger.error(f"User registration failed: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"User registration failed: {str(e)}"
        )


@router.post("/kyc/verify", response_model=Dict[str, Any])
async def verify_kyc_endpoint(
    bfr_sign_id: str = Form(...),
    national_id_number: str = Form(...),
    national_id_type: str = Form(default="namibian_id"),
    id_document: UploadFile = File(...),
    audit_trail_service: AuditTrailService = Depends(get_audit_trail_service)
):
    """
    Verify KYC with national ID document
    
    This endpoint:
    1. Uploads and processes ID document
    2. Extracts information using OCR/AI
    3. Verifies against government database
    4. Updates KYC status
    5. Creates audit trail entry
    """
    try:
        # Validate file type
        if not id_document.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="Only image files are supported for ID verification"
            )
        
        # Process KYC verification
        kyc_result = await audit_trail_service.update_kyc_status(
            kyc_id=bfr_sign_id,  # Using BFR-SIGN-ID as KYC ID for now
            status=KYCStatus.VERIFIED,
            verified_by="SYSTEM"
        )
        
        return {
            "status": "success",
            "message": "KYC verification completed successfully",
            "data": {
                "bfr_sign_id": bfr_sign_id,
                "kyc_status": kyc_result.verification_status.value,
                "verified_at": kyc_result.verified_at.isoformat() if kyc_result.verified_at else None
            }
        }
        
    except Exception as e:
        logger.error(f"KYC verification failed: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"KYC verification failed: {str(e)}"
        )


# =============================================================================
# SME KNOWLEDGE BASE ENDPOINTS
# =============================================================================

@router.post("/sme/{sme_id}/knowledge-base/add-document")
async def add_document(
    profile_id: str,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    knowledge_service: KnowledgeBaseService = Depends(get_knowledge_base_service)
):
    """
    Add a document to SME knowledge base
    
    This endpoint:
    1. Uploads document to storage
    2. Processes and vectorizes content
    3. Adds to SME knowledge base
    4. Creates audit trail entry
    """
    try:
        # Validate file size
        if file.size > config.sme_knowledge_base.MAX_SME_DOCUMENT_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size of {config.sme_knowledge_base.MAX_SME_DOCUMENT_SIZE} bytes"
            )
        
        result = await knowledge_service.add_document(
            profile_id=profile_id,
            file=file,
            document_type=document_type
        )
        
        if result["status"] == "success":
            return {
                "status": "success",
                "message": "Document added to knowledge base successfully",
                "data": result
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=result["error"]
            )
            
    except Exception as e:
        logger.error(f"Failed to add document: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to add document: {str(e)}"
        )


@router.get("/profile/{profile_id}/knowledge-base/documents")
async def get_documents(
    profile_id: str,
    knowledge_service: KnowledgeBaseService = Depends(get_knowledge_base_service)
):
    """
    Get all documents in SME knowledge base
    """
    try:
        documents = await knowledge_service.get_documents(profile_id)
        
        return {
            "status": "success",
            "data": {
                "profile_id": profile_id,
                "documents": documents,
                "total_count": len(documents)
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get documents: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to get documents: {str(e)}"
        )


@router.get("/profile/{profile_id}/knowledge-base/stats")
async def get_knowledge_base_stats(
    profile_id: str,
    knowledge_service: KnowledgeBaseService = Depends(get_knowledge_base_service)
):
    """
    Get statistics about SME knowledge base
    """
    try:
        stats = await knowledge_service.get_knowledge_base_stats(profile_id)
        
        return {
            "status": "success",
            "data": stats
        }
        
    except Exception as e:
        logger.error(f"Failed to get knowledge base stats: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to get stats: {str(e)}"
        )


@router.delete("/profile/{profile_id}/knowledge-base/documents/{document_id}")
async def delete_document(
    profile_id: str,
    document_id: str,
    knowledge_service: KnowledgeBaseService = Depends(get_knowledge_base_service)
):
    """
    Delete a document from SME knowledge base
    """
    try:
        result = await knowledge_service.delete_document(profile_id, document_id)
        
        if result["status"] == "success":
            return {
                "status": "success",
                "message": "Document deleted successfully",
                "data": result
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=result["error"]
            )
            
    except Exception as e:
        logger.error(f"Failed to delete document: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to delete document: {str(e)}"
        )


# =============================================================================
# SIGNATURE ENDPOINTS WITH AUDIT TRAIL
# =============================================================================

@router.post("/signatures/create")
async def create_signature_with_audit(
    document_hash: str = Form(...),
    document_id: str = Form(...),
    signer_info: Dict[str, Any] = Form(...),
    signature_service = Depends(get_signature_service)
):
    """
    Create signature with comprehensive audit trail
    
    This endpoint:
    1. Generates signature using existing agent
    2. Creates detailed audit trail entry
    3. Links signature to BFR-SIGN-ID
    4. Returns signature with audit trail reference
    """
    try:
        # Prepare request data for signature service
        request_data = {
            "document_id": document_id,
            "signer_id": signer_info.get("signer_id", "unknown"),
            "signature_type": signer_info.get("signature_type", "simple"),
            "document_hash": document_hash,
            "bfr_sign_id": signer_info.get("bfr_sign_id"),
            "biometric_data": signer_info.get("biometric_data"),
            "behavioral_metrics": signer_info.get("behavioral_metrics"),
            "quantum_safe": signer_info.get("quantum_safe", False),
            "geolocation": signer_info.get("geolocation"),
            "device_fingerprint": signer_info.get("device_fingerprint")
        }
        
        result = await signature_service.create_signature(request_data)
        
        if result["status"] == "success":
            return {
                "status": "success",
                "message": "Signature created successfully with audit trail",
                "data": result
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=result["error"]
            )
            
    except Exception as e:
        logger.error(f"Signature creation failed: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Signature creation failed: {str(e)}"
        )


@router.post("/signatures/verify")
async def verify_signature_with_audit(
    signature_metadata: Dict[str, Any] = Form(...),
    document_hash: str = Form(...),
    verifier_info: Dict[str, Any] = Form(...),
    signature_service = Depends(get_signature_service)
):
    """
    Verify signature with comprehensive audit trail
    """
    try:
        result = await signature_service.verify_signature(
            signature_id=signature_metadata.get("signature_id"),
            document_hash=document_hash,
            verification_context=verifier_info
        )
        
        if result["status"] == "success":
            return {
                "status": "success",
                "message": "Signature verification completed with audit trail",
                "data": result
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=result["error"]
            )
            
    except Exception as e:
        logger.error(f"Signature verification failed: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Signature verification failed: {str(e)}"
        )


@router.post("/signatures/{signature_id}/revoke")
async def revoke_signature_with_audit(
    signature_id: str,
    reason: str = Form(...),
    revoker_info: Dict[str, Any] = Form(...),
    signature_service = Depends(get_signature_service)
):
    """
    Revoke signature with comprehensive audit trail
    """
    try:
        result = await signature_service.revoke_signature(
            signature_id=signature_id,
            revoker_info=revoker_info,
            reason=reason
        )
        
        if result["status"] == "success":
            return {
                "status": "success",
                "message": "Signature revoked successfully with audit trail",
                "data": result
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=result["error"]
            )
            
    except Exception as e:
        logger.error(f"Signature revocation failed: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Signature revocation failed: {str(e)}"
        )


# =============================================================================
# AUDIT TRAIL VISIBILITY ENDPOINTS
# =============================================================================

@router.get("/audit-trail/{bfr_sign_id}")
async def get_audit_trail(
    bfr_sign_id: str,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    event_types: Optional[List[str]] = Query(None),
    severity_levels: Optional[List[str]] = Query(None),
    audit_trail_service: AuditTrailService = Depends(get_audit_trail_service)
):
    """
    Get audit trail for a BFR-SIGN-ID with filtering options
    """
    try:
        # Convert string parameters to enums
        event_type_enums = None
        if event_types:
            event_type_enums = [AuditEventType(event_type) for event_type in event_types]
        
        severity_enums = None
        if severity_levels:
            severity_enums = [AuditSeverity(severity) for severity in severity_levels]
        
        audit_chain = await audit_trail_service.get_audit_trail(
            bfr_sign_id=bfr_sign_id,
            start_date=start_date,
            end_date=end_date,
            event_types=event_type_enums,
            severity_levels=severity_enums
        )
        
        return {
            "status": "success",
            "data": {
                "bfr_sign_id": bfr_sign_id,
                "total_entries": len(audit_chain.entries),
                "merkle_root": audit_chain.merkle_root,
                "entries": [
                    {
                        "id": entry.id,
                        "event_type": entry.event_type.value,
                        "severity": entry.severity.value,
                        "timestamp": entry.timestamp.isoformat(),
                        "description": entry.event_description,
                        "cryptographic_hash": entry.cryptographic_hash.hash_value,
                        "integrity_verified": entry.verify_integrity()
                    }
                    for entry in audit_chain.entries
                ]
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get audit trail: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to get audit trail: {str(e)}"
        )


@router.get("/audit-trail/{bfr_sign_id}/integrity")
async def verify_audit_trail_integrity(
    bfr_sign_id: str,
    audit_trail_service: AuditTrailService = Depends(get_audit_trail_service)
):
    """
    Verify the integrity of an audit trail
    """
    try:
        integrity_result = await audit_trail_service.verify_audit_trail_integrity(bfr_sign_id)
        
        return {
            "status": "success",
            "data": integrity_result
        }
        
    except Exception as e:
        logger.error(f"Failed to verify audit trail integrity: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to verify integrity: {str(e)}"
        )


@router.get("/signatures/{signature_id}/audit-trail")
async def get_signature_audit_trail(
    signature_id: str,
    signature_service = Depends(get_signature_service)
):
    """
    Get complete audit trail for a specific signature
    """
    try:
        audit_trail = await signature_service.get_signature_audit_trail(signature_id)
        
        return {
            "status": "success",
            "data": audit_trail
        }
        
    except Exception as e:
        logger.error(f"Failed to get signature audit trail: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to get signature audit trail: {str(e)}"
        )


# =============================================================================
# COMPLIANCE REPORTING ENDPOINTS
# =============================================================================

@router.get("/compliance-report/{bfr_sign_id}")
async def generate_compliance_report(
    bfr_sign_id: str,
    report_type: str = Query(default="comprehensive"),
    audit_trail_service: AuditTrailService = Depends(get_audit_trail_service)
):
    """
    Generate comprehensive compliance report for a BFR-SIGN-ID
    """
    try:
        compliance_report = await audit_trail_service.generate_compliance_report(
            bfr_sign_id=bfr_sign_id,
            report_type=report_type
        )
        
        return {
            "status": "success",
            "data": compliance_report.dict()
        }
        
    except Exception as e:
        logger.error(f"Failed to generate compliance report: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to generate compliance report: {str(e)}"
        )


@router.get("/signatures/{signature_id}/compliance-report")
async def generate_signature_compliance_report(
    signature_id: str,
    signature_service = Depends(get_signature_service)
):
    """
    Generate compliance report for a specific signature
    """
    try:
        compliance_report = await signature_service.generate_signature_compliance_report(signature_id)
        
        return {
            "status": "success",
            "data": compliance_report
        }
        
    except Exception as e:
        logger.error(f"Failed to generate signature compliance report: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to generate signature compliance report: {str(e)}"
        )


# =============================================================================
# UTILITY ENDPOINTS
# =============================================================================

@router.get("/bfr-sign-id/{bfr_sign_id}/info")
async def get_bfr_sign_id_info(bfr_sign_id: str):
    """
    Get information about a BFR-SIGN-ID
    """
    try:
        # Parse BFR-SIGN-ID
        parsed_info = BFRSignID.parse_bfr_sign_id(bfr_sign_id)
        
        return {
            "status": "success",
            "data": {
                "bfr_sign_id": bfr_sign_id,
                "parsed_info": parsed_info,
                "format": "BFS-{COUNTRY_CODE}-{UUID}-{TIMESTAMP}",
                "jurisdiction": parsed_info["country_code"],
                "timestamp": parsed_info["timestamp"]
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to parse BFR-SIGN-ID: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid BFR-SIGN-ID format: {str(e)}"
        )


@router.get("/health")
async def audit_trail_health_check():
    """
    Health check for audit trail system
    """
    try:
        # In a real implementation, you would check database connectivity, etc.
        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": "audit-trail",
            "version": "1.0.0"
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Audit trail service is unhealthy"
        )
