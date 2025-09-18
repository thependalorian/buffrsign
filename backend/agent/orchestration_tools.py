"""
Orchestration tools for the Neo4j agent.
Provides tools for workflow orchestration and service interaction.
"""

import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from .orchestrator import orchestrator
from .service_connections import service_manager

logger = logging.getLogger(__name__)


# Tool Input Models
class WorkflowStartInput(BaseModel):
    """Input for starting a workflow."""
    workflow_id: str = Field(..., description="Workflow ID to start")
    input_data: Dict[str, Any] = Field(..., description="Input data for the workflow")


class WorkflowStatusInput(BaseModel):
    """Input for getting workflow status."""
    workflow_instance_id: str = Field(..., description="Workflow instance ID")


class ServiceOperationInput(BaseModel):
    """Input for executing a service operation."""
    service_type: str = Field(..., description="Service type (signature, audit_trail, supabase)")
    operation: str = Field(..., description="Operation to execute")
    params: Dict[str, Any] = Field(..., description="Operation parameters")


# Orchestration Tools
async def start_workflow_tool(input_data: WorkflowStartInput) -> Dict[str, Any]:
    """
    Start a workflow with the given input data.
    
    This tool starts a workflow using the orchestration engine. It supports
    various workflow types including KYC, signature, and document workflows.
    
    Args:
        input_data: WorkflowStartInput containing workflow_id and input_data
        
    Returns:
        Dictionary with workflow instance ID and status
    """
    try:
        # Ensure orchestrator is initialized
        if not hasattr(orchestrator, "_initialized") or not orchestrator._initialized:
            await orchestrator.initialize()
            orchestrator._initialized = True
        
        # Start workflow
        result = await orchestrator.start_workflow(
            workflow_id=input_data.workflow_id,
            input_data=input_data.input_data
        )
        
        return result
    except Exception as e:
        logger.error(f"Error starting workflow: {e}")
        return {"status": "error", "error": str(e)}


async def get_workflow_status_tool(input_data: WorkflowStatusInput) -> Dict[str, Any]:
    """
    Get the status of a workflow.
    
    This tool retrieves the current status of a workflow using the orchestration engine.
    
    Args:
        input_data: WorkflowStatusInput containing workflow_instance_id
        
    Returns:
        Dictionary with workflow status information
    """
    try:
        # Ensure orchestrator is initialized
        if not hasattr(orchestrator, "_initialized") or not orchestrator._initialized:
            await orchestrator.initialize()
            orchestrator._initialized = True
        
        # Get workflow status
        result = await orchestrator.get_workflow_status(input_data.workflow_instance_id)
        
        return result
    except Exception as e:
        logger.error(f"Error getting workflow status: {e}")
        return {"status": "error", "error": str(e)}


async def execute_service_operation_tool(input_data: ServiceOperationInput) -> Dict[str, Any]:
    """
    Execute a service operation.
    
    This tool executes an operation on a service using the service connection manager.
    It supports various service types including signature, audit_trail, and supabase.
    
    Args:
        input_data: ServiceOperationInput containing service_type, operation, and params
        
    Returns:
        Dictionary with operation result
    """
    try:
        # Ensure service manager is initialized
        if not hasattr(service_manager, "_initialized") or not service_manager._initialized:
            await service_manager.initialize()
            service_manager._initialized = True
        
        # Execute service operation
        result = await service_manager.execute(
            service_type=input_data.service_type,
            operation=input_data.operation,
            params=input_data.params
        )
        
        return result
    except Exception as e:
        logger.error(f"Error executing service operation: {e}")
        return {"status": "error", "error": str(e)}


# KYC Workflow Tools
class KYCWorkflowInput(BaseModel):
    """Input for KYC workflow."""
    user_id: str = Field(..., description="User ID for KYC verification")
    document_id: Optional[str] = Field(None, description="Document ID if already uploaded")
    document_type: str = Field(default="national_id", description="Type of ID document")
    country_hint: Optional[str] = Field(None, description="Country code hint (e.g., NA, ZA)")


async def start_kyc_workflow_tool(input_data: KYCWorkflowInput) -> Dict[str, Any]:
    """
    Start a KYC workflow for identity verification.
    
    This tool starts a KYC workflow for verifying a user's identity using
    the provided document. It supports various ID document types and SADC countries.
    
    Args:
        input_data: KYCWorkflowInput containing user_id, document_id, etc.
        
    Returns:
        Dictionary with workflow instance ID and status
    """
    try:
        # Ensure orchestrator is initialized
        if not hasattr(orchestrator, "_initialized") or not orchestrator._initialized:
            await orchestrator.initialize()
            orchestrator._initialized = True
        
        # Start KYC workflow
        result = await orchestrator.start_workflow(
            workflow_id="kyc",
            input_data={
                "user_id": input_data.user_id,
                "document_id": input_data.document_id,
                "document_type": input_data.document_type,
                "country_hint": input_data.country_hint
            }
        )
        
        return result
    except Exception as e:
        logger.error(f"Error starting KYC workflow: {e}")
        return {"status": "error", "error": str(e)}


# Signature Workflow Tools
class SignatureWorkflowInput(BaseModel):
    """Input for signature workflow."""
    document_id: str = Field(..., description="Document to set up for signing")
    workflow_type: str = Field(default="sequential", description="Workflow type: sequential, parallel, or custom")
    parties: List[Dict[str, Any]] = Field(..., description="List of signing parties with roles")
    signature_fields: List[Dict[str, Any]] = Field(..., description="Signature field configurations")
    compliance_level: str = Field(default="standard", description="Compliance level: basic, standard, or enhanced")


async def start_signature_workflow_tool(input_data: SignatureWorkflowInput) -> Dict[str, Any]:
    """
    Start a signature workflow for document signing.
    
    This tool starts a signature workflow for collecting signatures on a document.
    It supports various workflow types and compliance levels.
    
    Args:
        input_data: SignatureWorkflowInput containing document_id, parties, etc.
        
    Returns:
        Dictionary with workflow instance ID and status
    """
    try:
        # Ensure orchestrator is initialized
        if not hasattr(orchestrator, "_initialized") or not orchestrator._initialized:
            await orchestrator.initialize()
            orchestrator._initialized = True
        
        # Start signature workflow
        result = await orchestrator.start_workflow(
            workflow_id="signature",
            input_data={
                "document_id": input_data.document_id,
                "workflow_type": input_data.workflow_type,
                "parties": input_data.parties,
                "signature_fields": input_data.signature_fields,
                "compliance_level": input_data.compliance_level
            }
        )
        
        return result
    except Exception as e:
        logger.error(f"Error starting signature workflow: {e}")
        return {"status": "error", "error": str(e)}


# Document Workflow Tools
class DocumentWorkflowInput(BaseModel):
    """Input for document workflow."""
    document_path: str = Field(..., description="Path to document file")
    document_type: str = Field(..., description="Type of document (contract, agreement, etc.)")
    compliance_frameworks: List[str] = Field(default=["ETA_2019"], description="Compliance frameworks to check")
    user_id: str = Field(..., description="User ID for audit trail")


async def start_document_workflow_tool(input_data: DocumentWorkflowInput) -> Dict[str, Any]:
    """
    Start a document workflow for document processing.
    
    This tool starts a document workflow for processing and analyzing a document.
    It supports various document types and compliance frameworks.
    
    Args:
        input_data: DocumentWorkflowInput containing document_path, document_type, etc.
        
    Returns:
        Dictionary with workflow instance ID and status
    """
    try:
        # Ensure orchestrator is initialized
        if not hasattr(orchestrator, "_initialized") or not orchestrator._initialized:
            await orchestrator.initialize()
            orchestrator._initialized = True
        
        # Start document workflow
        result = await orchestrator.start_workflow(
            workflow_id="document",
            input_data={
                "document_path": input_data.document_path,
                "document_type": input_data.document_type,
                "compliance_frameworks": input_data.compliance_frameworks,
                "user_id": input_data.user_id
            }
        )
        
        return result
    except Exception as e:
        logger.error(f"Error starting document workflow: {e}")
        return {"status": "error", "error": str(e)}
