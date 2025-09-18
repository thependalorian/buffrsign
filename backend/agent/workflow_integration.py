"""
Workflow integration for the Neo4j agent.
Connects the Neo4j agent with existing LangGraph workflows and other workflow systems.
"""

import logging
from typing import Dict, Any, List, Optional
import asyncio
import uuid
from datetime import datetime

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class WorkflowAdapter:
    """Base adapter for workflow integration."""
    
    def __init__(self, workflow_id: str, workflow_instance):
        self.workflow_id = workflow_id
        self.workflow_instance = workflow_instance
        self.state = {"status": "initialized", "last_update": datetime.utcnow().isoformat()}
        
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the workflow."""
        raise NotImplementedError("Subclasses must implement the execute method")
        
    async def get_status(self) -> Dict[str, Any]:
        """Get the status of the workflow."""
        return self.state


class KYCWorkflowAdapter(WorkflowAdapter):
    """Adapter for KYC workflow."""
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the KYC workflow."""
        try:
            # Update state
            self.state["status"] = "executing"
            self.state["last_update"] = datetime.utcnow().isoformat()
            
            # Extract relevant data
            user_id = input_data.get("user_id")
            document_id = input_data.get("document_id")
            document_type = input_data.get("document_type", "national_id")
            country_code = input_data.get("country_hint")
            
            # Import KYC workflow
            try:
                from ..ai_services.workflows.kyc_workflow import kyc_workflow_engine
                from ..api.kyc_routes import KYCWorkflowRequest
            except ImportError:
                logger.error("KYC workflow not available")
                self.state["status"] = "error"
                self.state["error"] = "KYC workflow not available"
                return {"status": "error", "error": "KYC workflow not available"}
            
            # Create KYC workflow request
            kyc_request = KYCWorkflowRequest(
                user_id=user_id,
                document_id=document_id,
                document_type=document_type,
                country_code=country_code
            )
            
            # Start KYC workflow
            workflow_id = await kyc_workflow_engine.start_workflow(kyc_request)
            
            # Update state
            self.state["status"] = "started"
            self.state["workflow_id"] = workflow_id
            self.state["last_update"] = datetime.utcnow().isoformat()
            
            return {
                "status": "started",
                "workflow_id": workflow_id
            }
            
        except Exception as e:
            logger.error(f"Error executing KYC workflow: {e}")
            self.state["status"] = "error"
            self.state["error"] = str(e)
            return {"status": "error", "error": str(e)}
            
    async def get_status(self) -> Dict[str, Any]:
        """Get the status of the KYC workflow."""
        try:
            if "workflow_id" not in self.state:
                return self.state
                
            # Import KYC workflow
            try:
                from ..ai_services.workflows.kyc_workflow import kyc_workflow_engine
            except ImportError:
                logger.error("KYC workflow not available")
                return self.state
                
            # Get workflow status
            status = await kyc_workflow_engine.get_workflow_status(self.state["workflow_id"])
            
            # Update state
            self.state["status"] = status.get("status", self.state["status"])
            self.state["details"] = status
            self.state["last_update"] = datetime.utcnow().isoformat()
            
            return self.state
            
        except Exception as e:
            logger.error(f"Error getting KYC workflow status: {e}")
            return self.state


class SignatureWorkflowAdapter(WorkflowAdapter):
    """Adapter for signature workflow."""
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the signature workflow."""
        try:
            # Update state
            self.state["status"] = "executing"
            self.state["last_update"] = datetime.utcnow().isoformat()
            
            # Extract relevant data
            document_id = input_data.get("document_id")
            workflow_type = input_data.get("workflow_type", "sequential")
            parties = input_data.get("parties", [])
            signature_fields = input_data.get("signature_fields", [])
            compliance_level = input_data.get("compliance_level", "standard")
            
            # Import signature workflow
            try:
                from ..ai_services.workflows.buffrsign_workflow import BuffrSignWorkflow
            except ImportError:
                logger.error("Signature workflow not available")
                self.state["status"] = "error"
                self.state["error"] = "Signature workflow not available"
                return {"status": "error", "error": "Signature workflow not available"}
            
            # Create workflow instance
            workflow_instance_id = str(uuid.uuid4())
            workflow = BuffrSignWorkflow(workflow_instance_id)
            
            # Execute workflow
            result = await workflow.execute_signature_workflow(
                document_id=document_id,
                workflow_type=workflow_type,
                parties=parties,
                signature_fields=signature_fields,
                compliance_level=compliance_level
            )
            
            # Update state
            self.state["status"] = "completed"
            self.state["result"] = result
            self.state["last_update"] = datetime.utcnow().isoformat()
            
            return {
                "status": "completed",
                "result": result
            }
            
        except Exception as e:
            logger.error(f"Error executing signature workflow: {e}")
            self.state["status"] = "error"
            self.state["error"] = str(e)
            return {"status": "error", "error": str(e)}


class DocumentWorkflowAdapter(WorkflowAdapter):
    """Adapter for document workflow."""
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the document workflow."""
        try:
            # Update state
            self.state["status"] = "executing"
            self.state["last_update"] = datetime.utcnow().isoformat()
            
            # Extract relevant data
            document_path = input_data.get("document_path")
            document_type = input_data.get("document_type")
            compliance_frameworks = input_data.get("compliance_frameworks", ["ETA_2019"])
            user_id = input_data.get("user_id")
            
            # Try to import document workflow
            try:
                from ..workflow.orchestrator import workflow_orchestrator, WorkflowRequest, WorkflowType
            except ImportError:
                logger.error("Document workflow not available")
                self.state["status"] = "error"
                self.state["error"] = "Document workflow not available"
                return {"status": "error", "error": "Document workflow not available"}
            
            # Create workflow request
            request = WorkflowRequest(
                workflow_type=WorkflowType.DOCUMENT_ANALYSIS,
                user_id=user_id,
                parameters={
                    "document_path": document_path,
                    "document_type": document_type,
                    "compliance_frameworks": compliance_frameworks
                }
            )
            
            # Start workflow
            workflow = await workflow_orchestrator.create_workflow(request)
            
            # Update state
            self.state["status"] = "started"
            self.state["workflow_id"] = workflow.workflow_id
            self.state["last_update"] = datetime.utcnow().isoformat()
            
            return {
                "status": "started",
                "workflow_id": workflow.workflow_id
            }
            
        except Exception as e:
            logger.error(f"Error executing document workflow: {e}")
            self.state["status"] = "error"
            self.state["error"] = str(e)
            return {"status": "error", "error": str(e)}
            
    async def get_status(self) -> Dict[str, Any]:
        """Get the status of the document workflow."""
        try:
            if "workflow_id" not in self.state:
                return self.state
                
            # Import workflow orchestrator
            try:
                from ..workflow.orchestrator import workflow_orchestrator
            except ImportError:
                logger.error("Document workflow not available")
                return self.state
                
            # Get workflow status
            status = await workflow_orchestrator.get_workflow_status(self.state["workflow_id"])
            
            # Update state
            if status:
                self.state["status"] = str(status.status)
                self.state["details"] = {
                    "steps": [{"name": step.name, "status": str(step.status)} for step in status.steps],
                    "completed_at": status.completed_at.isoformat() if status.completed_at else None,
                    "result": status.result
                }
            
            self.state["last_update"] = datetime.utcnow().isoformat()
            
            return self.state
            
        except Exception as e:
            logger.error(f"Error getting document workflow status: {e}")
            return self.state


# Factory function to create workflow adapters
def create_workflow_adapter(workflow_type: str, workflow_instance=None) -> WorkflowAdapter:
    """Create a workflow adapter for the given workflow type."""
    if workflow_type == "kyc":
        return KYCWorkflowAdapter(workflow_type, workflow_instance)
    elif workflow_type == "signature":
        return SignatureWorkflowAdapter(workflow_type, workflow_instance)
    elif workflow_type == "document":
        return DocumentWorkflowAdapter(workflow_type, workflow_instance)
    else:
        raise ValueError(f"Unknown workflow type: {workflow_type}")
