"""
AI API Routes for BuffrSign

This module provides a unified API interface for all AI operations,
including document analysis, signature creation, compliance checking,
template generation, and workflow orchestration.
"""

from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
import uuid

from auth.auth_utils import get_current_user
from models.user import User
from ai_services.pydantic_agents import ai_agent_manager
from ai_services.workflows.kyc_workflow import kyc_workflow_engine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

@router.post("/chat")
async def chat_with_agent(
    request: Request,
    chat_request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Chat with the BuffrSign AI agent.
    
    This endpoint handles general AI interactions for document processing.
    """
    try:
        # Extract request data
        message = chat_request.get("message", "")
        session_id = chat_request.get("session_id", str(uuid.uuid4()))
        document_id = chat_request.get("document_id")
        workflow_id = chat_request.get("workflow_id")
        context = chat_request.get("context", {})
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message is required"
            )
        
        # Process request through AI agent
        response = await ai_agent_manager.process_request(
            user_id=current_user.id,
            session_id=session_id,
            request=message,
            document_id=document_id,
            context=context
        )
        
        return {
            "success": True,
            "session_id": session_id,
            "response": response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Agent chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent processing failed: {str(e)}"
        )

@router.post("/documents/analyze")
async def analyze_document(
    request: Request,
    analysis_request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Analyze a document using AI.
    """
    try:
        document_id = analysis_request.get("document_id")
        
        if not document_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document ID is required"
            )
        
        # Process through AI agent
        response = await ai_agent_manager.process_document(
            user_id=current_user.id,
            document_id=document_id,
            analysis_type=analysis_request.get("analysis_type", "comprehensive")
        )
        
        return {
            "success": True,
            "document_id": document_id,
            "analysis": response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Document analysis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document analysis failed: {str(e)}"
        )

@router.post("/signatures/create")
async def create_signature(
    request: Request,
    signature_request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Create a digital signature using AI verification.
    """
    try:
        document_id = signature_request.get("document_id")
        signature_type = signature_request.get("signature_type", "electronic")
        
        if not document_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document ID is required"
            )
        
        # Process signature creation
        response = await ai_agent_manager.create_signature(
            user_id=current_user.id,
            document_id=document_id,
            signature_type=signature_type
        )
        
        return {
            "success": True,
            "document_id": document_id,
            "signature_result": response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Signature creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signature creation failed: {str(e)}"
        )

@router.post("/compliance/check")
async def check_compliance(
    request: Request,
    compliance_request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Check ETA 2019 compliance using AI.
    """
    try:
        document_id = compliance_request.get("document_id")
        
        if not document_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document ID is required"
            )
        
        # Process compliance check
        response = await ai_agent_manager.check_compliance(
            user_id=current_user.id,
            document_id=document_id,
            compliance_type=compliance_request.get("compliance_type", "eta_2019")
        )
        
        return {
            "success": True,
            "document_id": document_id,
            "compliance_result": response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Compliance check error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Compliance check failed: {str(e)}"
        )

@router.post("/templates/generate")
async def generate_template(
    request: Request,
    template_request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Generate a legal document template using AI.
    """
    try:
        template_type = template_request.get("template_type", "employment_contract")
        parameters = template_request.get("parameters", {})
        
        if not template_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Template type is required"
            )
        
        # Generate template
        response = await ai_agent_manager.generate_template(
            user_id=current_user.id,
            template_type=template_type,
            parameters=parameters
        )
        
        return {
            "success": True,
            "template_type": template_type,
            "template_result": response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Template generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Template generation failed: {str(e)}"
        )

@router.post("/kyc/start")
async def start_kyc_workflow(
    request: Request,
    kyc_request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Start a KYC workflow using LangGraph.
    """
    try:
        user_id = current_user.id
        document_id = kyc_request.get("document_id")
        
        if not document_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document ID is required"
            )
        
        # Start KYC workflow
        workflow_id = await kyc_workflow_engine.start_workflow(
            user_id=user_id,
            document_id=document_id
        )
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "status": "initialized",
            "message": "KYC workflow started successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"KYC workflow error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"KYC workflow failed: {str(e)}"
        )

@router.get("/kyc/status/{workflow_id}")
async def get_kyc_status(
    workflow_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get KYC workflow status.
    """
    try:
        # Get workflow status
        workflow = await kyc_workflow_engine.get_workflow_status(workflow_id)
        
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found"
            )
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "current_state": workflow.current_state.value,
            "detected_country": workflow.detected_country,
            "country_confidence": workflow.country_confidence,
            "final_decision": workflow.final_decision,
            "decision_confidence": workflow.decision_confidence,
            "created_at": workflow.created_at.isoformat(),
            "updated_at": workflow.updated_at.isoformat(),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"KYC status error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get KYC status: {str(e)}"
        )

@router.get("/templates")
async def get_available_templates(
    current_user: User = Depends(get_current_user)
):
    """
    Get list of available document templates.
    """
    try:
        templates = [
            {
                "id": "employment_contract",
                "name": "Employment Contract",
                "description": "Standard employment agreement with ETA 2019 compliance",
                "category": "employment",
                "fields": ["employer_name", "employee_name", "position", "salary", "start_date"]
            },
            {
                "id": "nda_agreement",
                "name": "Non-Disclosure Agreement",
                "description": "Confidentiality agreement with legal compliance",
                "category": "legal",
                "fields": ["disclosing_party", "receiving_party", "confidential_info", "duration"]
            },
            {
                "id": "service_agreement",
                "name": "Service Agreement",
                "description": "Service provider agreement template",
                "category": "business",
                "fields": ["service_provider", "client", "services", "payment_terms"]
            },
            {
                "id": "lease_agreement",
                "name": "Lease Agreement",
                "description": "Property lease agreement template",
                "category": "real_estate",
                "fields": ["landlord", "tenant", "property_address", "rent_amount", "lease_term"]
            }
        ]
        
        return {
            "success": True,
            "templates": templates,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting templates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get templates: {str(e)}"
        )

@router.get("/health")
async def ai_health_check():
    """
    Health check for the AI system.
    """
    try:
        return {
            "status": "healthy",
            "ai_system": "buffrsign_ai",
            "components": {
                "pydantic_ai": "active",
                "langgraph": "active",
                "vision_models": "active"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"AI health check error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI health check failed: {str(e)}"
        )
