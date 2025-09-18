"""
Workflow API routes for BuffrSign

This module provides REST API endpoints for workflow management:
- Create workflows
- Check workflow status
- List workflows
- Cancel workflows
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse

from workflow.orchestrator import (
    workflow_orchestrator,
    WorkflowRequest,
    WorkflowResponse,
    WorkflowType,
    WorkflowStatus
)

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/create", response_model=WorkflowResponse)
async def create_workflow(
    request: WorkflowRequest,
    current_user: dict = Depends(lambda: {"user_id": "test_user"})
):
    """Create a new workflow."""
    try:
        # Set user ID from authenticated user
        request.user_id = current_user["user_id"]
        
        logger.info(f"Creating workflow of type {request.workflow_type} for user {request.user_id}")
        
        workflow = await workflow_orchestrator.create_workflow(request)
        
        return workflow
        
    except Exception as e:
        logger.error(f"Failed to create workflow: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create workflow: {str(e)}"
        )

@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow_status(
    workflow_id: str,
    current_user: dict = Depends(lambda: {"user_id": "test_user"})
):
    """Get workflow status by ID."""
    try:
        workflow = await workflow_orchestrator.get_workflow_status(workflow_id)
        
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found"
            )
        
        return workflow
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get workflow status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workflow status: {str(e)}"
        )

@router.get("/", response_model=List[WorkflowResponse])
async def list_workflows(
    user_id: Optional[str] = None,
    status_filter: Optional[WorkflowStatus] = None,
    workflow_type: Optional[WorkflowType] = None,
    current_user: dict = Depends(lambda: {"user_id": "test_user"})
):
    """List workflows with optional filtering."""
    try:
        # Use authenticated user ID if not specified
        if not user_id:
            user_id = current_user["user_id"]
        
        workflows = await workflow_orchestrator.list_workflows(user_id)
        
        # Apply filters
        if status_filter:
            workflows = [w for w in workflows if w.status == status_filter]
        
        if workflow_type:
            workflows = [w for w in workflows if w.workflow_type == workflow_type]
        
        return workflows
        
    except Exception as e:
        logger.error(f"Failed to list workflows: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list workflows: {str(e)}"
        )

@router.delete("/{workflow_id}")
async def cancel_workflow(
    workflow_id: str,
    current_user: dict = Depends(lambda: {"user_id": "test_user"})
):
    """Cancel a workflow."""
    try:
        success = await workflow_orchestrator.cancel_workflow(workflow_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found or already completed"
            )
        
        return {"message": f"Workflow {workflow_id} cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel workflow: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel workflow: {str(e)}"
        )

@router.get("/types/", response_model=List[str])
async def get_workflow_types():
    """Get available workflow types."""
    return [workflow_type.value for workflow_type in WorkflowType]

@router.get("/statuses/", response_model=List[str])
async def get_workflow_statuses():
    """Get available workflow statuses."""
    return [status.value for status in WorkflowStatus]

@router.get("/stats/")
async def get_workflow_stats(
    current_user: dict = Depends(lambda: {"user_id": "test_user"})
):
    """Get workflow statistics."""
    try:
        workflows = await workflow_orchestrator.list_workflows(current_user["user_id"])
        
        stats = {
            "total_workflows": len(workflows),
            "active_workflows": len([w for w in workflows if w.status == WorkflowStatus.PROCESSING]),
            "completed_workflows": len([w for w in workflows if w.status == WorkflowStatus.COMPLETED]),
            "failed_workflows": len([w for w in workflows if w.status == WorkflowStatus.FAILED]),
            "cancelled_workflows": len([w for w in workflows if w.status == WorkflowStatus.CANCELLED]),
            "by_type": {},
            "by_status": {}
        }
        
        # Count by type
        for workflow_type in WorkflowType:
            stats["by_type"][workflow_type.value] = len([
                w for w in workflows if w.workflow_type == workflow_type
            ])
        
        # Count by status
        for status in WorkflowStatus:
            stats["by_status"][status.value] = len([
                w for w in workflows if w.status == status
            ])
        
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get workflow stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workflow stats: {str(e)}"
        )
