"""
CLI Integration Service for BuffrSign

This module provides integration between the CLI and the main API,
allowing CLI commands to be executed through the workflow orchestrator.
"""

import asyncio
import logging
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
import aiohttp

from workflow.orchestrator import workflow_orchestrator, WorkflowRequest, WorkflowType

logger = logging.getLogger(__name__)

class CLIIntegrationService:
    """Service for integrating CLI with the main API."""
    
    def __init__(self, api_base_url: str = "http://localhost:8000"):
        """Initialize CLI integration service."""
        self.api_base_url = api_base_url.rstrip('/')
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
    
    async def execute_cli_command(self, command: str, user_id: str = "cli_user") -> Dict[str, Any]:
        """Execute a CLI command through the API."""
        try:
            logger.info(f"Executing CLI command: {command}")
            
            # Parse command and determine workflow type
            workflow_type = self._parse_command_to_workflow_type(command)
            
            # Create workflow request
            request = WorkflowRequest(
                workflow_type=workflow_type,
                user_id=user_id,
                parameters={"cli_command": command}
            )
            
            # Create workflow
            workflow = await workflow_orchestrator.create_workflow(request)
            
            # Wait for completion (with timeout)
            result = await self._wait_for_workflow_completion(workflow.workflow_id, timeout=300)
            
            return {
                "success": True,
                "workflow_id": workflow.workflow_id,
                "command": command,
                "result": result,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"CLI command execution failed: {e}")
            return {
                "success": False,
                "command": command,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def _parse_command_to_workflow_type(self, command: str) -> WorkflowType:
        """Parse CLI command to determine workflow type."""
        command_lower = command.lower()
        
        if any(word in command_lower for word in ["analyze", "analysis", "document", "extract"]):
            return WorkflowType.DOCUMENT_ANALYSIS
        elif any(word in command_lower for word in ["sign", "signature", "signing"]):
            return WorkflowType.SIGNATURE_PROCESS
        elif any(word in command_lower for word in ["compliance", "check", "validate", "eta", "internal"]):
            return WorkflowType.COMPLIANCE_CHECK
        elif any(word in command_lower for word in ["template", "generate", "create"]):
            return WorkflowType.TEMPLATE_GENERATION
        elif any(word in command_lower for word in ["batch", "bulk", "multiple"]):
            return WorkflowType.BATCH_PROCESSING
        else:
            # Default to document analysis
            return WorkflowType.DOCUMENT_ANALYSIS
    
    async def _wait_for_workflow_completion(self, workflow_id: str, timeout: int = 300) -> Dict[str, Any]:
        """Wait for workflow completion with timeout."""
        start_time = datetime.utcnow()
        
        while True:
            # Check if timeout exceeded
            elapsed = (datetime.utcnow() - start_time).total_seconds()
            if elapsed > timeout:
                raise TimeoutError(f"Workflow {workflow_id} timed out after {timeout} seconds")
            
            # Get workflow status
            workflow = await workflow_orchestrator.get_workflow_status(workflow_id)
            
            if not workflow:
                raise ValueError(f"Workflow {workflow_id} not found")
            
            if workflow.status in ["completed", "failed", "cancelled"]:
                return {
                    "status": workflow.status,
                    "steps": [step.dict() for step in workflow.steps],
                    "result": workflow.result,
                    "error_message": workflow.error_message,
                    "duration": (workflow.completed_at - workflow.created_at).total_seconds() if workflow.completed_at else None
                }
            
            # Wait before checking again
            await asyncio.sleep(2)
    
    async def get_api_health(self) -> Dict[str, Any]:
        """Check API health status."""
        try:
            if not self.session:
                raise RuntimeError("Session not initialized")
            
            async with self.session.get(f"{self.api_base_url}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "status": "healthy",
                        "api_status": data.get("status"),
                        "version": data.get("version"),
                        "timestamp": data.get("timestamp")
                    }
                else:
                    return {
                        "status": "unhealthy",
                        "http_status": response.status,
                        "error": f"HTTP {response.status}"
                    }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def list_workflows(self, user_id: str = "cli_user") -> List[Dict[str, Any]]:
        """List workflows for a user."""
        try:
            workflows = await workflow_orchestrator.list_workflows(user_id)
            return [workflow.dict() for workflow in workflows]
        except Exception as e:
            logger.error(f"Failed to list workflows: {e}")
            return []
    
    async def get_workflow_details(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed workflow information."""
        try:
            workflow = await workflow_orchestrator.get_workflow_status(workflow_id)
            return workflow.dict() if workflow else None
        except Exception as e:
            logger.error(f"Failed to get workflow details: {e}")
            return None

# CLI command handlers
class CLICommandHandlers:
    """Handlers for specific CLI commands."""
    
    @staticmethod
    async def analyze_document(document_path: str, user_id: str = "cli_user") -> Dict[str, Any]:
        """Handle document analysis command."""
        async with CLIIntegrationService() as cli_service:
            command = f"analyze document {document_path}"
            return await cli_service.execute_cli_command(command, user_id)
    
    @staticmethod
    async def check_compliance(document_path: str, user_id: str = "cli_user") -> Dict[str, Any]:
        """Handle compliance check command."""
        async with CLIIntegrationService() as cli_service:
            command = f"check compliance {document_path}"
            return await cli_service.execute_cli_command(command, user_id)
    
    @staticmethod
    async def create_signature_workflow(document_path: str, signers: List[str], user_id: str = "cli_user") -> Dict[str, Any]:
        """Handle signature workflow creation command."""
        async with CLIIntegrationService() as cli_service:
            signers_str = ",".join(signers)
            command = f"create signature workflow {document_path} signers:{signers_str}"
            return await cli_service.execute_cli_command(command, user_id)
    
    @staticmethod
    async def list_user_workflows(user_id: str = "cli_user") -> List[Dict[str, Any]]:
        """Handle list workflows command."""
        async with CLIIntegrationService() as cli_service:
            return await cli_service.list_workflows(user_id)
    
    @staticmethod
    async def get_workflow_status(workflow_id: str) -> Optional[Dict[str, Any]]:
        """Handle get workflow status command."""
        async with CLIIntegrationService() as cli_service:
            return await cli_service.get_workflow_details(workflow_id)

# Utility functions for CLI
async def execute_cli_command_sync(command: str, user_id: str = "cli_user") -> Dict[str, Any]:
    """Synchronous wrapper for CLI command execution."""
    async with CLIIntegrationService() as cli_service:
        return await cli_service.execute_cli_command(command, user_id)

def run_cli_command(command: str, user_id: str = "cli_user") -> Dict[str, Any]:
    """Run CLI command synchronously."""
    return asyncio.run(execute_cli_command_sync(command, user_id))
