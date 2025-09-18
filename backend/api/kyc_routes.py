"""
KYC Workflow API Routes
Provides API endpoints for KYC workflow management
"""

import os
import logging
import tempfile
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Import workflow engine
from ai_services.workflows.kyc_workflow import kyc_workflow_engine, KYCWorkflowState, WorkflowState
from utils.sadc_validators import sadc_validator

# Import auth dependencies
from api.auth import get_current_user

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/kyc",
    tags=["KYC"],
    responses={404: {"description": "Not found"}},
)

# Models
class KYCWorkflowRequest(BaseModel):
    """Request model for starting KYC workflow"""
    user_id: str = Field(..., description="User ID")
    document_id: str = Field(..., description="Document ID")
    country_hint: Optional[str] = Field(None, description="Country hint (e.g., NA, ZA)")
    document_type: Optional[str] = Field("national_id", description="Document type")

class KYCWorkflowResponse(BaseModel):
    """Response model for KYC workflow"""
    workflow_id: str = Field(..., description="Workflow ID")
    status: str = Field(..., description="Workflow status")
    message: str = Field(..., description="Status message")

class KYCStatusResponse(BaseModel):
    """Response model for KYC workflow status"""
    workflow_id: str = Field(..., description="Workflow ID")
    current_state: str = Field(..., description="Current workflow state")
    detected_country: Optional[str] = Field(None, description="Detected country")
    country_confidence: Optional[float] = Field(None, description="Country detection confidence")
    final_decision: Optional[str] = Field(None, description="Final decision")
    decision_confidence: Optional[float] = Field(None, description="Decision confidence")
    created_at: str = Field(..., description="Workflow creation timestamp")
    updated_at: str = Field(..., description="Workflow update timestamp")

class KYCUploadResponse(BaseModel):
    """Response model for KYC document upload"""
    workflow_id: str = Field(..., description="Workflow ID")
    document_id: str = Field(..., description="Document ID")
    status: str = Field(..., description="Upload status")
    message: str = Field(..., description="Status message")

@router.post("/start", response_model=KYCWorkflowResponse)
async def start_kyc_workflow(
    request: KYCWorkflowRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Start a new KYC workflow"""
    try:
        # Start workflow
        workflow_id = await kyc_workflow_engine.start_workflow(
            user_id=request.user_id,
            document_id=request.document_id
        )
        
        logger.info(f"✅ KYC workflow started: {workflow_id}")
        
        return {
            "workflow_id": workflow_id,
            "status": "initialized",
            "message": "KYC workflow started successfully"
        }
    except Exception as e:
        logger.error(f"❌ Failed to start KYC workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload", response_model=KYCUploadResponse)
async def upload_kyc_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: str = Form(...),
    country_hint: Optional[str] = Form(None),
    document_type: Optional[str] = Form("national_id")),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Upload document for KYC workflow"""
    try:
        # Save file to temp directory
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            contents = await file.read()
            temp_file.write(contents)
            temp_file_path = temp_file.name
        
        # Generate document ID
        import uuid
        document_id = str(uuid.uuid4())
        
        # Start workflow
        workflow_id = await kyc_workflow_engine.start_workflow(
            user_id=user_id,
            document_id=document_id
        )
        
        # Process document in background
        background_tasks.add_task(
            process_document,
            workflow_id=workflow_id,
            file_path=temp_file_path,
            country_hint=country_hint,
            document_type=document_type
        )
        
        logger.info(f"✅ Document uploaded for KYC workflow: {workflow_id}")
        
        return {
            "workflow_id": workflow_id,
            "document_id": document_id,
            "status": "processing",
            "message": "Document uploaded and processing started"
        }
    except Exception as e:
        logger.error(f"❌ Failed to upload document: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if 'temp_file_path' in locals():
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                logger.error(f"Failed to delete temp file: {e}")

@router.get("/status/{workflow_id}", response_model=KYCStatusResponse)
async def get_kyc_status(
    workflow_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get KYC workflow status"""
    try:
        # Get workflow status
        workflow = await kyc_workflow_engine.get_workflow_status(workflow_id)
        
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        return {
            "workflow_id": workflow_id,
            "current_state": workflow.current_state.value,
            "detected_country": workflow.detected_country,
            "country_confidence": workflow.country_confidence,
            "final_decision": workflow.final_decision,
            "decision_confidence": workflow.decision_confidence,
            "created_at": workflow.created_at.isoformat(),
            "updated_at": workflow.updated_at.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get workflow status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/audit-trail/{workflow_id}")
async def get_kyc_audit_trail(
    workflow_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get KYC workflow audit trail"""
    try:
        # Get workflow status
        workflow = await kyc_workflow_engine.get_workflow_status(workflow_id)
        
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        return {
            "workflow_id": workflow_id,
            "audit_trail": workflow.audit_trail
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get audit trail: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-bfr-sign-id")
async def generate_bfr_sign_id(
    workflow_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate BFR-SIGN-ID from KYC workflow"""
    try:
        # Get workflow status
        workflow = await kyc_workflow_engine.get_workflow_status(workflow_id)
        
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        # Check if workflow is completed and approved
        if workflow.current_state != WorkflowState.COMPLETED or workflow.final_decision != "approved":
            raise HTTPException(status_code=400, detail="Workflow must be completed and approved to generate BFR-SIGN-ID")
        
        # Get extracted fields
        fields = workflow.ai_field_extraction.get("fields", {}) if workflow.ai_field_extraction else {}
        
        # Generate BFR-SIGN-ID
        bfr_sign_id = sadc_validator.generate_bfr_sign_id(fields, workflow.detected_country)
        
        return {
            "workflow_id": workflow_id,
            "bfr_sign_id": bfr_sign_id,
            "user_id": workflow.user_id,
            "document_id": workflow.document_id,
            "country_code": workflow.detected_country,
            "generated_at": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to generate BFR-SIGN-ID: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_document(workflow_id: str, file_path: str, country_hint: Optional[str], document_type: Optional[str]):
    """Process document in background"""
    try:
        # Read file content
        with open(file_path, "rb") as f:
            file_content = f.read()
        
        # Get workflow status
        workflow = await kyc_workflow_engine.get_workflow_status(workflow_id)
        
        if not workflow:
            logger.error(f"❌ Workflow {workflow_id} not found for document processing")
            return
        
        # Update workflow with document data
        workflow.document_data = {
            "file_content": file_content,
            "country_hint": country_hint,
            "document_type": document_type
        }
        
        # Continue workflow
        await kyc_workflow_engine.workflow_executor.ainvoke(workflow, {"configurable": {"thread_id": workflow_id}})
        
        logger.info(f"✅ Document processing completed for workflow: {workflow_id}")
    except Exception as e:
        logger.error(f"❌ Failed to process document: {e}")
