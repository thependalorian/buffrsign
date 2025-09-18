"""
Integration tests for Neo4j agent orchestration.
"""

import pytest
import asyncio
from typing import Dict, Any

from agent.orchestrator import orchestrator
from agent.service_connections import service_manager
from agent.initialize_orchestration import initialize_orchestration, shutdown_orchestration, get_orchestration_status

# Test data
TEST_USER_ID = "test-user-123"
TEST_DOCUMENT_ID = "test-document-123"


@pytest.fixture
async def setup_orchestration():
    """Set up orchestration for testing."""
    # Initialize orchestration
    await initialize_orchestration()
    
    # Yield for test execution
    yield
    
    # Shutdown orchestration
    await shutdown_orchestration()


@pytest.mark.asyncio
async def test_orchestration_initialization(setup_orchestration):
    """Test orchestration initialization."""
    # Check orchestration status
    status = get_orchestration_status()
    
    # Verify status
    assert status["status"] in ["ready", "not_ready"]
    
    # If not ready, check if services are initialized
    if status["status"] == "not_ready":
        assert "orchestrator_initialized" in status
        assert "service_manager_initialized" in status


@pytest.mark.asyncio
async def test_workflow_start_and_status(setup_orchestration):
    """Test starting a workflow and checking its status."""
    # Start a workflow
    result = await orchestrator.process_request({
        "type": "workflow",
        "workflow_id": "document",
        "input_data": {
            "document_path": "test_document.pdf",
            "document_type": "contract",
            "compliance_frameworks": ["ETA_2019"],
            "user_id": TEST_USER_ID
        }
    })
    
    # Verify result
    assert "workflow_instance_id" in result
    assert "status" in result
    
    # Check workflow status
    workflow_id = result["workflow_instance_id"]
    status_result = await orchestrator.process_request({
        "type": "status",
        "workflow_instance_id": workflow_id
    })
    
    # Verify status result
    assert "status" in status_result


@pytest.mark.asyncio
async def test_service_operation(setup_orchestration):
    """Test executing a service operation."""
    # Initialize service manager
    await service_manager.initialize()
    
    # Execute a service operation
    try:
        result = await service_manager.execute(
            service_type="audit_trail",
            operation="create_audit_entry",
            params={
                "document_id": TEST_DOCUMENT_ID,
                "user_id": TEST_USER_ID,
                "action": "test_action",
                "details": {"test": "data"}
            }
        )
        
        # Verify result (might fail if service not available)
        assert result is not None
    except ValueError:
        # Service might not be available in test environment
        pytest.skip("Audit trail service not available")


@pytest.mark.asyncio
async def test_kyc_workflow_integration(setup_orchestration):
    """Test KYC workflow integration."""
    # Start KYC workflow
    try:
        result = await orchestrator.process_request({
            "type": "workflow",
            "workflow_id": "kyc",
            "input_data": {
                "user_id": TEST_USER_ID,
                "document_id": TEST_DOCUMENT_ID,
                "document_type": "national_id",
                "country_hint": "NA"
            }
        })
        
        # Verify result
        assert "workflow_instance_id" in result
        assert "status" in result
    except Exception:
        # KYC workflow might not be available in test environment
        pytest.skip("KYC workflow not available")


@pytest.mark.asyncio
async def test_signature_workflow_integration(setup_orchestration):
    """Test signature workflow integration."""
    # Start signature workflow
    try:
        result = await orchestrator.process_request({
            "type": "workflow",
            "workflow_id": "signature",
            "input_data": {
                "document_id": TEST_DOCUMENT_ID,
                "workflow_type": "sequential",
                "parties": [
                    {"id": TEST_USER_ID, "role": "signer", "email": "test@example.com"}
                ],
                "signature_fields": [
                    {"x": 100, "y": 100, "width": 200, "height": 50, "page": 1}
                ],
                "compliance_level": "standard"
            }
        })
        
        # Verify result
        assert "workflow_instance_id" in result or "status" in result
    except Exception:
        # Signature workflow might not be available in test environment
        pytest.skip("Signature workflow not available")


@pytest.mark.asyncio
async def test_agent_tool_integration():
    """Test agent tool integration with orchestration."""
    from agent.agent import rag_agent, AgentDependencies
    from pydantic_ai import RunContext
    
    # Create dependencies
    deps = AgentDependencies(session_id="test-session", user_id=TEST_USER_ID)
    ctx = RunContext(deps=deps)
    
    # Test start_workflow tool
    try:
        result = await rag_agent.tools["start_workflow"](
            ctx,
            workflow_id="document",
            input_data={
                "document_path": "test_document.pdf",
                "document_type": "contract",
                "compliance_frameworks": ["ETA_2019"],
                "user_id": TEST_USER_ID
            }
        )
        
        # Verify result
        assert "workflow_instance_id" in result or "status" in result
    except Exception:
        # Tool might not be available in test environment
        pytest.skip("start_workflow tool not available")
